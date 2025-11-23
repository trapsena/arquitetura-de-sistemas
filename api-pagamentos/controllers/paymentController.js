const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const amqp = require('amqplib');

const prisma = new PrismaClient();
const api = require('../config/axios');

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';

const EXCHANGE_NAME = 'transacoes_durable_exchange';
const ROUTING_KEY = 'transacao.critica';

/* -------------------------------------------------------
 * 📌 1) EVENTO PADRÃO DE TRANSAÇÃO (MESMO FORMATO PARA TUDO)
 * ------------------------------------------------------*/
function criarEventoTransacao({
  pedidoId,
  status,
  motivo = null,
  metodo = null,
  total = null,
  produtos = null,
}) {
  return {
    pedidoId,
    status,
    motivo,
    metodo,
    total,
    produtos,
    timestamp: new Date().toISOString(),
  };
}

/* -------------------------------------------------------
 * 📌 2) PUBLICAÇÃO NO RABBITMQ (AUDITORIA)
 * ------------------------------------------------------*/
async function publishEvent(evento) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    channel.publish(
      EXCHANGE_NAME,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(evento)),
      { persistent: true }
    );

    console.log(
      `📤 Evento enviado: ${evento.status} | Pedido ${evento.pedidoId}`
    );

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('❌ Falha ao enviar evento (RabbitMQ):', err.message);
  }
}

/* -------------------------------------------------------
 * 📌 3) LISTAR PAGAMENTOS
 * ------------------------------------------------------*/
const listarPagamentos = async (req, res) => {
  try {
    const pagamentos = await prisma.pagamento.findMany();
    res.json(pagamentos);
  } catch (error) {
    res
      .status(500)
      .json({ erro: 'Erro ao listar pagamentos', detalhe: error.message });
  }
};

/* -------------------------------------------------------
 * 📌 4) KAFKA → PROCESSAR EVENTO DE PAGAMENTO
 * ------------------------------------------------------*/
async function processarEventoDePagamento(evento) {
  const { orderId, paymentInfo } = evento;

  try {
    const orderRes = await axios.get(
      `http://api-pedidos:3004/orders/${orderId}`
    );
    const pedido = orderRes.data;

    // ❌ VALOR ERRADO
    if (paymentInfo.valor !== pedido.total) {
      const eventoTransacao = criarEventoTransacao({
        pedidoId: orderId,
        status: 'RECUSADO',
        motivo: 'Valor incorreto',
        total: paymentInfo.valor,
        metodo: paymentInfo.metodo,
      });

      await prisma.pagamento.create({
        data: {
          pedidoId: String(orderId),
          metodo: paymentInfo.metodo,
          valor: paymentInfo.valor,
          status: 'RECUSADO',
        },
      });

      await axios.patch(`http://api-pedidos:3004/orders/${orderId}`, {
        status: 'CANCELADO',
      });

      await publishEvent(eventoTransacao);
      return;
    }

    // ✔ PAGAMENTO ACEITO
    const eventoTransacao = criarEventoTransacao({
      pedidoId: orderId,
      status: 'PAGO',
      metodo: paymentInfo.metodo,
      total: paymentInfo.valor,
    });

    await prisma.pagamento.create({
      data: {
        pedidoId: String(orderId),
        metodo: paymentInfo.metodo,
        valor: paymentInfo.valor,
        status: 'PAGO',
      },
    });

    await axios.patch(`http://api-pedidos:3004/orders/${orderId}`, {
      status: 'PAGO',
      metodoPagamento: paymentInfo.metodo,
    });

    await publishEvent(eventoTransacao);
    console.log('✔ Pagamento processado via Kafka + auditoria enviada!');
  } catch (err) {
    console.error('❌ Erro ao processar evento Kafka:', err.message);
  }
}

/* -------------------------------------------------------
 * 📌 5) HTTP PATCH /payments/:id/process
 * ------------------------------------------------------*/
