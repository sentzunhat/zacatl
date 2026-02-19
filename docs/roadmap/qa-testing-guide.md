# QA & Testing Guide

Lessons and best practices learned from v0.0.39 release cycle.

---

## Framework Adapter Patterns

### Express vs Fastify Response Handling

**Key Difference**: Express requires explicit response method calls; Fastify supports implicit return values.

| Aspect               | Fastify                         | Express                                        |
| -------------------- | ------------------------------- | ---------------------------------------------- |
| **Response pattern** | `return data`                   | `res.json(data); return data`                  |
| **Auto-send**        | Return value sent automatically | Must call `res.json()` explicitly              |
| **Testing focus**    | Verify return value             | Verify both `res.json()` call AND return value |

### Adapter Responsibility Matrix

| Responsibility        | Fastify Adapter             | Express Adapter                | Handler               |
| --------------------- | --------------------------- | ------------------------------ | --------------------- |
| Capture return value  | ✅ Sends via `reply.send()` | ⚠️ Captures, doesn't auto-send | ✅ Returns/sends      |
| Call response methods | Automatic (framework)       | Must be explicit (app code)    | ✅ Calls `res.json()` |
| Error handling        | ✅ Via hooks                | ✅ Via middleware              | ✅ Via try/catch      |

**Current Status** (v0.0.39):

- ✅ Express handlers work correctly when they call `res.json()`
- 🔧 v0.0.40 will enhance adapter to auto-send return values for parity with Fastify (non-breaking)

---

## Testing Patterns

### Unit Test Structure for Handlers

**Goal**: Verify handler logic, service calls, and response structure.

```typescript
describe("GetAllGreetingsHandler", () => {
  it("should fetch greetings and return typed response", async () => {
    // 1. Setup mocks
    const mockService = {
      getAllGreetings: vi.fn().mockResolvedValue([{ id: 1, text: "Hello" }]),
    };

    // 2. Create handler with mocked dependencies
    const handler = new GetAllGreetingsHandler(mockService);

    // 3. Mock request/response
    const req = { query: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    // 4. Execute handler
    const result = await handler.execute(req, res);

    // 5. Assert service was called correctly
    expect(mockService.getAllGreetings).toHaveBeenCalledWith();

    // 6. Assert response was sent (Express-specific)
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ id: 1, text: "Hello" }]);

    // 7. Assert return value (for future adapter parity)
    expect(result).toEqual([{ id: 1, text: "Hello" }]);
  });
});
```

### Mocking Best Practices

1. **Mock `res.status()` to return `res`** for method chaining:

   ```typescript
   const res = {
     status: vi.fn().mockReturnThis(),
     json: vi.fn(),
   };
   ```

2. **Capture both return value and response method calls**:

   ```typescript
   const result = await handler.execute(req, res);
   expect(res.json).toHaveBeenCalledWith(expectedData);
   expect(result).toEqual(expectedData);
   ```

3. **Mock service methods with `mockResolvedValue` for async operations**:
   ```typescript
   const mockService = {
     getData: vi.fn().mockResolvedValue({ id: 1 }),
   };
   ```

### Integration Test Setup

Use `supertest` for end-to-end handler testing against a fully wired Express instance:

```typescript
import request from "supertest";
import express from "express";
import { Service, ServiceType, ServerVendor, ServerType } from "@sentzunhat/zacatl";

describe("Integration: /greetings endpoints", () => {
  let service: Service;

  beforeEach(async () => {
    const app = express();
    app.use(express.json());

    service = new Service({
      type: ServiceType.SERVER,
      layers: {
        application: {
          entryPoints: {
            rest: {
              hooks: [],
              routes: [GetAllGreetingsHandler, GetGreetingByIdHandler],
            },
          },
        },
        domain: { providers: [GreetingService] },
        infrastructure: { repositories: [GreetingRepository] },
      },
      platforms: {
        server: {
          name: "test",
          port: 0,
          databases: [],
          server: {
            type: ServerType.SERVER,
            vendor: ServerVendor.EXPRESS,
            instance: app,
          },
        },
      },
    });
    await service.start({ port: 0 });
  });

  it("GET /greetings returns 200 with array", async () => {
    const res = await request(app).get("/greetings");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("POST /greetings with valid body returns 201", async () => {
    const res = await request(app).post("/greetings").send({ text: "Hello" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
  });
});
```

---

## Cross-Framework Documentation Verification

### Checklist for Multi-Framework Support

When adding/updating frameworks (Express, Fastify, etc.):

- [ ] **Examples exist for all DB variants** (SQLite, MongoDB, PostgreSQL)
- [ ] **Documentation covers framework-specific patterns** (handlers, middleware setup)
- [ ] **Port configuration is consistent** and non-conflicting:
  - Fastify: 8081, 8082, 8083
  - Express: 8082, 8082, 8083 (matches by DB, or use override)
- [ ] **Cross-links verified** in example READMEs:
  - All `../../../docs/` links resolve
  - Service module links correct (e.g., `docs/service/README.md`)
  - Architecture guides present (e.g., `ARCHITECTURE.md` or referenced)
- [ ] **Known issues documented** in framework docs (e.g., `docs/service/express.md`)

### Documentation Linkage Rules

**Relative link patterns:**

- From `examples/platform-X/**` → `../../../docs/` (3 levels up to root)
- From `docs/service/` → `../configuration/` (sibling modules)
- From `examples/*/README.md` → Framework-specific `docs/` subfolder or root `docs/`

**Always verify:**

