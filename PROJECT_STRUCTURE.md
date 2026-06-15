# EES Report App — Полная техническая документация

> Документ написан так, чтобы любой разработчик (или другой экземпляр Claude Code)
> мог воссоздать приложение с нуля, не задавая дополнительных вопросов.

---

## 1. Назначение продукта

Веб-приложение для ГКП на ПХВ «Elorda Eco System» (г. Астана).
Цель — вести цифровой журнал выполненных работ Службы ИТ и АС:
- Исполнители фиксируют работы через форму с фотографией.
- Система автоматически наносит водяной знак на фото (объект, дата, исполнитель, логотип).
- Наблюдатели и администраторы просматривают журнал и генерируют PDF-акты.

---

## 2. Роли пользователей

| Роль | Константа | Может создавать записи | Может смотреть журнал | Может генерировать PDF | Может управлять пользователями |
|---|---|:---:|:---:|:---:|:---:|
| Администратор | `ADMIN` | ✅ | ✅ | ✅ | ✅ |
| Наблюдатель | `OBSERVER` | ❌ | ✅ | ✅ | ❌ |
| Исполнитель | `EXECUTOR` | ✅ | ✅ | ❌ | ❌ |

> Роль `CUSTOMER` описана в схеме Prisma, но в UI/бизнес-логике не используется.

---

## 3. Технологический стек

### Backend
| Библиотека | Версия | Назначение |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | 4.x | HTTP-сервер |
| Prisma | 6.x | ORM, миграции |
| PostgreSQL | 15 | База данных |
| jsonwebtoken | — | JWT авторизация |
| bcryptjs | — | Хэширование паролей |
| multer | — | Загрузка файлов |
| sharp | — | Обработка изображений |
| @napi-rs/canvas | — | Рендеринг текста на изображении (водяной знак) |
| heic-convert | — | Конвертация HEIC → JPEG (установлен, но закомментирован) |
| dotenv | — | ENV-переменные |
| cors | — | CORS-заголовки |
| morgan | — | HTTP-логирование |

### Frontend
| Библиотека | Версия | Назначение |
|---|---|---|
| React | 19 | UI-фреймворк |
| Vite | 7 | Сборщик |
| TypeScript | 5 | Типизация |
| Tailwind CSS | 4 | Стили |
| React Router | 7 | Маршрутизация (createBrowserRouter) |
| React Hook Form | — | Формы |
| Zod | — | Валидация схем форм |
| axios | — | HTTP-клиент |
| create-gstore | — | Глобальный стейт (обёртка над useState) |
| jwt-decode | — | Декодирование JWT на клиенте |
| @react-pdf/renderer | — | Генерация PDF |
| date-fns | — | Работа с датами (getDaysInMonth) |
| Radix UI | — | UI-компоненты (Select, Dialog, etc.) через shadcn |

### Инфраструктура
| Компонент | Описание |
|---|---|
| Docker Compose | Оркестрация 3 сервисов |
| nginx | Раздача статики frontend, reverse-proxy |
| Docker volume `uploads_data` | Персистентное хранение загруженных фото |
| Docker volume `pg_data` | Персистентное хранение БД |

---

## 4. Структура директорий

