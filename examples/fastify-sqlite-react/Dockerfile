# Build from repository root: docker build -f examples/fastify-sqlite-react/Dockerfile .
# This Dockerfile is self-contained and builds required framework artifacts in-container.
FROM node:24-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.cjs.json ./
COPY publish/package.json ./publish/package.json
COPY src ./src
COPY scripts ./scripts

RUN npm ci
RUN npm run build:src
RUN npm prune --omit=dev

COPY examples/fastify-sqlite-react ./examples/fastify-sqlite-react
WORKDIR /app/examples/fastify-sqlite-react
RUN npm ci && npm_config_build_from_source=true npm rebuild sqlite3 && npm run build

RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app/backend
ENV NODE_ENV=production

COPY --from=builder /app/examples/fastify-sqlite-react/backend ./
COPY --from=builder /app/examples/fastify-sqlite-react/frontend/dist ../frontend/dist
COPY --from=builder /app/examples/fastify-sqlite-react/node_modules ../node_modules
COPY --from=builder /app/build-src-esm ../node_modules/@sentzunhat/zacatl/build/esm
COPY --from=builder /app/build-src-cjs ../node_modules/@sentzunhat/zacatl/build/cjs
COPY --from=builder /app/publish/package.json ../node_modules/@sentzunhat/zacatl/package.json
COPY --from=builder /app/node_modules ../node_modules/@sentzunhat/zacatl/node_modules
COPY --from=builder /app/src/localization/locales ../node_modules/@sentzunhat/zacatl/src/localization/locales

EXPOSE 8081
CMD ["dist/index.js"]
