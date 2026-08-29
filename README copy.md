# Booking Calendar

[![Actions Status](https://github.com/DimRux/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/DimRux/ai-for-developers-project-386/actions)

Календарь бронирований (аналог cal.com) — npm workspaces монорепозиторий с `spec/`, `front/` и `back/`.

## Демо (прод)

Опубликованное приложение: **https://booking-calendar-2axw.onrender.com**

Задеплоено на Render из корневого `Dockerfile`. Один контейнер обслуживает и SPA,
и REST API (`/api/v1`) на порту из переменной окружения `PORT`.

## Быстрый старт

### Требования

- Node.js 22+
- npm (workspace mode)

### Разработка

```bash
# Установка зависимостей
npm install

# Миграции базы данных и заполнение демо-данными
npm run db:migrate
npm run db:seed

# Запуск бэкенда и фронтенда одновременно
npm run dev
# → Бэкенд: http://localhost:3000/api/v1
# → Фронтенд: http://localhost:5173
```

Или запускайте по отдельности:

```bash
npm run back:dev    # NestJS в режиме watch на порту 3000
npm run front:dev   # Vite на порту 5173, проксирует /api → localhost:3000
```

### Режим мока (без бэкенда)

```bash
npm run front:mock  # Prism mock API (порт 4010) + Vite dev server
```

### Docker

```bash
docker compose up --build
# → Бэкенд: http://localhost:3000/api/v1
# → Фронтенд: http://localhost:8080 (nginx)
```

### Тестирование

```bash
npm run back:test   # Интеграционные тесты API (Jest + supertest)
npm run e2e         # E2E тесты (Playwright)
npm run e2e:ui      # Playwright в режиме UI
```

### Smoke-тесты

```bash
cd back
node dist/main.js &
sleep 2
bash scripts/smoke.sh
# 17 проверок, покрывающих все 9 API-операций
```

## Доступные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск бэкенда + фронтенда параллельно |
| `npm run back:dev` | Бэкенд в режиме watch |
| `npm run front:dev` | Dev-сервер фронтенда |
| `npm run front:mock` | Фронтенд с Prism mock (бэкенд не нужен) |
| `npm run back:build` | Сборка бэкенда |
| `npm run front:build` | Сборка фронтенда |
| `npm run sync:contract` | Перегенерация типов из TypeSpec для обоих workspace |
| `npm run db:migrate` | Запуск Prisma миграций |
| `npm run db:seed` | Заполнение Owner + демо EventTypes |
| `npm run db:reset` | Сброс базы данных |
| `npm run back:test` | Интеграционные тесты API |
| `npm run e2e` | E2E тесты Playwright |
| `npm run e2e:ui` | Playwright в интерактивном режиме |

## Структура проекта

```
booking-calendar/
├── spec/                  # API-контракт (TypeSpec → OpenAPI)
│   ├── main.tsp           # Исходный код API
│   ├── generated/         # Сгенерированный OpenAPI 3.1
│   └── DOMAIN.md          # Доменная модель и инварианты
├── front/                 # React SPA (Vite + Tailwind + shadcn/ui)
│   ├── src/
│   │   ├── app/           # Провайдеры, маршруты, глобальные стили
│   │   ├── pages/         # Компоненты страниц
│   │   ├── widgets/       # Составные UI-блоки
│   │   ├── features/      # Пользовательские взаимодействия
│   │   ├── entities/      # Доменные модели
│   │   ├── components/ui/ # shadcn/ui примитивы
│   │   ├── shared/        # API-клиент, конфигурация, утилиты
│   │   ├── lib/           # Вспомогательные функции
│   │   └── assets/        # Статические ресурсы
│   └── nginx.conf         # Конфигурация nginx для Docker
├── back/                  # NestJS REST API
│   ├── prisma/            # Схема, миграции, seed
│   ├── test/              # Интеграционные тесты
│   ├── scripts/           # Smoke-тесты
│   └── src/
│       ├── owner/         # Профиль владельца (read-only)
│       ├── event-types/   # Админские + публичные контроллеры
│       ├── bookings/      # Админские + публичные контроллеры
│       ├── slots/         # Движок генерации слотов
│       ├── common/        # Ошибки, фильтры, DTO
│       └── shared/        # Сгенерированные API-типы
├── e2e/                   # E2E тесты Playwright
├── docs/                  # Документация
│   └── TEST-SCENARIOS.md  # Сценарии тестирования (US-1..US-7)
├── docker-compose.yml     # Полный стек
├── Dockerfile             # Dockerfiles для бэкенда и фронтенда
├── playwright.config.ts   # Конфигурация Playwright
├── CONTRIBUTING.md        # Руководство по внесению вклада
└── package.json           # Корневые скрипты workspace
```

## Конвенция коммитов

Все коммиты должны соответствовать формату [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>
```

**Типы:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Скоупы:** `back`, `front`, `spec`, `ci`, `deps`

**Примеры:**
```
feat(back): add global occupancy check for slots
fix(front): correct slot timezone rendering in calendar
test(back): add integration tests for booking creation
```

## Лицензия

MIT