```
ees-report_app/
├── docker-compose.yml               # Оркестрация: postgres + backend + frontend
├── CLAUDE.md                        # Инструкции для Claude Code
├── PROJECT_STRUCTURE.md             # Этот файл
│
├── express_api/                     # Backend (Node.js / Express)
│   ├── bin/www                      # Точка входа, запуск на порту 5000
│   ├── app.js                       # Express-приложение: middleware, роуты, статика
│   ├── package.json
│   ├── Dockerfile                   # FROM node:20-alpine, WORKDIR /app
│   ├── .env                         # DATABASE_URL, SECRET_KEY (не коммитить!)
│   ├── .env.example                 # Шаблон переменных
│   ├── assets/
│   │   └── logo.png                 # Логотип для водяного знака
│   ├── uploads/                     # Загруженные фото (создаётся автоматически)
│   ├── routes/
│   │   └── index.js                 # Все API-маршруты
│   ├── controllers/
│   │   ├── index.js                 # Реэкспорт: { UserController, WorkLogController }
│   │   ├── user-controller.js       # register, login, currentUser, getUserById
│   │   ├── admin-controller.js      # getUsers, createUser, updateUserRole, deleteUser
│   │   └── workLog/
│   │       ├── workLog-controller.js # createWorkLog, getAllWorkLog
│   │       └── workLog-service.js   # addWatermark() — наложение знака через sharp+canvas
│   ├── middleware/
│   │   ├── auth.js                  # authenticateToken — проверка JWT, req.user
│   │   ├── checkRole.js             # checkRole(...roles) — проверка роли
│   │   └── multer.js                # Конфигурация загрузки файлов в ./uploads/
│   └── prisma/
│       ├── schema.prisma            # Модели: User, WorkLog; enum Role
│       └── prisma-client.js         # Singleton PrismaClient
│
└── react-client/                    # Frontend (React / Vite / TypeScript)
    ├── package.json
    ├── vite.config.ts               # Proxy /api → :4001, /uploads → :4001
    ├── nginx.conf                   # nginx для production-контейнера
    ├── Dockerfile                   # Multi-stage: build → nginx
    └── src/
        ├── app/
        │   ├── main.tsx             # Точка входа: RouterProvider
        │   ├── App.tsx              # Layout: flex-col min-h-screen + <Outlet>
        │   ├── router.tsx           # createBrowserRouter: /, /login, /board, /admin
        │   └── index.css            # Tailwind directives
        ├── features/
        │   ├── auth/
        │   │   ├── login.page.tsx   # Страница логина (lazy-loaded)
        │   │   ├── login-form.tsx   # Форма: email + password, React Hook Form + Zod
        │   │   └── auth-layout.tsx  # Центрирующий layout для auth-страниц
        │   ├── board/
        │   │   ├── board.page.tsx   # Главная страница — таблица + фильтры
        │   │   ├── board-type.ts    # TypeScript типы: WorkLog, Role, Filters
        │   │   ├── use-board.ts     # Глобальный стейт (createGStore)
        │   │   ├── create-workLog-modal/
        │   │   │   ├── index.ts
        │   │   │   ├── create-wl-modal.tsx  # Обёртка модала
        │   │   │   ├── create-wl-form.tsx   # Форма: objectType, object, content, photo
        │   │   │   └── use-create-wl-modal.ts # Стейт открытия модала
        │   │   ├── wl-modal/
        │   │   │   ├── index.tsx
        │   │   │   ├── wl-modal.tsx         # Модал просмотра записи + фото
        │   │   │   └── use-wl-modal.tsx     # Стейт открытия + выбранная запись
        │   │   └── report/
        │   │       ├── report.tsx    # Document → Page → шапка, текст, Table, подписанты, PhotoGrid
        │   │       ├── table.tsx     # PDF-таблица: № / Дата / Исполнитель / Объект / Работы
        │   │       ├── PhotoGrid.tsx # Сетка фотографий в PDF (2 колонки)
        │   │       ├── style.ts      # StyleSheet для @react-pdf/renderer
        │   │       └── index.tsx     # Реэкспорт Report
        │   ├── admin/
        │   │   └── admin.page.tsx   # Управление пользователями (только ADMIN)
        │   └── header/
        │       └── header.tsx       # AppHeader: логотип, имя, роль, кнопки
        └── shared/
            ├── model/
            │   ├── api.ts           # Все axios-вызовы (централизованно)
            │   ├── routes.ts        # Константы ROUTES: HOME, LOGIN, BOARD, ADMIN
            │   └── months.ts        # Названия месяцев (именительный + родительный)
            ├── ui/
            │   └── kit/             # Radix UI компоненты (shadcn-стиль)
            │       ├── button.tsx
            │       ├── input.tsx
            │       ├── select.tsx
            │       ├── table.tsx    # Table, TableHead, TableCell и т.д.
            │       ├── card.tsx
            │       └── dialog.tsx
            └── lib/
                └── css.ts           # cn() — утилита для объединения классов (clsx + twMerge)
```

---

## 5. База данных

### Prisma Schema

