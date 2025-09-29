
// PATCH /orders/:id - Atualizar status e método do pedido
const atualizarStatusPedido = async (req, res) => {
  const { id } = req.params;
  const { status, metodoPagamento } = req.body;

  try {
    const pedido = await Pedido.findById(id);
    if (!pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    if (status) pedido.status = status;
    if (metodoPagamento) pedido.metodoPagamento = metodoPagamento;

    await pedido.save();
    res.json({ mensagem: 'Pedido atualizado', pedido });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar pedido', detalhe: error.message });
  }
};
const axios = require("axios");
const Pedido = require("../models/Order");

// Função auxiliar para calcular total
const calcularTotal = (itens) => {
  return itens.reduce((acc, item) => acc + item.quantidade * item.produtoSnapshot.preco, 0);
};

// GET /orders
const listarPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find();
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar pedidos", detalhe: error.message });
  }
};

// GET /orders/:id
const buscarPedido = async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = await Pedido.findById(id);
    if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar pedido", detalhe: error.message });
  }
};

// POST /orders
const criarPedido = async (req, res) => {
  const { usuarioId, itens } = req.body;

  if (!usuarioId || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "Usuário ou itens inválidos" });
  }

  try {
    // Buscar usuário no microserviço de usuários
    let usuario;
    try {
      const resUser = await axios.get(`http://api-usuarios:3002/users/${usuarioId}`);
      usuario = resUser.data;
    } catch (err) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Buscar produtos no microserviço de produtos e validar estoque
    const itensComSnapshot = [];
    for (const item of itens) {
      let produto;
      try {
        const resProd = await axios.get(`http://api-produtos:3001/products/${item.produtoId}`);
        produto = resProd.data;
      } catch (err) {
        return res.status(404).json({ erro: `Produto ID ${item.produtoId} não encontrado` });
      }

      if (produto.estoque < item.quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}` });
      }

      itensComSnapshot.push({
        produtoId: produto.id,
        quantidade: item.quantidade,
        produtoSnapshot: {
          nome: produto.nome,
          preco: produto.preco
        }
      });
    }

    const total = calcularTotal(itensComSnapshot);

    const pedido = new Pedido({
      usuarioId,
      usuarioSnapshot: {
        nome: usuario.nome,
        email: usuario.email
      },
      itens: itensComSnapshot,
      total,
      status: "AGUARDANDO PAGAMENTO",
      metodoPagamento: null // definido após o pagamento
    });

    await pedido.save();

    res.status(201).json(pedido);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar pedido", detalhe: error.message });
  }
};

module.exports = {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatusPedido
};
