# Stage de build
FROM node:20-alpine AS build
WORKDIR /src

# copiar package.json / package-lock para cachear deps
COPY package.json package-lock.json* ./
RUN npm ci --silent

# copiar el resto, compilar y generar prisma client
COPY . .
RUN npm run build
RUN npx prisma generate

# Stage runtime
FROM node:20-alpine AS runtime
WORKDIR /src

# copiar artifacts desde build
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/prisma ./prisma

# opción: crear usuario no-root
RUN addgroup -S app && adduser -S app -G app
USER app

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]