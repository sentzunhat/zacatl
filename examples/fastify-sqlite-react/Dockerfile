# Build from repository root: docker build -f examples/fastify-sqlite-react/Dockerfile .
# Note: Requires `npm run build` to be run locally first
FROM node:24-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY build-src-esm ./build-src-esm
COPY build-src-cjs ./build-src-cjs
COPY package.json package-lock.json ./
COPY src/localization/locales ./src/localization/locales
COPY src/eslint ./src/eslint
COPY scripts/build/fix-esm.ts ./scripts/build/fix-esm.ts
COPY scripts/utils ./scripts/utils

RUN npm install --omit=dev

COPY examples/fastify-sqlite-react ./examples/fastify-sqlite-react
WORKDIR /app/examples/fastify-sqlite-react
RUN npm install && npm rebuild sqlite3 && npm run build

WORKDIR /app
RUN npm prune --omit=dev
WORKDIR /app/examples/fastify-sqlite-react
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/examples/fastify-sqlite-react/ ./
COPY --from=builder /app/src/localization/locales ./src/localization/locales
COPY --from=builder /app/build-src-esm ./node_modules/@sentzunhat/zacatl/build-src-esm
COPY --from=builder /app/build-src-cjs ./node_modules/@sentzunhat/zacatl/build-src-cjs
COPY --from=builder /app/package.json ./node_modules/@sentzunhat/zacatl/package.json
COPY --from=builder /app/node_modules ./node_modules/@sentzunhat/zacatl/node_modules
COPY --from=builder /app/src/localization/locales ./node_modules/@sentzunhat/zacatl/src/localization/locales
COPY --from=builder /app/src/eslint ./node_modules/@sentzunhat/zacatl/src/eslint

EXPOSE 8084
CMD ["/app/backend/dist/index.js"]
