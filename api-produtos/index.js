const express = require("express");
const productRoutes = require("./routes/productRoutes");

const app = express();
app.use(express.json());

// Rotas
app.use("/products", productRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API Produtos rodando na porta ${PORT}`);
});
