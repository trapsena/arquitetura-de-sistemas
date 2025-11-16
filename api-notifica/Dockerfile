# Estágio base com Node.js
FROM node:18-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json (se existir)
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o código da aplicação
COPY . .

# Expõe a porta (opcional, pois é um consumidor)
EXPOSE 3005

# Comando para iniciar o serviço
CMD ["npm", "start"]
