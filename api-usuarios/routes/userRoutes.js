const express = require('express');
const { listarUsuarios, buscarUsuario, criarUsuario, atualizarUsuario, deletarUsuario } = require('../controllers/userController.js');

const router = express.Router();

router.get('/', listarUsuarios);
router.get('/:id', buscarUsuario);
router.post('/', criarUsuario);
router.put('/:id', atualizarUsuario);
router.delete('/:id', deletarUsuario);


module.exports = router;
