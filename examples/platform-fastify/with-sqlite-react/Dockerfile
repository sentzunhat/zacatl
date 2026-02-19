# Build from repository root: docker build -f examples/platform-fastify/with-sqlite/Dockerfile -t zacatl-fastify-sqlite .
FROM node:24-slim AS builder
WORKDIR /app

# Install build tools needed for native modules
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Build framework first
COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY scripts ./scripts
RUN npm install --ignore-scripts
RUN npm run build

# Build example - copy entire structure to maintain file:../../.. reference
COPY examples/platform-fastify/with-sqlite ./examples/platform-fastify/with-sqlite
WORKDIR /app/examples/platform-fastify/with-sqlite

# Install dependencies (this will use file:../../.. which points back to /app)
RUN npm install --ignore-scripts

# Rebuild native modules for the target platform
RUN npm rebuild sqlite3

# Build the backend and frontend apps
RUN npm run build

# Prune dev dependencies at the root level (framework dependencies)
WORKDIR /app
RUN npm prune --omit=dev

# Prune example dependencies
WORKDIR /app/examples/platform-fastify/with-sqlite
RUN npm prune --omit=dev

FROM gcr.io/distroless/nodejs24-debian12:nonroot
WORKDIR /app
ENV NODE_ENV=production

# Copy example node_modules and built apps
COPY --from=builder /app/examples/platform-fastify/with-sqlite/node_modules ./node_modules
COPY --from=builder /app/examples/platform-fastify/with-sqlite/apps/backend/package.json ./apps/backend/package.json
COPY --from=builder /app/examples/platform-fastify/with-sqlite/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/examples/platform-fastify/with-sqlite/apps/frontend/dist ./apps/frontend/dist

# Copy framework files into node_modules/@sentzunhat/zacatl
COPY --from=builder /app/build ./node_modules/@sentzunhat/zacatl/build
COPY --from=builder /app/package.json ./node_modules/@sentzunhat/zacatl/package.json
COPY --from=builder /app/node_modules ./node_modules/@sentzunhat/zacatl/node_modules
COPY --from=builder /app/src/localization/locales ./node_modules/@sentzunhat/zacatl/src/localization/locales
COPY --from=builder /app/src/eslint ./node_modules/@sentzunhat/zacatl/src/eslint

EXPOSE 8081
CMD ["/app/apps/backend/dist/index.js"]
