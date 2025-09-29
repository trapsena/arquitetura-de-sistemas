# Etapa de build
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

EXPOSE 3002

CMD ["node", "index.js"]
