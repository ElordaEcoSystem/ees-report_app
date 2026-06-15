# EES Report App — Project Guide

## Описание проекта

Веб-приложение для ведения журнала выполненных работ с фотофиксацией и генерацией PDF-отчётов.

**Основные функции:**
- Авторизация пользователей (JWT)
- Создание записей о работах с загрузкой фото
- Автоматический водяной знак на фото (дата, объект, исполнитель, логотип)
- Фильтрация записей по месяцу и типу объекта (НС / ОС)
- Генерация PDF-отчётов через @react-pdf/renderer

---

## Стек технологий

| Слой | Технологии |
|---|---|
| Frontend | React 19, Vite 7, TypeScript 5, Tailwind CSS 4, React Hook Form, Zod |
| Backend | Node.js, Express 4, Prisma 6, PostgreSQL 15 |
| State | create-gstore (global), React Hook Form (local forms) |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Image | Sharp, @napi-rs/canvas (watermark), heic-convert, jimp |
| PDF | @react-pdf/renderer |
| Infra | Docker Compose, Nginx |

---

## Структура проекта

```
ees-report_app/
├── express_api/
│   ├── bin/www                          # Точка входа, порт 5000
│   ├── app.js                           # Express setup, CORS, static /uploads
│   ├── routes/index.js                  # Все API-маршруты
│   ├── controllers/
│   │   ├── user-controller.js           # Регистрация, логин, получение пользователя
│   │   └── workLog/
│   │       ├── wokrLog-controller.js    # CRUD записей (опечатка в имени файла!)
│   │       └── workLog-service.js       # Наложение водяного знака
│   ├── middleware/
│   │   ├── auth.js                      # JWT проверка → req.user
│   │   └── multer.js                    # Загрузка файлов → ./uploads/
│   ├── prisma/
│   │   ├── schema.prisma                # Модели: User, WorkLog
│   │   └── prisma-client.js             # Singleton PrismaClient
│   ├── assets/logo.png                  # Логотип для водяного знака
│   └── .env                            # DATABASE_URL, SECRET_KEY
│
├── react-client/
│   ├── src/
│   │   ├── app/
│   │   │   ├── main.tsx                 # Точка входа React
│   │   │   ├── App.tsx                  # Layout с <Outlet>
│   │   │   └── router.tsx               # Маршруты: /login, /board
│   │   ├── features/
│   │   │   ├── auth/                    # Страница и форма логина
│   │   │   ├── board/
│   │   │   │   ├── board.page.tsx       # Главная страница
│   │   │   │   ├── board-type.ts        # TypeScript типы
│   │   │   │   ├── use-board.ts         # Глобальный стейт
│   │   │   │   ├── create-workLog-modal/ # Форма создания записи
│   │   │   │   ├── wl-modal/            # Просмотр фото
│   │   │   │   └── report/              # PDF генерация
│   │   │   │       ├── report.tsx       # Структура документа
│   │   │   │       ├── table.tsx        # Таблица для PDF
│   │   │   │       ├── PhotoGrid.tsx    # Сетка фото для PDF
│   │   │   │       └── style.ts         # Стили PDF
│   │   │   └── header/
│   │   └── shared/
│   │       ├── model/api.ts             # Все API-вызовы (axios)
│   │       ├── model/routes.ts          # Константы маршрутов
│   │       └── ui/kit/                  # Radix UI компоненты
│   └── vite.config.ts                   # Proxy /api → :5000, /uploads → :5000
│
├── nginx/default.conf                   # Реверс-прокси
└── docker-compose.yml                   # postgres + backend + frontend
```

---

## База данных (Prisma Schema)

```prisma
enum Role { EXECUTOR, CUSTOMER, ADMIN, OBSERVER }

model User {
  id        String    @id @default(uuid())
  email     String    @unique
  fullName  String?
  password  String    // bcrypt hash
  role      Role      @default(EXECUTOR)
  workLogs  WorkLog[] @relation("WorkLogAuthor")
  executors WorkLog[] @relation("WorkLogExecutors")
}

model WorkLog {
  id         String   @id @default(uuid())
  objectType String?  // "НС" | "ОС"
  object     String
  content    String
  photoUrl   String
  authorId   String
  author     User     @relation("WorkLogAuthor")
  executors  User[]   @relation("WorkLogExecutors")
}
```

---

## API-маршруты

| Метод | Путь | Auth | Описание |
|---|---|---|---|
| POST | /api/register | — | Регистрация |
| POST | /api/login | — | Логин → JWT |
| GET | /api/current | ✓ | Текущий пользователь |
| GET | /api/user/:id | ✓ | Пользователь по ID |
| POST | /api/worklogs | ✓ | Создать запись + фото |
| GET | /api/worklogs | ✓ | Все записи |

---

## Конфигурация окружения

**express_api/.env** (обязательные переменные):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
SECRET_KEY="<сильный случайный ключ, минимум 32 символа>"
```

**Важно:** Никогда не коммитить реальные значения. Использовать `.env.example` как шаблон.

---

## Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Применение миграций БД (при первом запуске или после изменений схемы)
docker-compose exec backend npx prisma migrate deploy
```

Порты:
- Backend: `localhost:4001` → контейнер `:5000`
- Frontend: `localhost:4002` → контейнер `:80`

---

## Известные проблемы и план исправлений

### Статус исправлений

| # | Приоритет | Проблема | Файл | Статус |
|---|---|---|---|---|
| 1 | КРИТИЧЕСКИЙ | Год захардкожен `=== 2025` в фильтре PDF | `report/table.tsx:15` | ✅ Исправлено |
| 2 | Высокий | Мёртвый закомментированный код | `report/table.tsx`, `report/style.ts` | ✅ Исправлено |
| 3 | Высокий | Опечатка в имени файла контроллера | `wokrLog-controller.js` | ✅ Исправлено |
| 4 | Высокий | Нет валидации входных данных на бэкенде | `routes/index.js` | ✅ Исправлено |
| 5 | Высокий | Слабый SECRET_KEY ("123") | `express_api/.env` | ✅ Исправлено (.env.example) |
| 6 | Средний | Нет пагинации в GET /api/worklogs | `routes/index.js`, `workLog-controller` | ✅ Исправлено |
| 7 | Средний | console.log в продакшн-коде | Весь бэкенд | ✅ Исправлено |
| 8 | Средний | Нет обработки ошибок на фронтенде | `shared/model/api.ts` | ✅ Исправлено |

### Не исправлено (требует бо́льших изменений)
- JWT в localStorage → перенести в httpOnly cookie (breaking change)
- Роли CUSTOMER/OBSERVER определены, но не используются
- Нет тестов
- CORS без ограничений по origin

---

## Соглашения по коду

- **Язык**: TypeScript на фронтенде, JavaScript на бэкенде
- **Стили**: Tailwind CSS (фронтенд), StyleSheet от @react-pdf/renderer (PDF)
- **Именование файлов**: kebab-case (`work-log-controller.js`)
- **Компоненты**: PascalCase (`WorkLogTable.tsx`)
- **API-вызовы**: централизованы в `shared/model/api.ts`
- **Глобальный стейт**: `use-board.ts` через create-gstore
- **Локальный стейт форм**: React Hook Form + Zod валидация

---

## Частые задачи

```bash
# Frontend dev
cd react-client && npm run dev

# Backend dev
cd express_api && npm run dev

# Prisma Studio (просмотр БД)
cd express_api && npx prisma studio

# Применить миграции
cd express_api && npx prisma migrate dev
```
