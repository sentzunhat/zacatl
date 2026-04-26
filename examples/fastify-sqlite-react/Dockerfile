# Build from repository root: docker build -f examples/fastify-sqlite-react/Dockerfile .
# This Dockerfile is self-contained and builds required framework artifacts in-container.
FROM node:24-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.cjs.json ./
COPY publish/package.json ./publish/package.json
COPY build-scripts-esm ./build-scripts-esm
COPY src ./src
COPY scripts ./scripts

RUN npm ci
RUN npm run build:src
RUN npm prune --omit=dev

COPY examples/fastify-sqlite-react ./examples/fastify-sqlite-react
WORKDIR /app/examples/fastify-sqlite-react
RUN npm ci && npm_config_build_from_source=true npm rebuild sqlite3 && npm run build

RUN npm prune --omit=dev

# Materialize local Zacatl package files in example node_modules so runtime does not
# depend on workspace symlink targets outside the copied example tree.
RUN rm -rf node_modules/@sentzunhat/zacatl \
  && mkdir -p node_modules/@sentzunhat/zacatl/build \
  && cp -R /app/build-src-esm node_modules/@sentzunhat/zacatl/build/esm \
  && cp -R /app/build-src-cjs node_modules/@sentzunhat/zacatl/build/cjs \
  && cp /app/publish/package.json node_modules/@sentzunhat/zacatl/package.json \
  && mkdir -p node_modules/@sentzunhat/zacatl/src/localization \
  && cp -R /app/src/localization/locales node_modules/@sentzunhat/zacatl/src/localization/locales \
  && mkdir -p node_modules/@sentzunhat/zacatl/node_modules \
  && cp -R /app/node_modules/. node_modules/@sentzunhat/zacatl/node_modules/ \
  && rm -f /app/examples/fastify-sqlite-react/database.sqlite

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app/examples/fastify-sqlite-react/apps/backend
ENV NODE_ENV=production

COPY --chown=nonroot:nonroot --from=builder /app/examples/fastify-sqlite-react/node_modules /app/examples/fastify-sqlite-react/node_modules
COPY --chown=nonroot:nonroot --from=builder /app/examples/fastify-sqlite-react/apps/backend/dist ./dist
COPY --chown=nonroot:nonroot --from=builder /app/examples/fastify-sqlite-react/apps/frontend/dist ../frontend/dist

EXPOSE 8081
CMD ["dist/index.js"]
