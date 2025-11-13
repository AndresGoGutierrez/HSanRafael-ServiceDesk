# =============================
# Etapa 1: Build (Compilación)
# =============================
FROM node:20-alpine AS build

WORKDIR /src

COPY package*.json ./
RUN npm ci --silent

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

COPY --from=build /src/dist ./dist
COPY --from=build /src/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
