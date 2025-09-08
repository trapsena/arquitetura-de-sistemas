const prisma = require('../prismaClient.js');

// GET /pedidos
const listarPedidos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        itens: { include: { produto: true } },
        usuario: true
      }
    });
    // Adiciona o campo total em cada pedido
    const pedidosComTotal = pedidos.map(pedido => {
      const total = pedido.itens.reduce((soma, item) => {
        return soma + (item.quantidade * (item.produto?.preco || 0));
      }, 0);
      return { ...pedido, total };
    });
    res.json(pedidosComTotal);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar pedidos', detalhe: error.message });
  }
};

// GET /pedidos/:id
const buscarPedido = async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(id) },
      include: {
        itens: { include: { produto: true } },
        usuario: true
      }
    });
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });
    // Calcula o total do pedido
    const total = pedido.itens.reduce((soma, item) => {
      return soma + (item.quantidade * (item.produto?.preco || 0));
    }, 0);
    res.json({ ...pedido, total });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar pedido', detalhe: error.message });
  }
};

// POST /pedidos
const criarPedido = async (req, res) => {
  const { usuarioId, itens } = req.body;

  if (!usuarioId || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'Usuário ou itens inválidos' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

    // Verifica estoque
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });
      if (!produto) return res.status(404).json({ erro: `Produto ${item.produtoId} não encontrado` });
      if (produto.estoque < item.quantidade) return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}` });
    }

    // Buscar preços dos produtos para calcular o total
    let total = 0;
    for (const item of itens) {
      const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });
      total += (produto?.preco || 0) * item.quantidade;
    }

    // Cria pedido com itens, total e decrementa estoque dentro de uma transação
    const pedido = await prisma.$transaction(async (tx) => {
      const novoPedido = await tx.pedido.create({
        data: {
          usuarioId,
          total,
          itens: {
            create: itens.map(item => ({
              produtoId: item.produtoId,
              quantidade: item.quantidade
            }))
          }
        },
        include: { itens: { include: { produto: true } }, usuario: true }
      });

      for (const item of itens) {
        await tx.produto.update({
          where: { id: item.produtoId },
          data: { estoque: { decrement: item.quantidade } }
        });
      }

      return novoPedido;
    });

    res.status(201).json(pedido);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar pedido', detalhe: error.message });
  }
};

const confirmarPagamento = async (req, res) => {
  const { pedidoId, valorPago, pagamentos } = req.body;

  if (!pedidoId || isNaN(parseInt(pedidoId))) {
    return res.status(400).json({ erro: 'ID do pedido inválido' });
  }

  if (typeof valorPago !== 'number' || isNaN(valorPago)) {
    return res.status(400).json({ erro: 'Valor pago inválido' });
  }

  if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({ erro: 'Pagamentos inválidos' });
  }

  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id: parseInt(pedidoId) }
    });

    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    // Verifica se algum pagamento falhou
    const falhou = pagamentos.some(p => p.status === 'FALHA');

    if (falhou) {
      await prisma.pedido.update({
        where: { id: parseInt(pedidoId) },
        data: { status: 'CANCELADO' }
      });
      return res.status(400).json({ erro: 'Pagamento falhou. Pedido cancelado.' });
    }

    if (valorPago < pedido.total) {
      return res.status(400).json({ erro: `Valor insuficiente. Total do pedido: R$ ${pedido.total.toFixed(2)}, valor pago: R$ ${valorPago.toFixed(2)}` });
    }

    const pedidoAtualizado = await prisma.pedido.update({
      where: { id: parseInt(pedidoId) },
      data: { status: 'PAGO' }
    });

    res.json({
      mensagem: 'Pedido atualizado para PAGO',
      pedido: pedidoAtualizado
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao confirmar pagamento', detalhe: error.message });
  }
};


module.exports = {
  listarPedidos,
  buscarPedido,
  criarPedido,
  confirmarPagamento
};
