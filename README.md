# E-commerce Microservices

Este projeto implementa um **e-commerce distribuído em microserviços**, onde cada domínio (Produtos, Usuários, Pedidos e Pagamentos) possui sua própria API e banco de dados.  

---

## Arquitetura

Cada serviço é independente, com banco de dados próprio:

- **Produtos** → PostgreSQL (via Prisma)  
- **Usuários** → PostgreSQL (via Prisma)  
- **Pedidos** → MongoDB (via Mongoose)  
- **Pagamentos** → PostgreSQL (via Prisma) + integração com **Pedidos (Mongo)** e **Produtos (Postgres)**  

Comunicação entre serviços é feita via **HTTP (Axios)**.

---

## Fluxo das Operações

1. **Usuário cria um pedido**  
   - Serviço de **Pedidos** consulta o serviço de **Usuários** para validar o cliente.  
   - Consulta o serviço de **Produtos** para validar estoque.  
   - Cria o **pedido** no **MongoDB**, com snapshot do usuário e produtos.  
   - Status inicial: `AGUARDANDO PAGAMENTO`.

2. **Confirmação de pagamento**  
   - Serviço de **Pagamentos** salva o pagamento no **Postgres**.  
   - Atualiza o status do **pedido** no MongoDB:  
     - `PAGO` se valor for suficiente e todos métodos de pagamento forem sucesso.  
     - `CANCELADO` se algum método falhar.  
   - Chama o serviço de **Produtos** para decrementar o estoque.

---

## Tecnologias Usadas

- **Node.js + Express** → APIs REST  
- **Prisma ORM** → Postgres (Produtos, Usuários, Pagamentos)  
- **Mongoose** → MongoDB (Pedidos)  
- **Axios** → Comunicação entre microserviços  
- **Docker + Docker Compose** → Orquestração de containers  
- **PostgreSQL & MongoDB Atlas** → Bancos de dados  

---
## Como Rodar

### 1) Clonar o projeto
```bash
git clone https://github.com/seu-repo/ecommerce-microservices.git
cd ecommerce-microservices/API
```

### 2) Subir containers com Docker
Edite o `docker-compose.yml` e rode:
```bash
docker compose up -d
```

Isso sobe PostgreSQL + PgAdmin + MongoDB (ou usa Atlas se configurado).


### 4) Rodar cada serviço
```bash
cd api-produtos && npm install && node index.js
cd api-usuarios && npm install && node index.js
cd api-pedidos && npm install && node index.js
cd api-pagamentos && npm install && node index.js
```

---

## Endpoints Principais

### Produtos
- `GET /products` → Lista todos os produtos
- `GET /products/:id` → Lista um produto específico por ID
- `POST /products` → Cria produto
- `PUT /products/:id` → Edita um produto específico
- `DELETE /products/:id` → Lista todos os produtos
- `PATCH /products/:id/estoque` → Decrementa estoque  

### Usuários
- `GET /users` → Lista todos os usuários
- `GET /users/:id` → Lista um usuário específico por ID 
- `POST /users` → Cria usuário
- `PUT /users/:id` → Dar update em um usuário
- `DELETE /users/:id` → Cria usuário 

### Pedidos
- `GET /orders/` → Busca pedido (com total e snapshots)
- `GET /orders/:id` → Busca pedido (com total e snapshots)
- `POST /orders` → Cria pedido (`usuarioId`, `itens`)  
  

### Pagamentos
- `POST /payments/confirmar` → Confirma pagamento, atualiza pedido e estoque  

---
<<<<<<< HEAD
# E-commerce Microservices

Este projeto implementa um **e-commerce distribuído em microserviços**, onde cada domínio (Produtos, Usuários, Pedidos e Pagamentos) possui sua própria API e banco de dados.  

---

## Arquitetura

Cada serviço é independente, com banco de dados próprio:

- **Produtos** → PostgreSQL (via Prisma)  
- **Usuários** → PostgreSQL (via Prisma)  
- **Pedidos** → MongoDB (via Mongoose)  
- **Pagamentos** → PostgreSQL (via Prisma) + integração com **Pedidos (Mongo)** e **Produtos (Postgres)**  

Comunicação entre serviços é feita via **HTTP (Axios)**.

---

## Fluxo das Operações

1. **Usuário cria um pedido**  
   - Serviço de **Pedidos** consulta o serviço de **Usuários** para validar o cliente.  
   - Consulta o serviço de **Produtos** para validar estoque.  
   - Cria o **pedido** no **MongoDB**, com snapshot do usuário e produtos.  
   - Status inicial: `AGUARDANDO PAGAMENTO`.

