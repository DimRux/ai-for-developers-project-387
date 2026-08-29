FROM node:22-alpine AS base
RUN apk add --no-cache sqlite
WORKDIR /app

FROM base AS deps
COPY back/package.json back/package-lock.json ./
COPY spec/package.json spec/package-lock.json ../spec/
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/spec/node_modules ../spec/node_modules
COPY back/ ./
COPY spec/generated/openapi.yaml ../spec/generated/openapi.yaml
RUN npx prisma generate
RUN npx openapi-typescript ../spec/generated/openapi.yaml -o src/shared/api-types.ts
RUN npm run build

FROM base AS runtime
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY back/prisma ./prisma
COPY back/.env ./
RUN npx prisma generate

EXPOSE 3000

COPY back/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
