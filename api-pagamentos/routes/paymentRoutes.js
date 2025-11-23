const express = require('express');
const router = express.Router();

const {
  listarPagamentos,
  processaPagamento,criarPagamento
} = require('../controllers/paymentController');

// 🔹 Listar pagamentos
router.get('/', listarPagamentos);

// 🔹 Processar pagamento manual (para debug)
// Ex.: PATCH /payments/1/process
router.patch('/:id/process', processaPagamento);

// 🔹 Criar pagamento
router.post('/', criarPagamento);

module.exports = router;
