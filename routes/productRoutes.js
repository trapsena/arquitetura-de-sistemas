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

router.get('/', listarProdutos);
router.get('/:id', buscarProduto);
router.post('/', criarProduto);
router.put('/:id', atualizarProduto);
router.delete('/:id', deletarProduto);
router.patch('/:id/estoque', atualizarEstoque);

module.exports = router;
