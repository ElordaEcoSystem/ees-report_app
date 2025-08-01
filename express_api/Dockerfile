#Используем образ линукс Alpine node 14
FROM node:20.19.3-bookworm-slim

#Указываем рабочую директорию
WORKDIR /app

#Скоприровать package.json и package-lock.json внутрь контейнера
COPY package*.json ./

# RUN apt-get update -y && apt-get install -y openssl

#Устанавливаем зависимости
RUN npm install

#Копируем оставшиеся приложения в контейнер
COPY . .

#Установить Prisma
# RUN npm install -g prisma

#Генерируем prisma client
# COPY prisma/schema.prisma ./prisma/

RUN npx prisma generate

#prisma schema

# EXPOSE 3000

CMD ["npm","start"]