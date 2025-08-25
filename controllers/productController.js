let produtos = [];
let idCounter = 1;

const listarProdutos = (req, res) => {
  res.json(produtos);
};

const buscarProdutoPorId = (req, res) => {
  const { id } = req.params;
  const produto = produtos.find(p => p.id === Number(id));
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
  res.json(produto);
};

const adicionarProduto = (req, res) => {
  const { nome, preco, estoque } = req.body;

  if (!nome || preco == null || estoque == null) {
    return res.status(400).json({ erro: 'Campos nome, preco e estoque são obrigatórios' });
  }

  const novoProduto = {
    id: idCounter++,
    nome,
    preco,
    estoque
  };

  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
};

const atualizarProduto = (req, res) => {
  const { id } = req.params;
  const { nome, preco, estoque } = req.body;
  const produto = produtos.find(p => p.id === Number(id));
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

  if (nome !== undefined) produto.nome = nome;
  if (preco !== undefined) produto.preco = preco;
  if (estoque !== undefined) produto.estoque = estoque;

  res.json(produto);
};

module.exports = {
  listarProdutos,
  buscarProdutoPorId,
  adicionarProduto,
  atualizarProduto,
  produtos // Exportando para uso no controller de pedidos
};
