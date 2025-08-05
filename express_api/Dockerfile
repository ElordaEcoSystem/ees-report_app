#Используем образ линукс Alpine node 14
FROM node:20.19.3-bookworm-slim

# Указываем нашу рабочую дерикторию
WORKDIR /app

# Копируем package.json и package-lock.json внутрь контейнера
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем оставшееся приложение в контейнер
COPY . .

# Устанавливаем Prisma
RUN npm install -g prisma

# Генерируем Prisma client
RUN prisma generate

# Копируем Prisma schema и URL базы данных в контейнер
COPY prisma/schema.prisma ./prisma/

# Открываем порт 3000 в нашем контейнере
EXPOSE 4000
# Запускаем сервер
CMD [ "npm", "start" ]