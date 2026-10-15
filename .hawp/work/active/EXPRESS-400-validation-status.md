# EXPRESS-400 — Express request validation errors return 500 instead of 400

**UUID:** `EXPRESS-400` · **Type:** bug · **Priority:** P2 · **Reported:** 2026-10-03
**Status:** in-progress · **Owner direction:** separate PR after #118 / #119

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

## Implementation (2026-10-15)

- Reconfirmed: new real-Express regression test returned 500 for invalid
  body, querystring and params before the fix.
- `providers/express/schema-helper.ts`: Zod failures are wrapped in
  `RequestValidationError` (extends `BadRequestError`, `code`/`statusCode`/
  `status` = 400, `validationContext`, `validation` issues). Message follows
  Fastify's `<context>/<path> <issue>` shape. Non-Zod errors are rethrown
  unchanged; the error still flows through `next(err)`, so app error handlers
  keep control and `mapErrorToStatusCode` maps it to 400.
- Tests: `test/unit/.../express/validation-status.test.ts` (real Express app:
  400 via app handler reading `statusCode`, 400 via Express default handler,
  query/params 400, valid request unchanged, handler errors still 500) and two
  `schema-helper` unit cases.
- Verification: `npm test` 84 files / 698 tests pass; `tsc --noEmit` (src and
  test) clean; eslint clean on touched files.
- Not done: live run of an Express example — examples install zacatl from npm,
  so this needs a release or a local link. Uncommitted.
