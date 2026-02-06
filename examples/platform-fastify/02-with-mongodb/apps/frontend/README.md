# Fastify + MongoDB Frontend

This React (Vite) frontend talks to the Fastify + MongoDB example and uses Tailwind CSS.

## Quick start

1. Start the backend (from the repository root):
   - `cd examples/platform-fastify/02-with-mongodb`
   - `npm install`
   - `npm run dev`

2. Start the frontend (from this folder):
   - `npm install`
   - `npm run dev`

The dev server proxies `/greetings` to `http://localhost:8082`.

## Environment

If you want to point at a different backend, set:

```
VITE_API_URL=http://localhost:8082
```

When `VITE_API_URL` is unset, the frontend uses relative `/greetings` paths and relies on the Vite proxy.