const processaPagamento = async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.pagamento.findUnique({
      where: { id: Number(id) },
    });
    if (!payment)
      return res.status(404).json({ error: 'Pagamento não encontrado' });

    const orderRes = await api.get(`/orders/${payment.pedidoId}`);
    const pedido = orderRes.data;

    let expectedAmount = 0;
    const productsDetails = [];

    // valida estoque + valor
    for (const item of pedido.itens) {
      const produto = (
        await axios.get(
          `http://api-produtos:3001/products/${item.produtoId}`
        )
      ).data;

      productsDetails.push({
        productId: produto.id,
        name: produto.nome,
        price: produto.preco,
        stock: produto.estoque,
        quantity: item.quantidade,
      });

      expectedAmount += produto.preco * item.quantidade;

      if (produto.estoque < item.quantidade) {
        const eventoTransacao = criarEventoTransacao({
          pedidoId: payment.pedidoId,
          status: 'RECUSADO',
          motivo: 'Estoque insuficiente',
          produtos: productsDetails,
        });

        await prisma.pagamento.update({
          where: { id: Number(id) },
          data: { status: 'CANCELADO' },
        });

        await api.patch(`/orders/${payment.pedidoId}`, {
          status: 'CANCELADO',
        });

        await publishEvent(eventoTransacao);

        return res.status(400).json({ error: 'Estoque insuficiente' });
      }
    }

    const diff = Math.abs(expectedAmount - payment.valor);
    if (diff > 0.01) {
      const eventoTransacao = criarEventoTransacao({
        pedidoId: payment.pedidoId,
        status: 'RECUSADO',
        motivo: 'Valor incorreto',
        total: payment.valor,
      });

      await prisma.pagamento.update({
        where: { id: Number(id) },
        data: { status: 'CANCELADO' },
      });

      await api.patch(`/orders/${payment.pedidoId}`, { status: 'CANCELADO' });

      await publishEvent(eventoTransacao);

      return res.status(400).json({
        error: 'Payment mismatch',
        expectedAmount,
        paid: payment.valor,
      });
    }

    // ✔ Atualiza estoque
    for (const item of productsDetails) {
      await axios.patch(
        `http://api-produtos:3001/products/${item.productId}/estoque`,
        { quantidade: -item.quantity }
      );
    }

    // ✔ Marca pagamento como pago
    await prisma.pagamento.update({
      where: { id: Number(id) },
      data: { status: 'PAGO' },
    });

    await api.patch(`/orders/${payment.pedidoId}`, {
      status: 'PAGO',
      metodoPagamento: payment.metodo,
    });

    const eventoTransacao = criarEventoTransacao({
      pedidoId: payment.pedidoId,
      status: 'PAGO',
      metodo: payment.metodo,
      total: expectedAmount,
      produtos: productsDetails,
    });

    await publishEvent(eventoTransacao);

    res.json({ message: 'Pagamento processado', id });
  } catch (err) {
    console.error('❌ ERRO:', err.message);
    res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
};

const criarPagamento = async (req, res) => {
  const { pedidoId, pagamentos } = req.body;

  if (!pedidoId || !Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({ error: 'pedidoId e pagamentos são obrigatórios' });
  }

  try {
    const created = [];

    for (const p of pagamentos) {
      const pg = await prisma.pagamento.create({
        data: {
          pedidoId: String(pedidoId),
          valor: p.valor,
          metodo: p.metodo,
          status: 'PENDENTE'
        }
      });

      created.push(pg);
    }

    return res.json({
      mensagem: 'Pagamentos criados com sucesso',
      pagamentos: created
    });

  } catch (err) {
    console.error('❌ Erro ao criar pagamento:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

/* -------------------------------------------------------
 * 📌 EXPORTS
 * ------------------------------------------------------*/
module.exports = {
  listarPagamentos,
  processaPagamento,
  processarEventoDePagamento,
  criarPagamento
};
  