const express = require("express");
const router = express.Router();
const {
  listarProdutos,
  buscarProdutoPorId,
  adicionarProduto,
  atualizarProduto
} = require("./productController"); // ajuste o caminho se necessário

// Listar todos os produtos
router.get("/", listarProdutos);

// Buscar produto por ID
router.get("/:id", buscarProdutoPorId);

// Adicionar novo produto
router.post("/", adicionarProduto);

// Atualizar produto existente
router.put("/:id", atualizarProduto);

module.exports = router;
