const express = require('express');
const {
  listarPedidos,
  buscarPedido,
  criarPedido,
  confirmarPagamento
} = require('../controllers/orderController');

const router = express.Router();

router.get('/', listarPedidos);
router.get('/:id', buscarPedido);
router.post('/', criarPedido);
router.post('/confirmar-pagamento', confirmarPagamento);


module.exports = router;