2. **Confirmação de pagamento**  
   - Serviço de **Pagamentos** salva o pagamento no **Postgres**.  
   - Atualiza o status do **pedido** no MongoDB:  
     - `PAGO` se valor for suficiente e todos métodos de pagamento forem sucesso.  
     - `CANCELADO` se algum método falhar.  
   - Chama o serviço de **Produtos** para decrementar o estoque.

---

## Tecnologias Usadas

- **Node.js + Express** → APIs REST  
- **Prisma ORM** → Postgres (Produtos, Usuários, Pagamentos)  
- **Mongoose** → MongoDB (Pedidos)  
- **Axios** → Comunicação entre microserviços  
- **Docker + Docker Compose** → Orquestração de containers  
- **PostgreSQL & MongoDB Atlas** → Bancos de dados  

---
## Como Rodar

### 1) Clonar o projeto
```bash
git clone https://github.com/seu-repo/ecommerce-microservices.git
cd ecommerce-microservices/API
```

### 2) Subir containers com Docker
Edite o `docker-compose.yml` e rode:
```bash
docker compose up -d
```

Isso sobe PostgreSQL + PgAdmin + MongoDB (ou usa Atlas se configurado).


### 4) Rodar cada serviço


---

## Endpoints Principais

### Produtos
- `GET /products` → Lista todos os produtos
- `GET /products/:id` → Lista um produto específico por ID
- `POST /products` → Cria produto
- `PUT /products/:id` → Edita um produto específico
- `DELETE /products/:id` → Lista todos os produtos
- `PATCH /products/:id/estoque` → Decrementa estoque  

### Usuários
- `GET /users` → Lista todos os usuários
- `GET /users/:id` → Lista um usuário específico por ID 
- `POST /users` → Cria usuário
- `PUT /users/:id` → Dar update em um usuário
- `DELETE /users/:id` → Cria usuário 

### Pedidos
- `GET /orders/` → Busca pedido (com total e snapshots)
- `GET /orders/:id` → Busca pedido (com total e snapshots)
- `POST /orders` → Cria pedido (`usuarioId`, `itens`)  
  

### Pagamentos
- `POST /payments/confirmar` → Confirma pagamento, atualiza pedido e estoque  

---
# E-commerce Microservices

Este projeto implementa um **e-commerce distribuído em microserviços**, onde cada domínio (Produtos, Usuários, Pedidos e Pagamentos) possui sua própria API e banco de dados.  

---

## Arquitetura

Cada serviço é independente, com banco de dados próprio:

- **Produtos** → PostgreSQL (via Prisma)  
- **Usuários** → PostgreSQL (via Prisma)  
- **Pedidos** → MongoDB (via Mongoose)  
- **Pagamentos** → PostgreSQL (via Prisma) + integração com **Pedidos (Mongo)** e **Produtos (Postgres)**  

Comunicação entre serviços é feita via **HTTP (Axios)**.

---

## Fluxo das Operações

1. **Usuário cria um pedido**  
   - Serviço de **Pedidos** consulta o serviço de **Usuários** para validar o cliente.  
   - Consulta o serviço de **Produtos** para validar estoque.  
   - Cria o **pedido** no **MongoDB**, com snapshot do usuário e produtos.  
   - Status inicial: `AGUARDANDO PAGAMENTO`.

2. **Confirmação de pagamento**  
   - Serviço de **Pagamentos** salva o pagamento no **Postgres**.  
   - Atualiza o status do **pedido** no MongoDB:  
     - `PAGO` se valor for suficiente e todos métodos de pagamento forem sucesso.  
     - `CANCELADO` se algum método falhar.  
   - Chama o serviço de **Produtos** para decrementar o estoque.

---

## Tecnologias Usadas

- **Node.js + Express** → APIs REST  
- **Prisma ORM** → Postgres (Produtos, Usuários, Pagamentos)  
- **Mongoose** → MongoDB (Pedidos)  
- **Axios** → Comunicação entre microserviços  
- **Docker + Docker Compose** → Orquestração de containers  
- **PostgreSQL & MongoDB Atlas** → Bancos de dados  

---
## Como Rodar

### 1) Clonar o projeto
```bash
git clone https://github.com/seu-repo/ecommerce-microservices.git
cd ecommerce-microservices/API
```

### 2) Subir containers com Docker
Edite o `docker-compose.yml` e rode:
```bash
docker compose up -d
```

Isso sobe PostgreSQL + PgAdmin + MongoDB (ou usa Atlas se configurado).


