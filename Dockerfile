# ---------- Этап 1: Сборка TypeScript ----------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Передаём DATABASE_URL для prisma generate
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Генерируем Prisma-клиент
RUN npx prisma generate

# Собираем TypeScript (создаст dist/)
RUN npm run build

# ---------- Этап 2: Запуск ----------
FROM node:20-alpine

WORKDIR /app

# Копируем собранный код и зависимости из билдера
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Открываем порт
EXPOSE 3000

# Запускаем через Fastify CLI (используем dist/app.js)
CMD ["npm", "start"]