const prisma = require('../prismaClient');

// GET /usuarios
const listarUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { pedidos: true }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar usuários', detalhe: error.message });
  }
};

// GET /usuarios/:id
const buscarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(id) },
      include: { pedidos: true }
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao buscar usuário', detalhe: error.message });
  }
};

// POST /usuarios
const criarUsuario = async (req, res) => {
  const { nome, email } = req.body;
  try {
    const novoUsuario = await prisma.usuario.create({
      data: { nome, email }
    });
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao criar usuário', detalhe: error.message });
  }
};

// PUT /usuarios/:id
const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: req.body
    });
    res.json(usuarioAtualizado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao atualizar usuário', detalhe: error.message });
  }
};

// DELETE /usuarios/:id
const deletarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.usuario.delete({ where: { id: parseInt(id) } });
    res.json({ mensagem: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao deletar usuário', detalhe: error.message });
  }
};

// Exportando todos
module.exports = {
  listarUsuarios,
  buscarUsuario,
  criarUsuario,
  atualizarUsuario,
  deletarUsuario
};
