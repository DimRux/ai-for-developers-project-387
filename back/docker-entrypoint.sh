#!/bin/sh
set -e

echo "Running migrations..."
npx prisma migrate deploy

# Seeding (Owner + demo data) is handled in-app on bootstrap by SeedService,
# so it works reliably without ts-node/tsconfig in the runtime image.

echo "Starting server..."
exec "$@"
