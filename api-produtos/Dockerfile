# 1. Base Image
FROM node:18

# 2. Define Build Argument (ARG)
# This declares that the DATABASE_URL will be passed during the build stage.
ARG DATABASE_URL

# 3. Set Environment Variable (ENV)
# This makes the DATABASE_URL available to all subsequent RUN commands.
ENV DATABASE_URL=$DATABASE_URL

WORKDIR /app

# 4. Copy essential files
COPY package*.json ./
COPY prisma ./prisma/ 
COPY prisma/migrations ./prisma/migrations/

# 5. Install dependencies
RUN npm install

# 6. Generate Prisma Client
RUN npx prisma generate

# 8. Copy rest of the application code
COPY . .

EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node index.js"]