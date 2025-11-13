# =============================
# Etapa 1: Build (Compilación)
# =============================
FROM node:20-alpine AS build

# Directorio de trabajo dentro del contenedor
WORKDIR /src

# Copiar dependencias primero (para aprovechar la cache)
COPY package*.json ./
RUN npm ci --silent

# Copiar el resto del código del proyecto
COPY . .

# Generar cliente Prisma antes de compilar TypeScript
RUN npx prisma generate

# Compilar el proyecto (TypeScript → JavaScript en /dist)
RUN npm run build

# =============================
# Etapa 2: Runtime (Ejecución)
# =============================
FROM node:20-alpine AS runtime

WORKDIR /src

# Copiar solo lo necesario desde la etapa de build
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules


# Definir entorno y puerto
ENV NODE_ENV=production
EXPOSE 3000

# Ejecutar el archivo compilado (equivalente a src/main.ts)
CMD ["node", "dist/main.js"]
