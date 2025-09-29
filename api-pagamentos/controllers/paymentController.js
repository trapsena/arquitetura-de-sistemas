const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();
const api = require('../config/axios');

// POST /payments/confirmar
const confirmarPagamento = async (req, res) => {
  const { pedidoId, pagamentos } = req.body;

  if (!pedidoId) {
    return res.status(400).json({ erro: 'ID do pedido inválido' });
  }
  if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({ erro: 'Pagamentos inválidos' });
  }

  try {
    // 1) Buscar pedido via microserviço de pedidos
    let pedido;
    try {
      const resPedido = await api.get(`/orders/${pedidoId}`);
      pedido = resPedido.data;
      
      // Validação adicional: Verifica se o pedido já está PAGO
      if (pedido.status === 'PAGO') {
          return res.status(409).json({ erro: 'Pedido já está pago.' });
      }

    } catch (err) {
      try {
        await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      } catch (_) {}
      return res.status(404).json({ erro: 'Pedido não encontrado. Cancelado.' });
    }

    
    // 2) Salvar pagamentos no Postgres (Inicialmente PENDENTE)
    for (const p of pagamentos) {
      await prisma.pagamento.create({
        data: {
          pedidoId: pedidoId.toString(),
          metodo: p.metodo,
          valor: p.valor,
          status: 'PENDENTE' // sistema decide depois
        }
      });
    }

    // 2.5) Calcular valor total pago E VALIDAR contra o valor do pedido
    const totalPago = pagamentos.reduce((acc, p) => acc + (p.valor || 0), 0);
    // ⬇️ CORREÇÃO FEITA AQUI. Troque 'total' pelo nome real do campo no objeto 'pedido'
    const valorTotalPedido = pedido.total || 0; // EXEMPLO: usando 'pedido.total' com fallback para 0

    // *** PONTO CHAVE: VALIDAÇÃO DO VALOR ***
    // Usa toFixed(2) para garantir comparação correta de floats com 2 casas decimais
    if (parseFloat(totalPago).toFixed(2) !== parseFloat(valorTotalPedido).toFixed(2)) {
      console.error(`Falha na validação de valor. Pago: ${totalPago}, Pedido: ${valorTotalPedido}`);
      
      // Ação de cancelamento em caso de valores incorretos
      await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      await prisma.pagamento.updateMany({
        where: { pedidoId: pedidoId.toString() },
        data: { status: 'RECUSADO' } // Status mais apropriado
      });
      return res.status(400).json({ 
          erro: `Valor pago (${totalPago.toFixed(2)}) não corresponde ao valor do pedido (${valorTotalPedido.toFixed(2)}). Pedido cancelado.`,
          detalhe: 'Valores inconsistentes' 
      });
    }
    // *** FIM DA VALIDAÇÃO ***
    
    // 3) Definir método de pagamento
    const metodoUsado = pagamentos[0]?.metodo || "desconhecido";

    
    // 4) Atualizar status e método do pedido no Mongo e Pagamentos no Postgres
    try {
      await api.patch(`/orders/${pedidoId}`, { status: 'PAGO', metodoPagamento: metodoUsado });
      pedido.status = 'PAGO';
      pedido.metodoPagamento = metodoUsado;

      await prisma.pagamento.updateMany({
        where: { pedidoId: pedidoId.toString() },
        data: { status: 'PAGO' }
      });
    } catch (err) {
      console.error('Falha ao atualizar status do pedido:', err.message);
      await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      await prisma.pagamento.updateMany({
        where: { pedidoId: pedidoId.toString() },
        data: { status: 'CANCELADO' }
      });
      return res.status(500).json({ erro: 'Falha ao atualizar status do pedido. Cancelado.' });
    }


    // 5) Atualizar estoque dos produtos
    try {
      for (const item of pedido.itens) {
        await axios.patch(`http://api-produtos:3001/products/${item.produtoId}/estoque`, {
          quantidade: item.quantidade
        });
      }
    } catch (err) {
      console.error('Falha ao atualizar estoque:', err.message);
      // Rollback: Cancelar pedido e pagamentos em caso de falha no estoque
      await api.patch(`/orders/${pedidoId}`, { status: 'CANCELADO' });
      await prisma.pagamento.updateMany({
        where: { pedidoId: pedidoId.toString() },
        data: { status: 'CANCELADO' }
      });
      return res.status(500).json({ erro: 'Falha ao atualizar estoque. Pedido cancelado.' });
    }

    res.json({
      mensagem: 'Pagamento confirmado e pedido atualizado para PAGO',
      pedido
    });
  } catch (error) {
    console.error(error);
    // Rollback genérico em caso de falha inesperada
    try {
      await api.patch(`/orders/${req.body.pedidoId}`, { status: 'CANCELADO' });
      await prisma.pagamento.updateMany({
        where: { pedidoId: req.body.pedidoId.toString() },
        data: { status: 'CANCELADO' }
      });
    } catch (_) {}
    res.status(500).json({ erro: 'Erro ao confirmar pagamento. Pedido cancelado.', detalhe: error.message });
  }
};

module.exports = { confirmarPagamento };