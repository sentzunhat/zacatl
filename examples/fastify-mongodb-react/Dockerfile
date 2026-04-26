# Build from repository root: docker build -f examples/fastify-mongodb-react/Dockerfile .
# This Dockerfile builds framework artifacts and the example in-container.
FROM node:24-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY tsconfig.json tsconfig.cjs.json ./
COPY build-scripts-esm ./build-scripts-esm
COPY src ./src
COPY scripts ./scripts

RUN npm ci
RUN npm run build:src
RUN npm prune --omit=dev

COPY examples/fastify-mongodb-react ./examples/fastify-mongodb-react
WORKDIR /app/examples/fastify-mongodb-react
RUN npm install
RUN npx tsc -p apps/backend/tsconfig.json \
  && node /app/build-scripts-esm/build/fix-esm.js apps/backend/dist \
  && npm --prefix apps/frontend run build
RUN npm prune --omit=dev

# Materialize local Zacatl package files in example node_modules so runtime does not
# depend on workspace symlink targets outside the copied example tree.
RUN rm -rf node_modules/@sentzunhat/zacatl \
  && mkdir -p node_modules/@sentzunhat/zacatl \
  && cp -R /app/build-src-esm node_modules/@sentzunhat/zacatl/build-src-esm \
  && cp -R /app/build-src-cjs node_modules/@sentzunhat/zacatl/build-src-cjs \
  && cp /app/package.json node_modules/@sentzunhat/zacatl/package.json \
  && mkdir -p node_modules/@sentzunhat/zacatl/src/localization \
  && cp -R /app/src/localization/locales node_modules/@sentzunhat/zacatl/src/localization/locales \
  && mkdir -p node_modules/@sentzunhat/zacatl/src \
  && cp -R /app/src/eslint node_modules/@sentzunhat/zacatl/src/eslint \
  && mkdir -p node_modules/@sentzunhat/zacatl/node_modules \
  && cp -R /app/node_modules/. node_modules/@sentzunhat/zacatl/node_modules/

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app/examples/fastify-mongodb-react/apps/backend
ENV NODE_ENV=production

COPY --chown=nonroot:nonroot --from=builder /app/examples/fastify-mongodb-react/node_modules /app/examples/fastify-mongodb-react/node_modules
COPY --chown=nonroot:nonroot --from=builder /app/examples/fastify-mongodb-react/apps/backend/dist ./dist
COPY --chown=nonroot:nonroot --from=builder /app/examples/fastify-mongodb-react/apps/frontend/dist ../frontend/dist

EXPOSE 8082
CMD ["dist/index.js"]
