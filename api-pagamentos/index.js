const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB conectado 🚀"))
.catch(err => console.error("Erro no Mongo:", err));

app.use('/payments', paymentRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Serviço de Pagamentos rodando em http://localhost:${PORT}`);
});