### 4) Rodar cada serviço
```bash
cd api-produtos && npm install && node index.js
cd api-usuarios && npm install && node index.js
cd api-pedidos && npm install && node index.js
cd api-pagamentos && npm install && node index.js
```

---

## Endpoints Principais

### Produtos
- `GET /products` → Lista todos os produtos
- `GET /products/:id` → Lista um produto específico por ID
- `POST /products` → Cria produto
- `PUT /products/:id` → Edita um produto específico
- `DELETE /products/:id` → Lista todos os produtos
- `PATCH /products/:id/estoque` → Decrementa estoque  

### Usuários
- `GET /users` → Lista todos os usuários
- `GET /users/:id` → Lista um usuário específico por ID 
- `POST /users` → Cria usuário
- `PUT /users/:id` → Dar update em um usuário
- `DELETE /users/:id` → Cria usuário 

### Pedidos
- `GET /orders/` → Busca pedido (com total e snapshots)
- `GET /orders/:id` → Busca pedido (com total e snapshots)
- `POST /orders` → Cria pedido (`usuarioId`, `itens`)  
  

### Pagamentos
- `POST /payments/confirmar` → Confirma pagamento, atualiza pedido e estoque  

---
# E-commerce Microservices

Este projeto implementa um **e-commerce distribuído em microserviços**, onde cada domínio (Produtos, Usuários, Pedidos e Pagamentos) possui sua própria API e banco de dados.  

---

## Arquitetura

Cada serviço é independente, com banco de dados próprio:

- **Produtos** → PostgreSQL (via Prisma)  
- **Usuários** → PostgreSQL (via Prisma)  
- **Pedidos** → MongoDB (via Mongoose)  
- **Pagamentos** → PostgreSQL (via Prisma) + integração com **Pedidos (Mongo)** e **Produtos (Postgres)**  

Comunicação entre serviços é feita via **HTTP (Axios)**.

---

## Fluxo das Operações

1. **Usuário cria um pedido**  
   - Serviço de **Pedidos** consulta o serviço de **Usuários** para validar o cliente.  
   - Consulta o serviço de **Produtos** para validar estoque.  
   - Cria o **pedido** no **MongoDB**, com snapshot do usuário e produtos.  
   - Status inicial: `AGUARDANDO PAGAMENTO`.

2. **Confirmação de pagamento**  
   - Serviço de **Pagamentos** salva o pagamento no **Postgres**.  
   - Atualiza o status do **pedido** no MongoDB:  
     - `PAGO` se valor for suficiente e todos métodos de pagamento forem sucesso.  
     - `CANCELADO` se algum método falhar.  
   - Chama o serviço de **Produtos** para decrementar o estoque.

---

## Tecnologias Usadas

- **Node.js + Express** → APIs REST  
- **Prisma ORM** → Postgres (Produtos, Usuários, Pagamentos)  
- **Mongoose** → MongoDB (Pedidos)  
- **Axios** → Comunicação entre microserviços  
- **Docker + Docker Compose** → Orquestração de containers  
- **PostgreSQL & MongoDB Atlas** → Bancos de dados  

---
## Como Rodar

### 1) Clonar o projeto
```bash
git clone https://github.com/seu-repo/ecommerce-microservices.git
cd ecommerce-microservices/API
```

### 2) Subir containers com Docker
Edite o `docker-compose.yml` e rode:


Isso sobe PostgreSQL + PgAdmin + MongoDB (ou usa Atlas se configurado).


### 4) Rodar cada serviço


---

## Endpoints Principais

### Produtos
- `GET /products` → Lista todos os produtos
- `GET /products/:id` → Lista um produto específico por ID
- `POST /products` → Cria produto
- `PUT /products/:id` → Edita um produto específico
- `DELETE /products/:id` → Lista todos os produtos
- `PATCH /products/:id/estoque` → Decrementa estoque  

### Usuários
- `GET /users` → Lista todos os usuários
- `GET /users/:id` → Lista um usuário específico por ID 
- `POST /users` → Cria usuário
- `PUT /users/:id` → Dar update em um usuário
- `DELETE /users/:id` → Cria usuário 

### Pedidos
- `GET /orders/` → Busca pedido (com total e snapshots)
- `GET /orders/:id` → Busca pedido (com total e snapshots)
- `POST /orders` → Cria pedido (`usuarioId`, `itens`)  
  

### Pagamentos
- `POST /payments/confirmar` → Confirma pagamento, atualiza pedido e estoque  

---
=======
>>>>>>> bac62a104e61effa34af6476d0d07a115376d216