```bash
# Check all markdown links
grep -r "\[.*\](.*\.md)" docs/ examples/ | head -20
```

---

## Known Issues & Resolution Timeline

### v0.0.39 ✅ Released

**Status**: Fully functional for production use.

**Verified Working:**

- ✅ All 6 examples (3 Fastify × DB + 3 Express × DB)
- ✅ Handler registration and routing
- ✅ Validation with Zod schemas
- ✅ DI container resolution
- ✅ Middleware integration (Express)
- ✅ 265+ unit tests passing
- ✅ Build: `npm run build` (69 ESM files)
- ✅ Type check: `npm run type:check` (0 issues)

**Test Coverage Notes:**

- `express-adapter.test.ts`: 1 unit test pending fix (non-blocking)
  - Tests expect auto-send of return values (future feature)
  - Doesn't affect production—handlers work when they call `res.json()`

**Minor Lint Warnings** (cosmetic):

- 2 `@typescript-eslint/no-explicit-any` in type guards
- Next maintenance pass will clean up

### v0.0.40 🔧 Planned Patch

**Scope**: Small enhancements, no breaking changes.

**To Fix:**

1. **ExpressApiAdapter auto-send return values**
   - Capture handler return value and auto-send via `res.json()` if not already sent
   - Provides parity with Fastify's implicit response handling
   - Test: `express-adapter.test.ts` will then pass
   - Impact: Existing code continues to work; new code can omit `res.json()` if preferred

2. **Lint cleanup**
   - Replace `any` type guards with proper TypeScript inference
   - Improve type safety in adapter initialization

**Non-blocking for v0.0.39 because:**

- Handlers already work correctly
- Pattern (calling `res.json()`) is explicit and clear
- Test is preventative; code didn't regress

---

## Release Process QA

### Pre-Publication Checklist

- [ ] All tests passing (or expected failures documented)
- [ ] Build completes without errors (`npm run build`)
- [ ] Type check passes (`npm run type:check`)
- [ ] Lint passes or known issues documented (`npm run lint`)
- [ ] Examples build and start without errors
- [ ] Port configuration validated across all examples
- [ ] Documentation links verified (grep for broken paths)
- [ ] Changelog updated with version, date, and features
- [ ] Version locked in `package.json`
- [ ] Git commit created with all changes

### Example Verification (`quick-smoke-test`)

```bash
#!/bin/bash

# Fastify examples (SQLite instant)
cd examples/platform-fastify/with-sqlite
npm install && npm run build
timeout 3 npm run dev 2>&1 | head -20

# Express examples (SQLite instant)
cd examples/platform-express/with-sqlite
npm install && npm run build
timeout 3 npm run dev 2>&1 | head -20

# Port validation
grep -h "PORT\|port" */with-*/apps/backend/src/config.ts | grep -E ":\s*[0-9]{4}"
```

### Documentation Verification Checklist

```bash
# Find all markdown links
grep -rh "\[.*\](.*\.md)" docs/ examples/ | sort | uniq

# Verify each file exists
# - Check relative path resolution
# - Confirm no 404-equivalent broken paths
```

---

## Learnings for Future Frameworks

If adding a **third framework** (e.g., Hono, Elysia, etc.):

1. **Adapter Pattern**: Implement `ApiServerPort` interface with:
   - `registerRoute(handler)` - Register single handler
   - `registerHook(handler)` - Register middleware/interceptor
   - `registerProxy(config)` - Register proxy routes
   - `listen(port)` - Start server
   - `getRawServer()` - Return framework instance

2. **Handler Base Class**: Create abstract class matching Fastify/Express pattern:

   ```typescript
   abstract class AbstractFooHandler<TBody, TQuery, TResponse> {
     abstract handler(req, reply): Promise<TResponse> | TResponse;
     async execute(req, reply): Promise<TResponse> { ... }
   }
   ```

3. **Response Semantics**:
   - If framework auto-sends return values (like Fastify): Implement that
   - If framework requires explicit response calls (like Express): Document it

4. **Testing**: Follow unit test pattern above
5. **Examples**: Create 3 DB-variant examples (SQLite, MongoDB, PostgreSQL)
6. **Documentation**: Add framework doc in `docs/service/{framework}.md`

---

## Continuous Testing Strategy

### For Next Release Cycle

1. **Maintain isolated adapter tests** - Each framework gets dedicated test file
2. **Cross-framework integration tests** - Verify same handler logic works across Fastify + Express
3. **Example startup smoke tests** - Automated verification of all examples
4. **Link verification** - Automated check of all markdown links in docs
5. **Type safety** - Strengthen type inference to reduce or eliminate `any` usage

### CI/CD Integration Points

```yaml
# Example GitHub Actions workflow steps
- name: Build
  run: npm run build

- name: Type Check
  run: npm run type:check

- name: Lint
  run: npm run lint

- name: Test
  run: npm test

- name: Test Examples
  run: |
    npm run build
    # Try starting each example with timeout
    for example in examples/platform-{fastify,express}/with-*-react/; do
      timeout 3 npm run dev --prefix "$example" 2>&1 | head -10
    done

- name: Publish (on tag)
  if: startsWith(github.ref, 'refs/tags/v')
  run: npm publish
```

---

## See Also

- [Express Integration Guide](../service/express.md) - Framework-specific details
- [Service Architecture](../service/api-overview.md) - Adapter patterns
- [examples/platform-express](../../examples/platform-express/README.md) - Working examples
- [examples/platform-fastify](../../examples/platform-fastify/README.md) - Reference implementation
