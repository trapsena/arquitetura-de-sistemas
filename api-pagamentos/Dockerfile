FROM node:18

WORKDIR /app

# Copia package.json e instala dependências
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 3003

CMD ["node", "index.js"]
