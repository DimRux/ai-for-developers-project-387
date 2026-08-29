#!/bin/bash
set -e

cd "$(dirname "$0")/../back"

rm -f e2e.db

export DATABASE_URL="file:./e2e.db"
export SEED_DEMO=true
export OWNER_NAME="Владелец календаря"
export OWNER_EMAIL="owner@example.com"
export OWNER_TIMEZONE="Europe/Moscow"
export OWNER_WORKING_HOURS_START="10:00:00"
export OWNER_WORKING_HOURS_END="19:00:00"
export OWNER_SLOT_STEP_MINUTES=30
export OWNER_BOOKING_WINDOW_DAYS=14

npx prisma migrate deploy

npx ts-node --project tsconfig.json prisma/seed.ts

npm run build

npm run start:prod