```prisma
enum Role {
  EXECUTOR   // Исполнитель — создаёт записи
  CUSTOMER   // Не используется в UI
  ADMIN      // Полный доступ
  OBSERVER   // Только просмотр и PDF
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  fullName  String?
  password  String             // bcrypt hash, saltRounds=10
  role      Role     @default(EXECUTOR)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workLogs      WorkLog[] @relation("AuthorWorkLogs")   // записи как автор
  executingLogs WorkLog[] @relation("ExecutorsOnLogs")  // записи как исполнитель (не используется в UI)
}

model WorkLog {
  id         String   @id @default(uuid())
  objectType String?            // "НС" | "ОС"
  object     String             // Название объекта
  content    String             // Описание выполненной работы
  photoUrl   String             // "/uploads/<filename>" — с водяным знаком
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  authorId String
  author   User   @relation("AuthorWorkLogs", fields: [authorId], references: [id])
  executors User[] @relation("ExecutorsOnLogs")  // не используется в UI
}
```

### Singleton PrismaClient (prisma-client.js)
```js
const { PrismaClient } = require("@prisma/client");
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
module.exports = { prisma };
```

---

## 6. API-маршруты

Базовый путь: `/api` (проксируется nginx/vite)

### Аутентификация

| Метод | Путь | Auth | Тело запроса | Ответ |
|---|---|---|---|---|
| POST | `/api/register` | — | `{ email, password, fullName }` | User объект |
| POST | `/api/login` | — | `{ email, password }` | `{ token: string }` (JWT, 7d) |
| GET | `/api/current` | ✓ | — | User с массивом workLogs |
| GET | `/api/user/:id` | ✓ | — | User с массивом workLogs |

### Записи о работах

| Метод | Путь | Auth | Роли | Тело/Query | Ответ |
|---|---|---|---|---|---|
| POST | `/api/worklogs` | ✓ | ADMIN, EXECUTOR | multipart: `objectType`, `object`, `content`, `photo` (file) | WorkLog |
| GET | `/api/worklogs` | ✓ | все | `?page=1&limit=100` (макс 200) | `{ items, total, page, limit }` |

### Администрирование

| Метод | Путь | Auth | Тело запроса | Ответ |
|---|---|---|---|---|
| GET | `/api/admin/users` | ADMIN | — | `AdminUser[]` |
| POST | `/api/admin/users` | ADMIN | `{ email, password, fullName, role }` | AdminUser |
| PATCH | `/api/admin/users/:id/role` | ADMIN | `{ role }` | AdminUser |
| DELETE | `/api/admin/users/:id` | ADMIN | `{ adminPassword }` | `{ success: true }` |

### Статика

| Путь | Описание |
|---|---|
| `/uploads/<filename>` | Фотографии с водяным знаком |

---

## 7. JWT и авторизация

### Payload токена
```json
{
  "userId": "uuid",
  "fullName": "Имя Фамилия",
  "role": "ADMIN | OBSERVER | EXECUTOR",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware `auth.js`
1. Извлекает `Authorization: Bearer <token>` из заголовка
2. Верифицирует через `jwt.verify(token, SECRET_KEY)`
3. Делает запрос в БД `prisma.user.findUnique` для актуальности роли
4. Пишет `req.user = { userId, fullName, role }`

### Middleware `checkRole.js`
```js
checkRole("ADMIN", "EXECUTOR")  // можно передавать несколько ролей
```
Возвращает 403 если `req.user.role` не входит в список.

### Хранение на клиенте
JWT хранится в `localStorage` под ключом `token`.
> ⚠️ Известная уязвимость: риск XSS. Требует переноса на httpOnly cookie.

---

## 8. Водяной знак на фото

Файл: `express_api/controllers/workLog/workLog-service.js`

**Алгоритм:**
1. Получить размеры оригинального изображения через `sharp(filePath).metadata()`
2. Создать canvas того же размера через `@napi-rs/canvas`
3. Нарисовать полупрозрачную чёрную подложку внизу (~15% высоты, `rgba(0,0,0,0.7)`)
4. Написать белым текстом:
   - Строка 1 (крупный шрифт ~7% от base): `objectType + " " + object`
   - Строка 2 (нормальный шрифт ~4% от base): `userName`
   - Строка 3: дата создания файла (`fs.stat().birthtime`)
5. Масштабировать `assets/logo.png` до 20% ширины фото
6. Наложить через `sharp.composite()`: логотип в правый верхний угол, текстовый слой сверху
7. Сохранить обратно в тот же файл (через tmp-файл → rename)

**Размер шрифта адаптируется:**
- Вертикальное фото: `base * 0.03`
- Горизонтальное: `base * 0.05`
- `base = Math.min(width, height)`

---

## 9. Frontend — маршрутизация

```
/            → redirect → /board
/login       → LoginPage (lazy)    — redirect на /board если уже авторизован
/board       → AppHeader + Board   — redirect на /login если нет токена
/admin       → AppHeader + AdminPage — redirect на /board если роль не ADMIN
```

Защита реализована через `loader` в React Router 7.

---

## 10. Глобальный стейт (use-board.ts)

Используется `createGStore` из пакета `create-gstore` — синглтон-хук на основе `useState`.

```ts
{
  workLogList: WorkLog[]        // Все загруженные записи
  currentUser: TokenPayload     // Декодированный JWT payload
  selectedMonth: number         // 0-11 или undefined (все месяцы = 12)
  selectedYear: number          // Текущий год по умолчанию
  selectedObjectType: string    // "НС" | "ОС" | "Все" | undefined
}
```

---

## 11. Страница Board (board.page.tsx)

### Фильтрация
```ts
function applyFilters(workLogs, filters):
  - year: точное совпадение года
  - month: если === 12 → все месяцы; иначе точное совпадение месяца (0-based)
  - objectType: если "Все" → все; иначе точное совпадение
