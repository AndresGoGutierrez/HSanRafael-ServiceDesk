# =============================
# Etapa 1: Build
# =============================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./git 
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

# =============================
# Etapa 2: Run (Producción)
# =============================
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Azure requiere que la app escuche en el puerto PORT (8080)
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/main.js"]
