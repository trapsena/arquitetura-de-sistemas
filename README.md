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
curl --location --request GET 'http://localhost:8000/products' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray' \
--header 'Content-Type: application/json' \
--data '{
  "nome": "comida",
  "preco": 6,
  "estoque": 20
}'
- `GET /products/:id` → Lista um produto específico por ID
curl --location 'http://localhost:8000/products/1' \
--header 'apikey;'
- `POST /products` → Cria produto
curl --location 'http://localhost:8000/products' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray' \
--header 'Content-Type: application/json' \
--data '{
  "nome": "comida",
  "preco": 6,
  "estoque": 20
}
'
- `PUT /products/:id` → Edita um produto específico
curl --location --request PUT 'http://localhost:8000/products/5' \
--header 'Content-Type: application/json' \
--data '{
  "estoque": 20
}
'
- `DELETE /products/:id` → Lista todos os produtos
curl --location --request DELETE 'http://localhost:8000/products/1' \
--header 'apikey;'
- `PATCH /products/:id/estoque` → Decrementa estoque  
curl --location --request PATCH 'http://localhost:8000/products/1/estoque' \
--header 'apikey;' \
--header 'Content-Type: application/json' \
--data '{
    "quantidade": 10
}'

### Usuários
- `GET /users` → Lista todos os usuários
curl --location 'http://localhost:8000/users' \
--header 'apikey: 2pNdX7mrtE83L8ACc9wjT5Oy9hCrhUo6' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJldmVudC1jaGVja2luLWFwaSIsInN1YiI6Im9wZXJhdG9yIiwiZXZlbnRJZCI6ImV2dF8xMjMiLCJpYXQiOjE3MjQ4ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.8b7cRrJq1u8hQWmF2Z0k3yV5aN4pX6sT9uE1L3cB7Dg' \
--data ''


- `GET /users/:id` → Lista um usuário específico por ID 
curl --location 'http://localhost:8000/users/1' \
--header 'apikey: 65LgcNHdN01s6h7AybFxhFUKEfSC6JqQ' \
--data ''
'
- `POST /users` → Cria usuário
curl --location 'http://localhost:8000/users' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray' \
--header 'Content-Type: application/json' \
--data-raw '{
    "nome": "Sena",
    "email": "mcnescau7@gmail.com"
}
'
- `PUT /users/:id` → Dar update em um usuário
curl --location --request PUT 'http://localhost:3002/users/3' \
--header 'apikey;' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "andreypeil@gmail.com"
}
'
- `DELETE /users/:id` → Cria usuário 
curl --location --request DELETE 'http://localhost:3002/users/2' \
--header 'apikey;'

### Pedidos
- `GET /orders/` → Busca pedido (com total e snapshots)
curl --location 'http://localhost:8000/orders' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray'
 - 
- `GET /orders/:id` → Busca pedido (com total e snapshots)
curl --location 'http://localhost:8000/orders/692d4b8a1b5849fa84e92e46' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray'
- `POST /orders` → Cria pedido (`usuarioId`, `itens`) 
curl --location 'http://localhost:8000/orders' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray' \
--header 'Content-Type: application/json' \
--data '{
  "usuarioId": 1,
  "itens": [
    { "produtoId": 1, "quantidade":4  }
  ],
  "metodoPagamento": "pix"
}'
'`GET /orders/:id` → acha pedido por usuario pedido (com total e snapshots)
curl --location 'http://localhost:8000/orders/usuario/2' \
--header 'apikey;'
  

### Pagamentos
- `POST /payments/confirmar` → Confirma pagamento, atualiza pedido e estoque  
curl --location 'http://localhost:8000/payments' \
--header 'apikey: 2pNdX7mrtE83L8ACc9wjT5Oy9hCrhUo6' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJldmVudC1jaGVja2luLWFwaSIsInN1YiI6Im9wZXJhdG9yIiwiZXZlbnRJZCI6ImV2dF8xMjMiLCJpYXQiOjE3MjQ4ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.8b7cRrJq1u8hQWmF2Z0k3yV5aN4pX6sT9uE1L3cB7Dg' \
--data '{
  "pedidoId": "692297f46eecd6413028b7dc",
  "pagamentos": [
    {
      "metodo": "pix",
      "valor": 24
    }
  ]
}'
`POST /payments/:id` → Busca pedido (com total e snapshots)
curl --location 'http://localhost:8000/payments' \
--header 'apikey: 2pNdX7mrtE83L8ACc9wjT5Oy9hCrhUo6' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJldmVudC1jaGVja2luLWFwaSIsInN1YiI6Im9wZXJhdG9yIiwiZXZlbnRJZCI6ImV2dF8xMjMiLCJpYXQiOjE3MjQ4ODAwMDAsImV4cCI6MTk5OTk5OTk5OX0.8b7cRrJq1u8hQWmF2Z0k3yV5aN4pX6sT9uE1L3cB7Dg' \
--data '{
  "pedidoId": "692297f46eecd6413028b7dc",
  "pagamentos": [
    {
      "metodo": "pix",
      "valor": 24
    }
  ]
}'
`GET /payments/:id` → Busca pedido (com total e snapshots)
curl --location 'http://localhost:8000/payments?=692d4b8a1b5849fa84e92e46' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray'
`PATCH /payments/:id` → Busca pedido (com total e snapshots)
curl --location --request PATCH 'http://localhost:8000/payments/692d4b8a1b5849fa84e92e46/process' \
--header 'apikey: UwIg6JnH8wky6w3tPbnhAdR7CwgGiray' \
--data ''
---

 Recupere a chave de API:
   curl http://localhost:8001/consumers/frontend-app/key-auth⁠
=======



>>>>>>> bac62a104e61effa34af6476d0d07a115376d216
