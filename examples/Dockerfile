# Consolidated Dockerfile for all Zacatl examples
# Lean, minimal alpine-based two-stage build for all examples
#
# Usage: docker build \
#          --build-arg EXAMPLE=fastify-sqlite-react \
#          --build-arg PORT=8081 \
#          -t zacatl-fastify-sqlite-react .
#
# Two-stage build:
#   Stage 1: node:26-alpine (builder with npm, build tools)
#   Stage 2: node:26-alpine (runtime, lean)
#
# Single Dockerfile for all 8+ examples - no duplication

ARG EXAMPLE=fastify-sqlite-react
ARG BACKEND=apps/backend
ARG FRONTEND=apps/frontend
ARG PORT=8080

# ── Stage 1: build zacatl + example (alpine with tools) ────────────────────
FROM node:26-alpine AS builder

RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
COPY scripts ./scripts
COPY build-scripts-esm ./build-scripts-esm
RUN npm run build && npm prune --omit=dev

# ── Stage 2: install example deps ───────────────────────────────────────────
FROM node:26-alpine AS example-install

ARG EXAMPLE

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Materialize built zacatl so the file:../../ symlink resolves at install time
COPY --from=builder /app/package.json             ./package.json
COPY --from=builder /app/build-src-esm            ./build-src-esm
COPY --from=builder /app/build-src-cjs            ./build-src-cjs
COPY --from=builder /app/node_modules             ./node_modules
COPY --from=builder /app/build-scripts-esm        ./build-scripts-esm
COPY --from=builder /app/scripts                  ./scripts
COPY --from=builder /app/src/localization/locales ./src/localization/locales
COPY --from=builder /app/src/eslint               ./src/eslint

COPY examples/${EXAMPLE} ./examples/${EXAMPLE}

WORKDIR /app/examples/${EXAMPLE}
RUN npm install

# ── Stage 3a: build backend ─────────────────────────────────────────────────
FROM example-install AS build-backend

ARG EXAMPLE
ARG BACKEND

WORKDIR /app/examples/${EXAMPLE}
RUN npm run backend:build && npm prune --omit=dev

# ── Stage 3b: build frontend ────────────────────────────────────────────────
FROM example-install AS build-frontend

ARG EXAMPLE
ARG FRONTEND

WORKDIR /app/examples/${EXAMPLE}
RUN npm run frontend:build

# ── Stage 4: lean runtime (alpine - minimal OS) ────────────────────────────
FROM node:26-alpine

ARG EXAMPLE
ARG BACKEND
ARG FRONTEND
ARG PORT

ENV NODE_ENV=production
ENV BACKEND_PATH=${BACKEND}

WORKDIR /app/examples/${EXAMPLE}

# Carry the built zacatl so the @sentzunhat/zacatl symlink resolves at runtime.
# /app/node_modules holds zacatl's own runtime deps (reflect-metadata, tsyringe,
# fastify, etc.) hoisted at the /app root during example-install — Node resolves
# these by walking up from the example's node_modules, so this ancestor
# directory must exist in the final image too, not just the example's own deps.
#
# --chown=node:node on every copy (plus the recursive chown below) so the
# non-root `node` user (already ships in node:26-alpine) can read app files
# and write the SQLite examples' database file, which lands directly in
# this WORKDIR at runtime.
COPY --from=build-backend --chown=node:node /app/package.json             /app/package.json
COPY --from=build-backend --chown=node:node /app/node_modules             /app/node_modules
COPY --from=build-backend --chown=node:node /app/build-src-esm            /app/build-src-esm
COPY --from=build-backend --chown=node:node /app/src/localization/locales /app/src/localization/locales
COPY --from=build-backend --chown=node:node /app/src/eslint               /app/src/eslint

# Example runtime artifacts (pruned node_modules from backend, dist from both)
COPY --from=build-backend  --chown=node:node /app/examples/${EXAMPLE}/node_modules     ./node_modules
COPY --from=build-backend  --chown=node:node /app/examples/${EXAMPLE}/${BACKEND}/dist  ./${BACKEND}/dist
COPY --from=build-frontend --chown=node:node /app/examples/${EXAMPLE}/${FRONTEND}/dist ./${FRONTEND}/dist

# WORKDIR itself is created by Docker before the COPYs above and stays
# root-owned regardless of --chown on individual copies — chown it
# explicitly so the SQLite examples can create database.sqlite here.
RUN chown node:node /app/examples/${EXAMPLE}

USER node

EXPOSE ${PORT}
CMD node ${BACKEND_PATH}/dist/index.js
