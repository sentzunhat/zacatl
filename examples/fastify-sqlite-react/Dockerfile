# Build from repository root: docker build -f examples/fastify-sqlite-react/Dockerfile .
# This Dockerfile is self-contained and builds required framework artifacts in-container.
FROM node:26-bookworm-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY tsconfig.base.json ./
COPY tsconfig.json tsconfig.cjs.json ./
COPY publish/package.json ./publish/package.json
COPY build-scripts-esm ./build-scripts-esm
COPY src ./src
COPY scripts ./scripts

RUN npm ci
RUN npm run build:src
RUN mkdir -p publish/build \
  && cp -R build-src-esm/. publish/build/esm \
  && cp -R build-src-cjs/. publish/build/cjs
RUN npm prune --omit=dev

COPY examples/fastify-sqlite-react ./examples/fastify-sqlite-react
WORKDIR /app/examples/fastify-sqlite-react
RUN npm ci && npm_config_build_from_source=true npm rebuild sqlite3 && npm run build

RUN npm prune --omit=dev

# Materialize local Zacatl package files in example node_modules so runtime does not
# depend on workspace symlink targets outside the copied example tree.
RUN rm -rf node_modules/@sentzunhat/zacatl \
  && rm -rf node_modules/@zacatl \
  && mkdir -p node_modules/@sentzunhat/zacatl \
  && mkdir -p node_modules/@zacatl \
  && cp -R /app/publish/. node_modules/@sentzunhat/zacatl/ \
  && cp -R /app/publish/. node_modules/@zacatl/ \
  && mkdir -p node_modules/@sentzunhat/zacatl/node_modules \
  && mkdir -p node_modules/@zacatl/node_modules \
  && cp -R /app/node_modules/. node_modules/@sentzunhat/zacatl/node_modules/ \
  && cp -R /app/node_modules/. node_modules/@zacatl/node_modules/ \
  && rm -f /app/examples/fastify-sqlite-react/database.sqlite

FROM node:26-bookworm-slim
WORKDIR /app/examples/fastify-sqlite-react/apps/backend
ENV NODE_ENV=production

COPY --from=builder /app/examples/fastify-sqlite-react/node_modules /app/examples/fastify-sqlite-react/node_modules
COPY --from=builder /app/examples/fastify-sqlite-react/apps/backend/dist ./dist
COPY --from=builder /app/examples/fastify-sqlite-react/apps/frontend/dist ../frontend/dist

EXPOSE 8081
CMD ["dist/index.js"]
