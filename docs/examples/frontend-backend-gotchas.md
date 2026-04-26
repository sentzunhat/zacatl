# Examples: Frontend / Backend Key Differences and Gotchas

Reference for contributors and users of the Zacatl example apps.

---

## API prefix — how it works

All 8 examples serve routes under `/api`. This is driven by a single
field in the backend `config.ts`:

```typescript
// apps/backend/src/config.ts
export const API_PREFIX = '/api';

server: {
  vendor: ServerVendor.FASTIFY, // or EXPRESS
  instance: fastify,
  prefixes: { api: API_PREFIX },
},
```

`server.prefixes.api` is read by the zacatl `Server` class and passed to
the framework adapter (`createFastifyApiAdapter` / `createExpressApiAdapter`).
Each route handler defines a **relative** URL (`url: '/greetings'`); the
adapter prepends the prefix, producing `/api/greetings`.

**Page server SPA exclusion** is handled separately by `page.prefixes`,
which defaults to `{ api: '/api' }` when omitted. You do **not** need to
set it explicitly — the framework default is correct for all examples.

**Rule:** Never set `page.prefixes` in example configs. The framework
default already matches `server.prefixes.api`.

---

## Route handler URL vs. full public path

A handler's `url` field is always the path **without** the prefix:

```typescript
// handler definition — always relative, never includes /api
super({ url: '/greetings', schema: { ... } });
```

The full public path is `{server.prefixes.api}{url}` = `/api/greetings`.
This applies identically to both Fastify and Express examples.

---

## Frontend fetch paths

All React and Svelte frontends fetch `/api/greetings` — not bare
`/greetings`. The 4 call sites per frontend are:

| Operation | Path |
|---|---|
| List / filter | `/api/greetings?language=...` |
| Create | `/api/greetings` (POST) |
| Delete | `/api/greetings/{id}` (DELETE) |
| Random | `/api/greetings/random/{language}` (GET) |

---

## Vite dev proxy

All 8 frontends use an identical proxy rule for local development:

```typescript
// vite.config.ts
server: {
  proxy: {
    '^/api': { target: 'http://localhost:<backend-port>', changeOrigin: true },
  },
},
```

The proxy matches any path beginning with `/api` and forwards to the
backend. No pattern alternation needed — `'^/(api|greetings)'` was a
historical workaround and is no longer in use.

---

## React vs. Svelte CSS / Tailwind 4

**React examples (6 total)** — rich `@theme {}` block with custom tokens:

```css
@import "tailwindcss";

@theme {
  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: Inter, 'Open Sans', sans-serif;
  --font-sans: Inter, system-ui, sans-serif;
  --shadow-soft: 0 12px 30px rgba(15, 23, 42, 0.08);
  --animate-fade-in-up: fade-in-up 0.4s ease-out;
  --animate-pulse-gentle: pulse-gentle 3s ease-in-out infinite;
}
```

These tokens are consumed in JSX as Tailwind utilities (`font-body`,
`shadow-soft`, `animate-fade-in-up`). Tailwind 4 naming rule: `--font-*`
generates `font-*` utilities, **not** `--font-family-*`.

**Svelte examples (2 total)** — minimal `@layer base` only, no `@theme`:

```css
@import "tailwindcss";

@layer base {
  :root { color-scheme: light; }
  body { @apply bg-slate-50 text-slate-900 antialiased; }
}
```

The Svelte template uses only standard Tailwind utilities. No custom
tokens needed. This is **intentional** — not a missing configuration.

---

## Port assignments

| Example | Backend port | Frontend dev port |
|---|---|---|
| fastify-sqlite-react | 8081 | 5001 |
| fastify-sqlite-svelte | 8081 | 5001 |
| fastify-mongodb-react | 8082 | 5002 |
| fastify-postgres-react | 8083 | 5003 |
| express-sqlite-react | 8181 | 5001 |
| express-sqlite-svelte | 8181 | 5001 |
| express-mongodb-react | 8182 | 5002 |
| express-postgres-react | 8183 | 5003 |

SQLite examples default to `database.sqlite` in the example root. No
external database required for smoke testing.

---

## express-mongodb-react: separate api.ts module

Most examples inline their fetch calls in `app.tsx` / `App.svelte`.
`express-mongodb-react` has a separate `apps/frontend/src/api.ts` that
wraps all fetch calls. The API paths there follow the same `/api/greetings`
convention. The module also handles MongoDB's response shape differences
(`_id`, `text` vs `id`, `message`) via a `toGreeting()` normalizer.

---

## DELETE on Fastify ��� no Content-Type header

Fastify rejects a DELETE request that includes `Content-Type: application/json`
but no body. When writing curl smoke tests or integration tests, omit the
header on DELETE:

```bash
# correct
curl -sf -X DELETE http://localhost:8081/api/greetings/1

# wrong — Fastify returns 415
curl -sf -X DELETE http://localhost:8081/api/greetings/1 \
  -H "Content-Type: application/json"
```

Express does not have this restriction.

---

## Common mistakes when adding a new example

1. **Forgetting `server.prefixes`** — routes register at `/greetings` instead
   of `/api/greetings`. Fix: add `prefixes: { api: '/api' }` to the
   `server:` block in `config.ts`.

2. **Setting `page.prefixes` explicitly** — creates drift risk. Omit it;
   the framework default is `{ api: '/api' }`.

3. **Frontend fetching bare `/greetings`** — all fetch calls must use
   `/api/greetings`. Search for `'/greetings'` (without `/api`) to catch.

4. **Vite proxy matching `'^/(api|greetings)'`** — stale workaround.
   Use `'^/api'` only.

5. **Wrong Tailwind 4 token naming** — `--font-family-body` does not
   generate a `font-body` utility. Must be `--font-body`.
