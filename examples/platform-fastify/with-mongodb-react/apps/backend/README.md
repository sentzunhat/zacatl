# Zacatl Fastify + MongoDB Backend Example

Enterprise-grade Node.js ESM backend using the Zacatl framework with Mongoose.

## ✅ Features

- Fastify server platform
- MongoDB database via Mongoose
- Clean ESM build with automatic `.js` extension fixing
- Hexagonal/layered architecture
- Type-safe dependency injection
- Zod schema validation
- DI with class-token injection using `tsyringe` and `@singleton()`
- 5 REST endpoints

## 🚀 Quick Start

```bash
npm install
npm run dev
# http://localhost:8082
```

## API Endpoints

- `GET /greetings`
- `GET /greetings/:id`
- `POST /greetings`
- `DELETE /greetings/:id`
- `GET /greetings/random/:language`

## Environment

- `PORT` (default: 8082)
- `MONGODB_URI` (default: mongodb://localhost:27017/zacatl-fastify-02)

## Notes

- The React frontend will be added from `examples/shared/frontend`.
- Uses framework source during dev via `tsconfig.dev.json`.
