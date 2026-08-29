# AGENTS.md

## Project Overview

Booking Calendar (cal.com-like) — npm workspaces monorepo with `spec/`, `front/`, and `back/`.

## Workspace Layout

| Workspace | Purpose | Tech |
|-----------|---------|------|
| `spec/` | API contract | TypeSpec → OpenAPI 3.1 (`spec/generated/openapi.yaml`) |
| `front/` | SPA | React 19, Vite 8, TypeScript 6, Tailwind CSS 4, shadcn/ui (base-nova) |
| `back/` | REST API | NestJS 11, Prisma (SQLite), Luxon (timezone-safe slot engine) |

## Key Commands (from repo root)

```bash
# Contract → types pipeline (generates for both front and back)
npm run sync:contract          # compile TypeSpec → generate types for front + back

# Or step by step:
npm run spec:compile           # tsp compile . → generated/openapi.yaml
npm run front:api:gen          # openapi-typescript → front/src/shared/api/types.ts
npm run back:api:gen           # openapi-typescript → back/src/shared/api-types.ts

# Frontend
npm run front:dev              # Vite dev server (port 5173) → proxies to back:3000
npm run front:mock             # Prism mock API (port 4010) + Vite dev server
npm run front:lint             # eslint .
npm run front:build            # tsc -b && vite build

# Backend
npm run back:dev               # NestJS watch mode (port 3000)
npm run back:build             # nest build
npm run back:start             # node dist/main (production)
npm run back:lint              # eslint .

# Database (from back/ workspace)
npm run db:migrate             # prisma migrate dev
npm run db:seed                # seed Owner + demo EventTypes
npm run db:reset               # prisma migrate reset --force

# Testing
npm run back:test              # API integration tests (Jest + supertest)
npm run e2e                    # Playwright E2E tests (starts back + front)
npm run e2e:ui                 # Playwright UI mode

# Development
npm run dev                    # concurrently back:dev + front:dev

# Spec
npm run spec:compile           # tsp compile . → OpenAPI 3.1
npm run spec:watch             # tsp compile . --watch
npm run spec:format            # tsp format "**/*.tsp"
```

## Contract-to-Types Flow

1. Edit `spec/main.tsp` (TypeSpec source of truth)
2. Run `npm run sync:contract` — compiles TypeSpec to OpenAPI, then generates types for both workspaces
3. Frontend imports types from `front/src/shared/api/types.ts`
4. Backend imports types from `back/src/shared/api-types.ts` (convenience aliases: `Booking`, `EventType`, etc.)

**Important**: The generated `types.ts` files are committed to git. Always run `sync:contract` after editing `main.tsp`.

## Frontend Architecture

Feature-Sliced Design structure under `front/src/`:

- `app/` — providers (React Query), routes, global styles
- `pages/` — route-level components: home, event-type, booking-confirmation, admin (dashboard, event-types), not-found
- `widgets/` — composite UI blocks: booking-form, bookings-table, event-type-card, event-types-list, slots-calendar
- `features/` — user interactions: create-booking, create-event-type, filter-bookings
- `entities/` — domain models: booking, event-type, owner, slot
- `components/ui/` — shadcn/ui primitives (button, calendar, card, dialog, input, label, select, table, toast)
- `shared/` — API client (axios, baseURL `/api/v1`), config, UI primitives (shadcn), lib utilities
- `lib/utils.ts` — utility functions (cn helper for classnames)
- `assets/` — static assets (images, icons)

Path alias: `@/` → `front/src/`

## Backend Architecture

NestJS modules under `back/src/`:

- `owner/` — read-only controller + service for the single Owner profile
- `event-types/` — admin (create + list) and public (list + get) controllers
- `bookings/` — public (create + get) and admin (list with scope/filter) controllers
- `slots/` — slot generation engine (Luxon timezone math, global occupancy check)
- `prisma/` — global PrismaService module
- `common/` — ApiException (typed error codes), ApiExceptionFilter, ValidationPipe, PaginationQuery DTO
- `shared/api-types.ts` — generated from OpenAPI, re-exported as flat aliases

### Key invariants enforced in backend:

- **Global occupancy**: booking `[start; end)` checked against ALL existing bookings, not just same event type
- **Slot alignment**: `start` must be on the step grid from `workingHours.start` in Owner's timezone
- **Booking window**: only `[now; now + bookingWindowDays)` allowed
- **Atomic transactions**: `prisma.$transaction` for check-and-create in booking creation

### Error codes (from contract):

| Code | HTTP | When |
|------|------|------|
| `SLOT_TAKEN` | 409 | Time overlaps any existing booking |
| `SLOT_OUT_OF_WINDOW` | 400 | Start outside allowed window |
| `SLOT_NOT_ALIGNED` | 400 | Start not on step grid or exceeds working hours |
| `EVENT_TYPE_NOT_FOUND` | 404 | Event type doesn't exist |
| `EVENT_TYPE_ID_CONFLICT` | 409 | Duplicate event type ID |
| `BOOKING_NOT_FOUND` | 404 | Booking doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request body |

## Dev Server Setup

