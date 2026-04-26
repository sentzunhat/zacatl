# STAB-026 — Capture and document example UI screenshots

**Backlog ID:** STAB-026
**Type:** improvement / documentation
**Reported:** 2026-07-09

---

## Goal

Produce a canonical set of screenshots for each of the 8 examples showing:
1. **Initial state** — empty app on first load
2. **After create** — one greeting added, visible in list
3. **After delete** — list empty again

Screenshots serve as: README visual proof, CI regression baseline, and
docs/examples reference material.

---

## Scope — 8 examples × 3 states = 24 screenshots

| Example | Port | API prefix |
|---------|------|-----------|
| fastify-sqlite-react   | 8081 | `/api/greetings` |
| fastify-sqlite-svelte  | 8082 (svelte port) | `/greetings` |
| fastify-postgres-react | 8083 | `/greetings` |
| fastify-mongodb-react  | 8084 (mongo port) | `/api/greetings` |
| express-sqlite-react   | 8181 | `/greetings` |
| express-sqlite-svelte  | 8182 (svelte port) | `/greetings` |
| express-postgres-react | 8183 | `/greetings` |
| express-mongodb-react  | 8184 (mongo port) | `/greetings` |

> Note: React and Svelte variants of the same framework/DB share a host port —
> must be run and screenshotted one at a time.

---

## Output location

```
docs/screenshots/
├── fastify-sqlite-react/
│   ├── 01-initial.png
│   ├── 02-after-create.png
│   └── 03-after-delete.png
├── fastify-sqlite-svelte/
│   └── ...
└── ...
```

Embed in `examples/README.md` under each example heading.

---

## Implementation approach

Use Claude-in-Chrome browser automation:
1. `docker compose up -d` for the example (+ DB sidecar if needed)
2. Navigate to `http://localhost:{port}`
3. Screenshot initial state
4. Fill form → submit (Create)
5. Screenshot after create
6. Click delete
7. Screenshot after delete
8. `docker compose down`
9. Save PNGs to `docs/screenshots/{example}/`

MongoDB and Postgres examples require DB sidecars (`docker compose up -d` handles this already via `depends_on`).

---

## Prerequisites

- All 8 examples pass CRUD verification ✅ (confirmed 2026-07-09)
- A browser automation session available (Claude-in-Chrome MCP or Playwright)
- `docs/screenshots/` directory created

---

## Status

`plan-ready` — can be executed in a browser-automation session.
