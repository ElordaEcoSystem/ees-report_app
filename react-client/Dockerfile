# Stage 1 — сборка React/Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2 — Nginx
FROM nginx:alpine

# Nginx слушает 80 порт
EXPOSE 80

# Копируем конфиг Nginx
# COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранный фронт
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 3050
CMD [ "nginx", "-g", "daemon off;" ]