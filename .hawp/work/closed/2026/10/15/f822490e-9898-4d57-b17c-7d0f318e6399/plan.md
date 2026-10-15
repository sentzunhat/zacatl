# f822490e — Express request validation errors return 500 instead of 400

**UUID:** `f822490e-9898-4d57-b17c-7d0f318e6399` · **Legacy ID:** `EXPRESS-400` · **Type:** bug · **Priority:** P2 · **Reported:** 2026-10-03
**Status:** done · **Closed:** 2026-10-15 · **Owner direction:** separate PR after #118 / #119

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
- Committed on `dev` as `fd3c7c6c`; not yet released.

## Outcome

Express now answers **400 Bad Request** when a request fails its route's Zod
schema (body, querystring or params), matching Fastify. The failure is a
`RequestValidationError` (a `BadRequestError` with `statusCode`/`status` 400)
passed to `next(err)`, so app error handlers still own the response body.
Non-validation errors keep the existing 500 path. Ships with the next release.

## Verification

- Regression test failed first (500 on invalid body/query/params), then passed.
- `npm test`: 84 files / 698 tests pass; `tsc --noEmit` clean (src, test);
  eslint clean on touched files.
- Live run (2026-10-15): `examples/express-sqlite-react` backend (links the
  local repo via `file:../../`) after `npm run build:src`:
  `POST /api/greetings` with `{}` → **400**
  `{"error":{"message":"body/message Invalid input: expected string, received undefined, body/language …","statusCode":400}}`;
  valid body → 200 with the created greeting.

## Close Checklist

- [x] Outcome recorded
- [x] Verification recorded (unit, integration, live example)
- [x] Legacy ID `EXPRESS-400` mapped to UUID per `ac0c4acf`
- [x] Active backlog row removed and recent-close entry added
- [x] Plan moved to the dated closed archive
