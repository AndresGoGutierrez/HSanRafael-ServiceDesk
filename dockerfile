# ==============================
# Etapa 1: Build
# ==============================
FROM node:20-alpine AS build

# Crear carpeta de trabajo
WORKDIR /usr/src/app

# Copiar package.json y lock
COPY package*.json ./

# Instalar todas las dependencias (prod + dev)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Generar cliente de Prisma
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# ==============================
# Etapa 2: Runtime (producción)
# ==============================
FROM node:20-alpine AS production

# Crear carpeta de trabajo
WORKDIR /usr/src/app

# Copiar solo archivos necesarios desde el build
COPY package*.json ./
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY prisma ./prisma

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=3000

# Exponer puerto
EXPOSE 3000

# Ejecutar migraciones Prisma al arrancar, luego iniciar la app
CMD npx prisma migrate deploy && node dist/main.js