```

### Доступные года
Вычисляются динамически из загруженных записей + текущий год:
```ts
Array.from(new Set([new Date().getFullYear(), ...workLogList.map(wl => new Date(wl.createdAt).getFullYear())])).sort((a,b) => b-a)
```

### Адаптивность
- **Мобильная (< sm):** карточки `<Card>`, фиксированная кнопка внизу экрана
- **Десктоп (≥ sm):** таблица `table-fixed` с фиксированными колонками

### Права в UI
- Кнопка "Фиксация работы" скрыта для `OBSERVER`
- Кнопка "Сформировать отчет" скрыта для `EXECUTOR`

---

## 12. PDF-отчёт

Файлы: `react-client/src/features/board/report/`

### Структура документа (report.tsx)
```
Document → Page (A4)
  ├── Шапка: логотип + название организации
  ├── Заголовок: "АКТ выполненных работ СИТиАС"
  ├── Дата: г. Астана, «{последний день месяца}» {месяц} {год}
  ├── Текст: шаблонное описание периода работ
  ├── Table: список работ за выбранный месяц/год
  ├── Блок подписантов (7 человек, захардкожены)
  └── PhotoGrid: все фото в 2 колонки
```

### Table (table.tsx)
Фильтрует `data` по `monthIndex` и `year`. Колонки: № / Дата / Исполнитель / Объект+тип / Работы.

### Генерация
```ts
const blob = await pdf(<Report .../>).toBlob();
window.open(URL.createObjectURL(blob));
```

---

## 13. Страница Admin (admin.page.tsx)

### Функционал
1. **Список пользователей** — таблица с именем, email, ролью, датой регистрации
2. **Смена роли** — Select прямо в строке таблицы (inline editing)
3. **Создание пользователя** — форма: имя, email, пароль (мин. 8 симв.), роль
4. **Удаление пользователя** — модал с подтверждением паролем администратора

### Защита удаления
- Нельзя удалить себя
- Backend требует пароль администратора (`adminPassword`)
- Backend удаляет все workLogs пользователя перед удалением (`deleteMany`)

---

## 14. Компонент Header (header.tsx)

```
[EES /СИТиАС]  ←→  [Имя*] [Роль*] [Пользователи*] [Выйти]
                           (* hidden на мобильных)
