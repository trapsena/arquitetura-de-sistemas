const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

// POST /payments/confirmar
const confirmarPagamento = async (req, res) => {
  const { pedidoId, valorPago, pagamentos } = req.body;

  if (!pedidoId) {
    return res.status(400).json({ erro: 'ID do pedido inválido' });
  }
  if (typeof valorPago !== 'number') {
    return res.status(400).json({ erro: 'Valor pago inválido' });
  }
  if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({ erro: 'Pagamentos inválidos' });
  }

  try {

    // 1) Buscar pedido via microserviço de pedidos
    let pedido;
    try {
      const resPedido = await axios.get(`http://localhost:3004/orders/${pedidoId}`);
      pedido = resPedido.data;
    } catch (err) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // 2) Salvar pagamentos no Postgres
    for (const p of pagamentos) {
      await prisma.pagamento.create({
        data: {
          pedidoId: pedidoId.toString(),
          metodo: p.metodo,
          valor: p.valor,
          status: p.status
        }
      });
    }

    // 3) Verifica se algum pagamento falhou
    const falhou = pagamentos.some(p => p.status === 'FALHA');
    if (falhou) {
      pedido.status = 'CANCELADO';
      await pedido.save();
      return res.status(400).json({ erro: 'Pagamento falhou. Pedido cancelado.' });
    }

    // 4) Verifica se o valor pago cobre o total
    if (valorPago < pedido.total) {
      return res.status(400).json({
        erro: `Valor insuficiente. Total do pedido: R$ ${pedido.total.toFixed(
          2
        )}, valor pago: R$ ${valorPago.toFixed(2)}`
      });
    }


    // 5) Atualizar status do pedido para PAGO via microserviço de pedidos (exemplo PATCH)
    try {
      await axios.patch(`http://localhost:3004/orders/${pedidoId}`, { status: 'PAGO' });
      pedido.status = 'PAGO';
    } catch (err) {
      // Se não conseguir atualizar, apenas loga
      console.error('Falha ao atualizar status do pedido:', err.message);
    }

    // 6) Atualizar estoque dos produtos no microserviço de produtos
    for (const item of pedido.itens) {
      await axios.patch(`http://localhost:3001/products/${item.produtoId}/estoque`, {
        quantidade: item.quantidade
      });
    }

    res.json({
      mensagem: 'Pagamento confirmado e pedido atualizado para PAGO',
      pedido
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao confirmar pagamento', detalhe: error.message });
  }
};

module.exports = { confirmarPagamento };
