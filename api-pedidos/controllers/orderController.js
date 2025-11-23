const axios = require("axios");
const Pedido = require("../models/Order");
const { enviarPedidoKafka } = require("../kafka/producer");

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

const criarPedido = async (req, res) => {
  const { usuarioId, itens, metodoPagamento } = req.body;

  if (!usuarioId || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "Usuário ou itens inválidos" });
  }

  if (!metodoPagamento) {
    return res.status(400).json({ erro: "O campo metodoPagamento é obrigatório" });
  }

  try {
    // Buscar usuário
    let usuario;
    try {
      const resUser = await axios.get(`http://api-usuarios:3002/users/${usuarioId}`);
      usuario = resUser.data;
    } catch {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    // Buscar produtos e validar
    const itensComSnapshot = [];
    for (const item of itens) {
      let produto;
      try {
        const resProd = await axios.get(`http://api-produtos:3001/products/${item.produtoId}`);
        produto = resProd.data;
      } catch {
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

    // Calcular total
    const total = calcularTotal(itensComSnapshot);

    // Criar pedido no banco
    const pedido = new Pedido({
      usuarioId,
      usuarioSnapshot: {
        nome: usuario.nome,
        email: usuario.email
      },
      itens: itensComSnapshot,
      total,
      status: "AGUARDANDO PAGAMENTO",
      metodoPagamento
    });

    await pedido.save();

    // 🔥🔥 NOVO: Criar pagamento automaticamente no payment-service
    try {
      await axios.post("http://api-pagamentos:3003/payments", {
        pedidoId: pedido._id,
        pagamentos: [
          {
            metodo: metodoPagamento,
            valor: total
          }
        ]
      });
      console.log("💰 Pagamento PENDENTE criado no payment-service.");
    } catch (err) {
      console.error("❌ Erro ao criar pagamento no payment-service:", err.message);
    }

    // Enviar evento Kafka
    await enviarPedidoKafka({
      orderId: pedido._id,
      clientId: usuarioId,
      itens: itensComSnapshot,
      metodoPagamento,
      valor: total,
      quantidade: itens?.[0]?.quantidade ?? 1,
      date: new Date().toISOString(),
      total,
      paymentInfo: {
        metodo: metodoPagamento,
        valor: total
      }
    });

    res.status(201).json(pedido);
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    res.status(500).json({ erro: "Erro ao criar pedido", detalhe: error.message });
  }
};




const listarPedidosPorUsuario = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const pedidos = await Pedido.find({ usuarioId: Number(usuarioId) });
    if (!pedidos || pedidos.length === 0) {
      return res.status(404).json({ erro: "Nenhum pedido encontrado para este usuário" });
    }

    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar pedidos do usuário", detalhe: error.message });
  }
};

module.exports = {
  listarPedidos,
  buscarPedido,
  criarPedido,
  atualizarStatusPedido,
  listarPedidosPorUsuario
};
