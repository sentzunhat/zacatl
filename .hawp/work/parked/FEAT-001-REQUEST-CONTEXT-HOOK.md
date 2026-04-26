# FEAT-001 — RequestContextHook: opt-in AsyncLocalStorage hook for per-request context

**Type:** feature
**Complexity:** medium
**Impact:** additive, no breaking changes
**Status:** plan-ready

---

## Goal

Export a ready-made `onRequest` hook that wraps `AsyncLocalStorage.run()` so any service
can propagate `requestId`, `tenantId`, and `userId` through the full async call stack
without threading them as parameters.

Consumers register it alongside their own hooks:

```typescript
const serviceConfig: ConfigService = {
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [RequestContextHook],   // ← opt-in, one line
          routes: [GetUsersRoute],
        },
      },
    },
  },
  // ...
};
```

Then any layer reads the context:

```typescript
import { getRequestContext } from '@sentzunhat/zacatl/service/platforms/context/request-context';

const ctx = getRequestContext();  // { requestId: '...', tenantId: '...' }
```

---

## Architecture decision

`HookHandler.execute` is typed `(req, reply) => Promise<void>` — this is the **async** Fastify
hook form. `AsyncLocalStorage.run(store, done)` requires the **3-arg callback** form; without
calling `done` from inside `run()`, subsequent hooks/routes won't be inside the ALS scope.

**Resolution: extend `HookHandler` to support a 3-arg callback hook.**

Add an optional `callback` execute form to the hook registration path:

```typescript
// hook-handler.ts — extended interface
export type HookHandlerExecuteAsync = (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
export type HookHandlerExecuteCallback = (
  req: FastifyRequest,
  reply: FastifyReply,
  done: () => void,
) => void;

export interface HookHandler {
  name: HookHandlerName;
  execute: HookHandlerExecuteAsync | HookHandlerExecuteCallback;
}
```

`registerHook` in `fastify/api-adapter.ts` detects the arity:

```typescript
registerHook: (handler: HookHandler): void => {
  if (handler.execute.length === 3) {
    // 3-arg callback form — needed for ALS
    server.addHook(handler.name, handler.execute.bind(handler) as HookHandlerExecuteCallback);
  } else {
    // async form (existing behavior)
    server.addHook(handler.name, handler.execute.bind(handler) as HookHandlerExecuteAsync);
  }
},
```

This is **non-breaking**: all existing async hooks have `execute.length === 2`; only
`RequestContextHook` uses 3.

---

## Files to create / modify

### Create

| File | Description |
|------|-------------|
| `src/service/platforms/context/hook.ts` | `RequestContextHook` class — implements the 3-arg form |

**`hook.ts` content:**

```typescript
import type { FastifyReply, FastifyRequest } from '@zacatl/third-party/fastify';
import type { HookHandler, HookHandlerName } from '../../layers/application/entry-points/rest/hook-handlers/hook-handler';
import { requestContext } from './request-context';

export class RequestContextHook implements HookHandler {
  public readonly name: HookHandlerName = 'onRequest';

  public execute(req: FastifyRequest, _reply: FastifyReply, done: () => void): void {
    const tenantId = req.headers['x-tenant-id'] as string | undefined;
    requestContext.run(
      { requestId: req.id, tenantId },
      done,
    );
  }
}
```

### Modify

| File | Change |
|------|--------|
| `src/service/layers/application/entry-points/rest/hook-handlers/hook-handler.ts` | Add 3-arg `HookHandlerExecuteCallback` type; widen `execute` union |
| `src/service/platforms/server/providers/fastify/api-adapter.ts` | Detect arity, use callback form when `execute.length === 3` |
| `src/service/platforms/context/request-context.ts` | Add `getRequestContext()` helper (calls `requestContext.getStore()`) |
| `tsconfig.base.json` | Add `@zacatl/service/platforms/context/hook` path entry |
| `package.json` | Add `./service/platforms/context/hook` export entry |

### Express adapter

Express hooks (`registerHook`) already use the `server.use()` middleware pattern,
which is implicitly synchronous and doesn't have the same ALS scoping problem.
`RequestContextHook` is Fastify-only for now. Express consumers use the existing
`requestContext.run()` pattern manually in their middleware.

---

## New export

```typescript
// @sentzunhat/zacatl/service/platforms/context/hook
export { RequestContextHook } from './hook';

// @sentzunhat/zacatl/service/platforms/context/request-context
export { requestContext, requestContextMixin, getRequestContext, type RequestContext } from './request-context';
```

---

## Test plan

1. Unit test `RequestContextHook` — verify `.name === 'onRequest'`, verify `execute.length === 3`
2. Unit test `getRequestContext()` — returns `undefined` outside ALS scope, returns store inside
3. Integration test (existing fastify test infra): wire `RequestContextHook` into a test server,
   fire a request with `x-tenant-id` header, assert `getRequestContext()` returns correct values
   inside a route handler
4. Verify existing 556 tests still pass
5. Type check + lint clean + publish dry-run

---

## Success criteria

- [ ] `RequestContextHook` importable from `@sentzunhat/zacatl/service/platforms/context/hook`
- [ ] `getRequestContext()` importable from `@sentzunhat/zacatl/service/platforms/context/request-context`
- [ ] Per-request context available in route handlers with zero consumer boilerplate
- [ ] Existing async `HookHandler` implementations unaffected
- [ ] All gates green (556+ tests, type check, lint, publish dry-run)

---

## Out of scope for FEAT-001

- Express ALS support (separate ticket if needed)
- Automatic `userId` population (consumer populates via a second hook using `requestContext.getStore()`)
- Context TTL / invalidation (ALS handles this naturally via request lifecycle)

---

**Target:** 0.0.57
**Depends on:** none (REFACTOR-001 is merged)

---

## Parked — 2026-07-09

**Reason:** Each consuming service (mictlan, tekit) already handles request context via JWT middleware and correlation IDs in its own application layer. The framework doesn't need to own this — it would duplicate consumer logic that already exists and couples the framework to a specific context model. Re-open when multiple services need a shared lightweight context propagation primitive that isn't tied to JWT.