- Backend: NestJS on port 3000, serves `/api/v1/*`
- Frontend: Vite on port 5173, proxies `/api` to backend
- `.env.development` (front): `VITE_API_PROXY_TARGET=http://localhost:3000`, `VITE_API_STRIP_PREFIX=false`
- `.env.mock` (front): `VITE_API_PROXY_TARGET=http://localhost:4010`, `VITE_API_STRIP_PREFIX=true` (for Prism)
- `.env.development` (back): `DATABASE_URL=file:./dev.db`, owner config, `SEED_DEMO=true`
- Use `npm run front:mock` for Prism-only development without backend

## Database

- SQLite file: `back/prisma/dev.db` (gitignored)
- Schema: `back/prisma/schema.prisma`
- Seed: `back/prisma/seed.ts` — creates Owner from env vars + 2 demo EventTypes when `SEED_DEMO=true`
- Prisma client generated into root `node_modules/@prisma/client`

## Linting & Formatting

- ESLint 9 with typescript-eslint + prettier plugin (same config in front/ and back/)
- Prettier: semi, single quotes, trailing comma es5, printWidth 100, tabWidth 2
- Unused vars: `@typescript-eslint/no-unused-vars` warns on `_`-prefixed names

## TypeSpec Notes

- API base path: `/api/v1`
- No authentication (`securitySchemes` absent by design)
- Global slot availability: bookings block slots across all event types
- `spec/DOMAIN.md` contains full domain model and invariants — read it for business logic context
- Redocly lint warning about `security-defined` is expected and should be ignored

## Smoke Tests

- `back/scripts/smoke.sh` — 17 curl-based checks covering all 9 API operations
- Run: `cd back && node dist/main.js & sleep 2 && bash scripts/smoke.sh`

## Docker

```bash
docker compose up --build    # backend on :3000, frontend on :8080 (nginx)
```

- `back/Dockerfile` — multi-stage build for NestJS backend
- `front/Dockerfile` — multi-stage build with nginx for frontend
- `front/nginx.conf` — nginx config for SPA routing and API proxy
- `back/docker-entrypoint.sh` — runs migrations and seeds before starting the server
- `back/.env.example`, `front/.env.example` — example environment files

## Documentation

- `docs/TEST-SCENARIOS.md` — detailed user scenarios (US-1 through US-7) for integration testing
- `spec/DOMAIN.md` — full domain model and invariants
- `CONTRIBUTING.md` — commit convention and contribution guidelines

## Testing

### API Integration Tests (Jest + supertest)

Located in `back/test/`. Run with `npm run back:test`.

Test files:
- `booking-flow.e2e-spec.ts` — US-1..US-4: full booking lifecycle, slot availability, double booking, global occupancy
- `admin.e2e-spec.ts` — US-5..US-6: owner profile, event type CRUD, admin bookings list
- `errors.e2e-spec.ts` — US-7: all error codes (VALIDATION_ERROR, SLOT_TAKEN, SLOT_NOT_ALIGNED, etc.)

Helpers:
- `helpers/app.ts` — creates NestJS test app with same pipes/filters as production
- `helpers/slots.ts` — dynamically finds first available slot from API
- `setup-db.js` — creates fresh test database (test.db) with migrations + seed

### E2E Tests (Playwright)

Located in `e2e/`. Run with `npm run e2e`.

Test files:
- `booking.spec.ts` — end-to-end booking flow through the UI
- `admin.spec.ts` — admin dashboard and event type management

Setup:
- `setup-backend.sh` — prepares e2e.db, builds and starts backend
- `playwright.config.ts` — starts both backend and frontend via webServer config

## Commit Convention

All commits MUST follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>[optional scope]: <description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes:** `back`, `front`, `spec`, `ci`, `deps` (= workspace name)

**Examples:**
```
feat(back): add global occupancy check for slots
fix(front): correct slot timezone rendering in calendar
test(back): add integration tests for booking creation
ci: add Playwright E2E workflow
```

**Rules:**
- Imperative mood ("add" not "added")
- No capitalization of first letter
- No period at end
- Under 72 characters
- One logical change per commit

See `CONTRIBUTING.md` for full specification.

## Release Automation

This project uses [release-please](https://github.com/googleapis/release-please) for automated releases.

- Workflow: `.github/workflows/release-please.yml`
- Config: `release-please-config.json`
- Manifest: `.release-please-manifest.json`
- Strategy: `node` (bumps `version` in root `package.json`, generates `CHANGELOG.md`)
- Starts from version `1.0.0`

After merging Conventional Commits to `main`, release-please automatically:
1. Creates/updates a release PR with changelog and proposed version bump
2. When the release PR is merged, creates a GitHub Release

## CI

- `.github/workflows/ci.yml` — runs on push to any branch and PRs to main
  - **lint-build**: npm ci, prisma generate, sync:contract, lint (front + back), build (front + back)
  - **api-tests**: Jest integration tests (needs lint-build)
  - **e2e**: Playwright E2E tests (needs lint-build)
- `.github/workflows/release-please.yml` — automated releases on push to main
- `.github/workflows/hexlet-check.yml` — **Do not edit or delete**
