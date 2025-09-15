const mongoose = require("mongoose");

const PedidoItemSchema = new mongoose.Schema({
  produtoId: { type: Number, required: true },
  quantidade: { type: Number, required: true },
  produtoSnapshot: {
    nome: { type: String, required: true },
    preco: { type: Number, required: true }
  }
});

const PedidoSchema = new mongoose.Schema({
  usuarioId: { type: Number, required: true },
  usuarioSnapshot: {
    nome: { type: String, required: true },
    email: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ["AGUARDANDO PAGAMENTO", "FALHA NO PAGAMENTO", "PAGO", "CANCELADO"],
    default: "AGUARDANDO PAGAMENTO"
  },
  criadoEm: { type: Date, default: Date.now },
  itens: [PedidoItemSchema],
  total: { type: Number, required: true }
});

module.exports = mongoose.model("Pedido", PedidoSchema);
