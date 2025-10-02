const express = require('express');
const {
  listarPedidos,
  buscarPedido,
  criarPedido,
  listarPedidosPorUsuario,
} = require('../controllers/orderController');

const router = express.Router();

// Listar todos os pedidos
router.get('/', listarPedidos);

// Buscar pedido por ID
router.get('/:id', buscarPedido);

// Listar pedidos por usuário
router.get('/usuario/:usuarioId', listarPedidosPorUsuario);

// Criar novo pedido
router.post('/', criarPedido);


// Atualizar status do pedido
const { atualizarStatusPedido } = require('../controllers/orderController');
router.patch('/:id', atualizarStatusPedido);

module.exports = router;
