# =============================
# Etapa 1: Build (compilación)
# =============================
FROM node:20 AS builder

WORKDIR /app

# Copiamos dependencias y las instalamos
COPY package*.json ./
RUN npm install

# Copiamos todo el código fuente
COPY . .

# Generamos el cliente de Prisma y compilamos TypeScript
RUN npm run prisma:generate
RUN npm run build

# =============================
# Etapa 2: Runtime (ejecución)
# =============================
FROM node:20

WORKDIR /app

# Copiamos únicamente los archivos necesarios para ejecutar la app
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Instalamos solo dependencias de producción
RUN npm install --omit=dev --ignore-scripts

# Exponemos el puerto de Express
EXPOSE 8000

# Ejecutamos la aplicación compilada
CMD ["node", "dist/main.js"]
