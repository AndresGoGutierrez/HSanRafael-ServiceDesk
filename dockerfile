# Etapa 1: Build
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Etapa 2: Runtime
FROM node:20

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY package*.json ./
COPY .env ./
RUN npm install --omit=dev

EXPOSE 8000

CMD ["node", "dist/main.js"]
