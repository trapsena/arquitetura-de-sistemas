const { cacheMiddleware, invalidateCache } = require('../middleware/redisCache.js');
const express = require('express');
const { listarUsuarios, buscarUsuario, criarUsuario, atualizarUsuario, deletarUsuario } = require('../controllers/userController.js');
const router = express.Router();

// GET / - Listar todos (cache 1 dia)
router.get('/', cacheMiddleware(86400), listarUsuarios);

// GET /:id - Buscar por ID (cache 1 dia)
router.get('/:id', cacheMiddleware(86400), buscarUsuario);

// POST / - Criar usuário (invalida cache)
router.post('/', async (req, res) => {
  await criarUsuario(req, res);
  // Invalida o cache de users
  await invalidateCache('cache:*/users*');
});

// PUT /:id - Atualizar usuário (invalida cache)
router.put('/:id', async (req, res) => {
  await atualizarUsuario(req, res);
  // Invalida cache deste usuário específico
  const userId = req.params.id;
  await invalidateCache(`cache:*/users/${userId}*`);
});

// DELETE /:id - Deletar usuário (invalida cache)
router.delete('/:id', async (req, res) => {
  await deletarUsuario(req, res);
  // Invalida cache deste usuário específico
  const userId = req.params.id;
  await invalidateCache(`cache:*/users/${userId}*`);
});

module.exports = router;