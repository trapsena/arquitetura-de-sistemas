const express = require('express');
const mongoose = require('mongoose');
const orderRoutes = require('./routes/orderRoutes');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB conectado com sucesso!'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.listen(process.env.PORT || 3004, () => {
  console.log(`API Pedidos rodando na porta ${process.env.PORT || 3004}`);
});
