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

# Instalamos solo dependencias de producción y evitamos ejecutar scripts
RUN npm install --omit=dev --ignore-scripts

EXPOSE 8000

CMD ["node", "dist/main.js"]
