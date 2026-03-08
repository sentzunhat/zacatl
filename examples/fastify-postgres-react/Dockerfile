# Build from repository root: docker build -f examples/fastify-postgres-react
FROM node:24-slim AS builder
WORKDIR /app

# Build framework first
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm install --ignore-scripts
RUN npm run build

# Build example - copy entire structure to maintain file:../../.. reference
COPY examples/fastify-postgres-react
WORKDIR /app/examples/fastify-postgres-react

# Install dependencies (this will use file:../../.. which points back to /app)
RUN npm install --ignore-scripts

# Build the backend and frontend apps
RUN npm run build

# Prune dev dependencies at the root level (framework dependencies)
WORKDIR /app
RUN npm prune --omit=dev

# Prune example dependencies
WORKDIR /app/examples/fastify-postgres-react
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app
ENV NODE_ENV=production

# Copy example workspace (backend/frontend/node_modules/dist)
COPY --from=builder /app/examples/fastify-postgres-react/ ./

# Copy framework files into node_modules/@sentzunhat/zacatl
COPY --from=builder /app/build-src-esm ./node_modules/@sentzunhat/zacatl/build-src-esm
COPY --from=builder /app/build-src-cjs ./node_modules/@sentzunhat/zacatl/build-src-cjs
COPY --from=builder /app/package.json ./node_modules/@sentzunhat/zacatl/package.json
COPY --from=builder /app/node_modules ./node_modules/@sentzunhat/zacatl/node_modules
COPY --from=builder /app/src/localization/locales ./node_modules/@sentzunhat/zacatl/src/localization/locales
COPY --from=builder /app/src/eslint ./node_modules/@sentzunhat/zacatl/src/eslint

EXPOSE 8083
CMD ["/app/backend/dist/index.js"]
