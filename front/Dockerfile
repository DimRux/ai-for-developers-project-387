FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY front/package.json front/package-lock.json ./
COPY spec/package.json spec/package-lock.json ../spec/
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/spec/node_modules ../spec/node_modules
COPY front/ ./
COPY spec/generated/openapi.yaml ../spec/generated/openapi.yaml
RUN npx openapi-typescript ../spec/generated/openapi.yaml -o src/shared/api/types.ts
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY front/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
