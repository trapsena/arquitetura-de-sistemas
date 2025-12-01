const { cacheMiddleware, invalidateCache } = require('../middleware/redisCache');
const express = require('express');
const {
  listarProdutos,
  buscarProduto,
  criarProduto,
  atualizarProduto,
  deletarProduto,
  atualizarEstoque
} = require('../controllers/productController');

const router = express.Router();

// GET / - Listar produtos (Cache 4 horas = 14400 segundos)
router.get('/', cacheMiddleware(14400), listarProdutos);

// GET /:id - Buscar produto por ID (Cache 4 horas)
router.get('/:id', cacheMiddleware(14400), buscarProduto);

// POST / - Criar produto (invalida cache)
router.post('/', async (req, res) => {
  await criarProduto(req, res);
  // Invalida cache de produtos
  await invalidateCache('cache:*/products*');
});

// PUT /:id - Atualizar produto (invalida cache)
router.put('/:id', async (req, res) => {
  await atualizarProduto(req, res);
  const produtoId = req.params.id;
  // Invalida cache deste produto
  await invalidateCache(`cache:*/products/${produtoId}*`);
  // Invalida cache de listagem
  await invalidateCache('cache:*/products');
});

// DELETE /:id - Deletar produto (invalida cache)
router.delete('/:id', async (req, res) => {
  await deletarProduto(req, res);
  // Invalida cache de listagem e deste produto
  await invalidateCache('cache:*/products*');
});

// PATCH /:id/estoque - Atualizar estoque (invalida cache)
router.patch('/:id/estoque', async (req, res) => {
  await atualizarEstoque(req, res);
  const produtoId = req.params.id;
  // Invalida cache deste produto
  await invalidateCache(`cache:*/products/${produtoId}*`);
  // Invalida cache de listagem
  await invalidateCache('cache:*/products');
});

module.exports = router;