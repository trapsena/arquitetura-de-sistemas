const express = require('express');
const router = express.Router();
const { confirmarPagamento } = require('../controllers/paymentController');

// POST confirmar pagamento
router.post('/confirmar', confirmarPagamento);

module.exports = router;
