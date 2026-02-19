# Quick Start - Fastify Monorepo Examples

## Prerequisites

- Node.js 24+
- npm 10+
- Docker (only for MongoDB/PostgreSQL databases)

## SQLite (fastest)

```bash
cd examples/platform-fastify/with-sqlite
npm ci
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5001

## MongoDB

```bash
docker run -d -p 27017:27017 --name mongo mongo:latest

cd examples/platform-fastify/with-mongodb
npm ci
npm run dev
```

- Backend: http://localhost:3002
- Frontend: http://localhost:5002

## PostgreSQL

```bash
docker run -d --name pg-zacatl \
  -e POSTGRES_USER=local \
  -e POSTGRES_PASSWORD=local \
  -e POSTGRES_DB=appdb \
  -p 5432:5432 postgres:16

cd examples/platform-fastify/with-postgres
export DATABASE_URL=postgres://local:local@localhost:5432/appdb
npm ci
npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5001

## Build and start (production flow)

```bash
npm run build
npm start
```

## Useful commands

```bash
npm run backend:dev
npm run frontend:dev
npm run backend:build
npm run frontend:build
npm run clean
```

## Troubleshooting

### Dependencies look stale

```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use

```bash
lsof -i :3001
lsof -i :5001
```

### Docker database check

```bash
docker ps
```
