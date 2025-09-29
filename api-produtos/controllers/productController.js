const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /produtos
const listarProdutos = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar produtos', detalhe: error.message });
  }
};

// GET /produtos/:id
const buscarProduto = async (req, res) => {
  const { id } = req.params;
  try {
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(id) } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar produto', detalhe: error.message });
  }
};

// POST /produtos
const criarProduto = async (req, res) => {
  const { nome, preco, estoque } = req.body;
  try {
    const novoProduto = await prisma.produto.create({
      data: { nome, preco: parseFloat(preco), estoque: parseInt(estoque) }
    });
    res.status(201).json(novoProduto);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar produto', detalhe: error.message });
  }
};

// PUT /produtos/:id
const atualizarProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, preco } = req.body; // estoque removido daqui
  try {
    const produtoAtualizado = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: { nome, preco }
    });
    res.json(produtoAtualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar produto', detalhe: error.message });
  }
};

// DELETE /produtos/:id
const deletarProduto = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.produto.delete({ where: { id: parseInt(id) } });
    res.json({ mensagem: 'Produto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar produto', detalhe: error.message });
  }
};



// PATCH /products/:id/estoque
const atualizarEstoque = async (req, res) => {
  const { id } = req.params;
  const { quantidade } = req.body;

  if (!quantidade || quantidade <= 0) {
    return res.status(400).json({ erro: 'Quantidade inválida' });
  }

  try {
    const produto = await prisma.produto.findUnique({ where: { id: parseInt(id) } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    if (produto.estoque < quantidade) {
      return res.status(400).json({ erro: 'Estoque insuficiente' });
    }

    const atualizado = await prisma.produto.update({
      where: { id: parseInt(id) },
      data: { estoque: { decrement: quantidade } }
    });

    res.json(atualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar estoque', detalhe: error.message });
  }
};

module.exports = {
  atualizarEstoque
};


// Exportando todos os controllers
module.exports = {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  atualizarEstoque
};
