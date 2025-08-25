# FROM node:20.19.3-alpine

# WORKDIR /app

# # Копируем package.json и устанавливаем зависимости
# COPY package*.json ./
# RUN npm install

# # Копируем схему Prisma и генерируем клиент
# COPY prisma ./prisma
# RUN npx prisma generate

# # Копируем остальной код приложения
# COPY . .

# EXPOSE 5000


FROM node:20-slim

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 5000

CMD ["npm", "start"]