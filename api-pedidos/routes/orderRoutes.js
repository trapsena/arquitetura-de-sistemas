const { cacheMiddleware, invalidateCache } = require('../middleware/redisCache');
const express = require('express');
const {
  listarPedidos,
  buscarPedido,
  criarPedido,
  listarPedidosPorUsuario,
  atualizarStatusPedido
} = require('../controllers/orderController');

const router = express.Router();

// GET / - Listar todos os pedidos (sem cache, muda frequentemente)
router.get('/', listarPedidos);

// GET /:id - Buscar pedido por ID (Cache 30 dias = 2592000 segundos)
router.get('/:id', cacheMiddleware(2592000), buscarPedido);

// GET /usuario/:usuarioId - Listar pedidos por usuário (Cache 30 dias)
router.get('/usuario/:usuarioId', cacheMiddleware(2592000), listarPedidosPorUsuario);

// POST / - Criar novo pedido (invalida cache)
router.post('/', async (req, res) => {
  await criarPedido(req, res);
  // Invalida cache de pedidos
  await invalidateCache('cache:*/orders*');
  await invalidateCache('cache:*/usuario/*');
});

// PATCH /:id - Atualizar status do pedido (invalida cache)
router.patch('/:id', async (req, res) => {
  await atualizarStatusPedido(req, res);
  const pedidoId = req.params.id;
  // Invalida cache deste pedido específico
  await invalidateCache(`cache:*orders/${pedidoId}*`);
  // Invalida cache de usuários também (pois pedido afeta seus pedidos)
  await invalidateCache(`cache:*/usuario/*`);
});

module.exports = router;