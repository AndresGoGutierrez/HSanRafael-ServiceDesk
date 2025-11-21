# =============================
# Etapa 1: Build (Compilación)
# =============================
FROM node:20-alpine

WORKDIR /code

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=development
EXPOSE 443

CMD ["npm", "run", "start:dev"]