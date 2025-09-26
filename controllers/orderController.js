const axios = require('axios');

// Funções auxiliares para checar usuário e produto em outros serviços
async function checarUsuario(usuarioId) {
  try {
    const res = await axios.get(`http://localhost:3002/users/${usuarioId}`);
    return res.data;
  } catch (err) {
    return null;
  }
}

async function checarProduto(produtoId) {
  try {
    const res = await axios.get(`http://localhost:3001/products/${produtoId}`);
    return res.data;
  } catch (err) {
    return null;
  }
}
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

  try {
    // Checa usuário via API de usuários
    const usuario = await checarUsuario(usuarioId);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Checa produtos via API de produtos
    for (const item of itens) {
      const produto = await checarProduto(item.produtoId);
      if (!produto) {
        return res.status(404).json({ erro: `Produto ID ${item.produtoId} não encontrado` });
      }
      if (produto.estoque < item.quantidade) {
        return res.status(400).json({ erro: `Estoque insuficiente para ${produto.nome}` });
      }
    }

    // Aqui você criaria o pedido no seu banco de pedidos (MongoDB, etc)
    // Exemplo de resposta simulada:
    return res.status(201).json({
      mensagem: 'Pedido criado com sucesso (simulado)',
      usuarioId,
      itens
    });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar pedido', detalhe: error.message });
  }
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

  if (!pedidoId) {
    return res.status(400).json({ erro: 'ID do pedido inválido' });
  }

  if (typeof valorPago !== 'number' || isNaN(valorPago)) {
    return res.status(400).json({ erro: 'Valor pago inválido' });
  }

  if (!Array.isArray(pagamentos) || pagamentos.length === 0) {
    return res.status(400).json({ erro: 'Pagamentos inválidos' });
  }

  try {
    // Buscar pedido via microserviço de pedidos
    let pedido;
    try {
      const resPedido = await axios.get(`http://localhost:3004/orders/${pedidoId}`);
      pedido = resPedido.data;
    } catch (err) {
      return res.status(404).json({ erro: 'Pedido não encontrado' });
    }

    // Verifica se algum pagamento falhou
    const falhou = pagamentos.some(p => p.status === 'FALHA');

    if (falhou) {
      // Aqui você pode chamar uma rota PATCH/PUT do serviço de pedidos para atualizar o status, se desejar
      return res.status(400).json({ erro: 'Pagamento falhou. Pedido cancelado.' });
    }

    if (valorPago < pedido.total) {
      return res.status(400).json({ erro: `Valor insuficiente. Total do pedido: R$ ${pedido.total?.toFixed(2) || 0}, valor pago: R$ ${valorPago.toFixed(2)}` });
    }

    // Aqui você pode chamar uma rota PATCH/PUT do serviço de pedidos para atualizar o status para PAGO, se desejar
    res.json({
      mensagem: 'Pedido atualizado para PAGO',
      pedido: pedido
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