```

- Роль отображается цветным бейджем: красный (ADMIN), синий (OBSERVER), зелёный (EXECUTOR)
- Кнопка "Пользователи" — ссылка на `/admin`, видна только ADMIN
- На мобильных скрыты: имя, роль, кнопка "Пользователи"
- "Выйти": `localStorage.removeItem("token")` + `window.location.href = "/login"`

---

## 15. API-клиент (shared/model/api.ts)

Все запросы централизованы. Авторизация: `Authorization: Bearer {localStorage.getItem("token")}`.

```ts
fetchLogin(data)                          // POST /api/login
fetchWorkLogList(page, limit)             // GET /api/worklogs → WorkLogListResponse
fetchCreateWorkLog(data)                  // POST /api/worklogs (multipart)
fetchUsers()                              // GET /api/admin/users
fetchCreateUser(data)                     // POST /api/admin/users
fetchUpdateUserRole(userId, role)         // PATCH /api/admin/users/:id/role
fetchDeleteUser(userId, adminPassword)    // DELETE /api/admin/users/:id
```

---

## 16. Docker Compose

```yaml
services:
  postgres:
    image: postgres:15
    environment: { POSTGRES_USER: admin, POSTGRES_PASSWORD: password, POSTGRES_DB: mydb }
    volumes: [pg_data:/var/lib/postgresql/data]

  backend:
    build: ./express_api        # Dockerfile внутри express_api/
    container_name: backend
    environment:
      DATABASE_URL: postgres://admin:password@postgres:5432/mydb
    ports: ["4001:5000"]        # хост:контейнер
    depends_on: [postgres]
    volumes: [uploads_data:/app/uploads]

  frontend:
    build: ./react-client       # Multi-stage Dockerfile
    container_name: frontend
    ports: ["4002:80"]

volumes:
  pg_data:
  uploads_data:
```

### Порты снаружи
- Frontend: `http://localhost:4002`
- Backend: `http://localhost:4001`

---

## 17. Переменные окружения

### express_api/.env
```env
DATABASE_URL="postgresql://admin:password@localhost:5432/mydb"
SECRET_KEY="минимум-32-случайных-символа"
```

> В Docker DATABASE_URL передаётся через `environment` в docker-compose.yml.
> SECRET_KEY нужно задать там же или через `.env` файл.

---

## 18. Запуск для разработки

### Вариант 1 — Полный Docker
```bash
docker-compose up -d
# Применить миграции при первом запуске
docker-compose exec backend npx prisma migrate deploy
# Открыть http://localhost:4002
```

### Вариант 2 — Dev-режим (горячая перезагрузка)
```bash
# Backend и БД в Docker
docker-compose up -d postgres backend

# Frontend локально (Vite dev server)
cd react-client
npm install
npm run dev
# Открыть http://localhost:5173
```

Прокси в `vite.config.ts` направляет `/api` и `/uploads` на `http://localhost:4001`.

### Создание первого пользователя
```bash
curl -X POST http://localhost:4001/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123","fullName":"Администратор"}'

# Затем назначить роль ADMIN через Prisma Studio:
docker-compose exec backend npx prisma studio
# или напрямую:
docker-compose exec backend node -e \
  "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();
   p.user.update({where:{email:'admin@example.com'},data:{role:'ADMIN'}}).then(console.log)"
```

---

## 19. Известные ограничения и техдолг

| # | Проблема | Риск | Рекомендация |
|---|---|---|---|
| 1 | JWT в localStorage | XSS-уязвимость | Перенести в httpOnly cookie |
| 2 | CORS без ограничений (`app.use(cors())`) | Любой origin может обращаться к API | Задать `origin: ['https://yourdomain.com']` |
| 3 | Нет тестов | Регрессии незаметны | Добавить integration-тесты для API |
| 4 | Подписанты PDF захардкожены в `report.tsx` | Нельзя менять без деплоя | Перенести в настройки БД или ENV |
| 5 | Пагинация без UI | При >100 записей старые не видны | Добавить кнопку "Загрузить ещё" |
| 6 | Роль CUSTOMER в схеме | Путаница | Удалить если не планируется |
| 7 | `heic-convert` установлен, но закомментирован | Ненужная зависимость | Удалить или раскомментировать |

---

## 20. Типы TypeScript (board-type.ts)

```ts
export type Role = "ADMIN" | "OBSERVER" | "EXECUTOR";

export type WorkLog = {
  id: string;
  objectType: string | null;
  object: string;
  content: string;
  photoUrl: string;
  createdAt: string;
  author: {
    id: string;
    fullName: string;
    email: string;
  };
};

export type Filters = {
  month?: number;    // 0-11, или 12 = все месяцы
  year?: number;
  objectType?: string;
};
```
