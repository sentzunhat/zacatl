# EXPRESS-400 — Express request validation errors return 500 instead of 400

**UUID:** `EXPRESS-400` · **Type:** bug · **Priority:** P2 · **Reported:** 2026-10-03
**Status:** inbox · **Owner direction:** separate PR after #118 / #119

## Problem

On Express, a request that fails the route's Zod schema is answered with
**500 Internal Server Error** instead of **400 Bad Request**. Fastify answers
the same request with 400.

## Evidence (2026-10-03)

- Live run of `examples/express-sqlite-react`: `POST /api/greetings` with `{}`
  returned 500; the log shows a `ZodError` (`invalid_type`, path `language`).
- `providers/express/api-adapter.ts` runs `applyZodSchema(handler.schema, req)`
  before the handler; the thrown `ZodError` has no `statusCode`, goes to
  `next(err)`, and the example's error handler maps a missing `statusCode` to
  500.
- Predates the logger work (#118); not introduced by it.

## Plan

1. In the Express adapter, map schema-validation failures to a 400 response
   (or a `BadRequestError`/`ValidationError` with `statusCode: 400`) before they
   reach `next`, with a body shape matching the Fastify path.
2. Keep non-validation errors on the existing path.
3. Regression test: invalid body/query/params → 400 on Express; valid request
   unchanged.

## Verification

Express adapter unit test plus a live run of an Express example returning 400
for an invalid body.
