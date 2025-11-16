const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const amqp = require('amqplib');
const prisma = new PrismaClient();
const api = require('../config/axios');

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672';
const EXCHANGE_NAME = 'transacoes_durable_exchange';
const ROUTING_KEY = 'transacao.critica';

async function publishEvent(transacao) {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
    channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(transacao)), {
      persistent: true, // garante que não se perca se o broker cair
    });

    console.log(`📤 Evento enviado para auditoria: ${transacao.status.toUpperCase()} | Pedido ${transacao.pedidoId}`);

    await channel.close();
    await connection.close();
  } catch (err) {
    console.error('❌ Falha ao enviar evento para RabbitMQ:', err.message);
  }
}

// POST /payments/confirmar
const confirmarPagamento = async (req, res) => {
  const { pedidoId, pagamentos } = req.body;

  if (!pedidoId) return res.status(400).json({ erro: 'ID do pedido inválido' });
  if (!Array.isArray(pagamentos) || pagamentos.length === 0)
    return res.status(400).json({ erro: 'Pagamentos inválidos' });

  try {
    // 1) Buscar pedido
    let pedido;
    try {
      const resPedido = await api.get(`/orders/${pedidoId}`);
      pedido = resPedido.data;
      if (pedido.status === 'PAGO') {
        return res.status(409).json({ erro: 'Pedido já está pago.' });
      }
    } catch {
      await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      return res.status(404).json({ erro: 'Pedido não encontrado. Cancelado.' });
    }

    // 2) Criar pagamentos PENDENTES
    for (const p of pagamentos) {
      await prisma.pagamento.create({
        data: { pedidoId: pedidoId.toString(), metodo: p.metodo, valor: p.valor, status: 'PENDENTE' }
      });
    }

    // 3) Validar valores
    const totalPago = pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
    const valorTotalPedido = pedido.total || 0;

    if (totalPago < valorTotalPedido) {
      await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      await prisma.pagamento.updateMany({
        where: { pedidoId: pedidoId.toString() },
        data: { status: 'RECUSADO' }
      });

      await publishEvent({
        pedidoId,
        status: 'RECUSADO',
        motivo: 'Valor pago menor que o valor total do pedido',
        totalPago,
        valorTotalPedido
      });

      return res.status(400).json({
        erro: `Valor pago insuficiente (${totalPago}) < total do pedido (${valorTotalPedido}). Pedido cancelado.`,
      });
    }

    const metodoUsado = pagamentos[0]?.metodo || 'desconhecido';

    // 4) Atualizar pedido e pagamentos
    await api.patch(`/orders/${pedidoId}`, { status: 'PAGO', metodoPagamento: metodoUsado });
    await prisma.pagamento.updateMany({
      where: { pedidoId: pedidoId.toString() },
      data: { status: 'PAGO' }
    });

    // 5) Atualizar estoque
    for (const item of pedido.itens) {
      await axios.patch(`http://api-produtos:3001/products/${item.produtoId}/estoque`, {
        quantidade: -item.quantidade
      });
    }

    // 6) Enviar evento de sucesso ao RabbitMQ
    await publishEvent({
      pedidoId,
      status: 'PAGO',
      metodo: metodoUsado,
      total: valorTotalPedido,
      timestamp: new Date().toISOString()
    });

    res.json({ mensagem: 'Pagamento confirmado e pedido atualizado para PAGO', pedido });

  } catch (error) {
    console.error('❌ Erro inesperado no pagamento:', error.message);

    try {
      await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      await prisma.pagamento.updateMany({
        where: { pedidoId: pedidoId.toString() },
        data: { status: 'CANCELADO' }
      });
    } catch (_) {}

    await publishEvent({
      pedidoId,
      status: 'CANCELADO',
      motivo: error.message || 'Erro inesperado no processamento do pagamento'
    });

    res.status(500).json({ erro: 'Erro ao confirmar pagamento. Pedido cancelado.' });
  }
};

module.exports = { confirmarPagamento };
