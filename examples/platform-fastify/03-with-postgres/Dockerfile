# Multi-stage Docker build for Fastify + PostgreSQL + React monorepo using Bun

# Stage 1: Build stage (both backend and frontend)
FROM oven/bun:1-alpine AS builder
WORKDIR /repo

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy framework build directory and root package.json
COPY package.json ./package.json
COPY build ./build
COPY src ./src

# Copy shared directory (resolve symlink by copying actual content)
COPY examples/shared ./examples/shared

# Copy example project files
COPY examples/platform-fastify/03-with-postgres ./examples/platform-fastify/03-with-postgres

# Navigate to example directory
WORKDIR /repo/examples/platform-fastify/03-with-postgres

# Install dependencies at workspace root (skip verification and scripts to avoid hanging)
RUN bun install --frozen-lockfile --no-verify --ignore-scripts

# Install dependencies for each app separately if needed
RUN cd apps/backend && bun install --no-verify --ignore-scripts || true
RUN cd apps/frontend && bun install --no-verify --ignore-scripts || true

# Build frontend only (backend runs TS directly with Bun)
RUN cd apps/frontend && bun run build

# Stage 2: Production runtime
FROM oven/bun:1-alpine
WORKDIR /repo/examples/platform-fastify/03-with-postgres

# Install runtime utilities
RUN apk add --no-cache dumb-init curl

# Copy backend source and frontend dist
COPY --from=builder /repo/examples/platform-fastify/03-with-postgres/apps/backend/src ./apps/backend/src
COPY --from=builder /repo/examples/platform-fastify/03-with-postgres/apps/frontend/dist ./apps/frontend/dist

# Copy package files
COPY --from=builder /repo/package.json /repo/package.json
COPY --from=builder /repo/build /repo/build
COPY --from=builder /repo/src /repo/src
COPY --from=builder /repo/examples/shared /repo/examples/shared
COPY examples/platform-fastify/03-with-postgres/package.json ./package.json
COPY examples/platform-fastify/03-with-postgres/apps/backend/package.json ./apps/backend/package.json
COPY examples/platform-fastify/03-with-postgres/apps/frontend/package.json ./apps/frontend/package.json

# Copy node_modules from builder (already has all dependencies)
COPY --from=builder /repo/examples/platform-fastify/03-with-postgres/node_modules ./node_modules

# Install framework dependencies at repo root - this creates /repo/node_modules with framework deps
RUN cd /repo && bun install --frozen-lockfile --no-verify --ignore-scripts

# Expose backend port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/greetings || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Start backend TypeScript directly (Bun runs TS natively)
CMD ["bun", "apps/backend/src/index.ts"]
