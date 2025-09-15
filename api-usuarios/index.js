const express = require("express");
const app = express();
const PORT = 3001;
const userRoutes = require('./routes/userRoutes');

// Middleware para interpretar JSON
app.use(express.json());

app.use("/users", userRoutes);

// Rota inicial
app.get("/", (req, res) => {
  res.send("🚀 Backend com Express funcionando!");
});

// Exemplo de rota com POST
app.post("/usuarios", (req, res) => {
  const { nome, idade } = req.body;
  res.json({ message: `Usuário ${nome}, idade ${idade}, criado com sucesso!` });
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
