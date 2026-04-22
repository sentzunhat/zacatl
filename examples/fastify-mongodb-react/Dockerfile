# Build from repository root: docker build -f examples/fastify-mongodb-react/Dockerfile .
# Prerequisites:
#   1. npm run build (framework)
#   2. npm run local:exports (generate exports map)
#   3. cd examples/fastify-mongodb-react && npm install && npm run build
FROM node:24-slim AS builder
WORKDIR /app

COPY build-src-esm ./build-src-esm
COPY build-src-cjs ./build-src-cjs
COPY package.json ./
COPY src/localization/locales ./src/localization/locales
COPY src/eslint ./src/eslint

# Copy only the built example (no source compilation in Docker)
COPY examples/fastify-mongodb-react/backend/dist ./examples/fastify-mongodb-react/backend/dist
COPY examples/fastify-mongodb-react/frontend/dist ./examples/fastify-mongodb-react/frontend/dist
COPY examples/fastify-mongodb-react/backend/package.json ./examples/fastify-mongodb-react/backend/package.json
COPY examples/fastify-mongodb-react/frontend/package.json ./examples/fastify-mongodb-react/frontend/package.json
COPY examples/fastify-mongodb-react/package.json ./examples/fastify-mongodb-react/package.json

# Install production dependencies only
WORKDIR /app
RUN npm install --omit=dev

WORKDIR /app/examples/fastify-mongodb-react
RUN npm install --omit=dev --workspaces

RUN npm prune --omit=dev
WORKDIR /app
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/examples/fastify-mongodb-react/ ./
COPY --from=builder /app/build-src-esm ./node_modules/@sentzunhat/zacatl/build-src-esm
COPY --from=builder /app/build-src-cjs ./node_modules/@sentzunhat/zacatl/build-src-cjs
COPY --from=builder /app/package.json ./node_modules/@sentzunhat/zacatl/package.json
COPY --from=builder /app/node_modules ./node_modules/@sentzunhat/zacatl/node_modules
COPY --from=builder /app/src/localization/locales ./node_modules/@sentzunhat/zacatl/src/localization/locales
COPY --from=builder /app/src/eslint ./node_modules/@sentzunhat/zacatl/src/eslint

EXPOSE 8082
CMD ["/app/backend/dist/index.js"]
