FROM node:22-alpine AS base
WORKDIR /repo
RUN apk add --no-cache sqlite

FROM base AS deps
COPY package.json package-lock.json ./
COPY back/package.json back/
COPY front/package.json front/
COPY spec/package.json spec/
RUN npm install --no-audit --no-fund --workspaces --include-workspace-root

FROM deps AS contract
COPY spec/ spec/
RUN npm run spec:compile

FROM contract AS types
COPY back/ back/
COPY front/ front/
RUN npm run back:api:gen && npm run front:api:gen

FROM types AS back-build
RUN npm run back:build

FROM types AS front-build
RUN npm run front:build

FROM node:22-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache sqlite

COPY --from=deps /repo/node_modules ./node_modules
COPY --from=back-build /repo/back/dist ./dist
COPY --from=back-build /repo/back/prisma ./prisma
COPY --from=front-build /repo/front/dist ./public
COPY back/docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
ENV DATABASE_URL=file:./prisma/dev.db
RUN npx prisma generate

ENV PORT=3000
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
