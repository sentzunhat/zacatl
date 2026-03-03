# Test Coverage Roadmap

This document outlines a strategic approach to improving test coverage by focusing on high-impact, high-value testing areas that provide the best return on investment (ROI).

## Current State

- **Coverage**: ~52% (statements)
- **Tests**: 214 unit tests
- **Target**: 75%+ coverage (statements), focusing on critical paths

---

## Testing ROI Framework

### Categories (Ranked by Impact)

**🔴 Critical (Must Test)**

- Exception paths that crash the app
- Security/permission checks
- Data validation & schema enforcement
- Core business logic (domain layer)

**🟠 High Value (Should Test)**

- Public API contracts
- Error handling patterns
- Integration points (repository, adapters)
- DI container auto-registration
- Configuration loading

**🟡 Medium Value (Nice to Have)**

- Logging output formatting
- Minor utility functions
- Adapter implementations (once one is well-tested)
- Edge cases in non-critical paths

**🟢 Low Value (Skip)**

- Barrel export files (re-exports only)
- Generated code (D.TS files)
- Third-party library wrappers (test the wrapper's contract, not the library)
- Simple getters/setters without logic

---

## Priority 1: Error Handling (Estimated +8% coverage)

### Target: All 7 Error Classes

**Current State:** Basic tests exist

**To Add:**

- ✅ Metadata merging in `CustomError` base class
- ✅ Correlation ID generation and propagation
- ✅ Error chain (cause/original error)
- ✅ Serialization (toJSON, toString)
- ✅ Each error type validates its unique properties

**Example:**

```typescript
describe('BadRequestError', () => {
  it('should include metadata with error chain', () => {
    const cause = new Error('Schema validation failed');
    const error = new BadRequestError({
      message: 'Invalid input',
      reason: 'Email is required',
      metadata: { field: 'email', schema: 'User' },
      error: cause,
    });
    expect(error.cause).toBe(cause);
    expect(error.metadata).toContainEqual({ field: 'email' });
  });
});
```

**Files:**

- `test/unit/error/` — Create tests for all error types

---

## Priority 2: Domain Services (Estimated +12% coverage)

### Target: Service Business Logic

Critical path: Service → Port → Repository

**To Add:**

- ✅ All CRUD operations (create, read, update, delete)
- ✅ Validation: empty input, invalid types, missing fields
- ✅ Error cases: repository failures, constraint violations
- ✅ Business rules: permissions, state transitions
- ✅ Transactional behavior (if applicable)

**Example:**

```typescript
describe('GreetingService', () => {
  describe('create', () => {
    it('should validate message is not empty', async () => {
      await expect(service.create({ message: '' })).rejects.toThrow(BadRequestError);
    });

    it('should include timestamp and ID on creation', async () => {
      const result = await service.create({ message: 'Hello' });
      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should throw if repository fails', async () => {
      mockRepo.save.mockRejectedValue(new Error('DB error'));
      await expect(service.create({ message: 'Test' })).rejects.toThrow();
    });
  });
});
```

**Files:**

- `test/unit/service/` — Domain service tests
- One test file per domain service (e.g., `greeting-service.test.ts`)

---

## Priority 3: DI & Auto-Registration (Estimated +6% coverage)

### Target: Dependency Injection Container & Layer Initialization

**Current State:** Some tests exist

**To Add:**

- ✅ Auto-registration on layer construction
- ✅ Singleton vs transient resolution
- ✅ Circular dependency detection
- ✅ Token type resolution (class vs string keys)
- ✅ Container reset/cleanup between tests

**Example:**

```typescript
describe('Auto-Registration', () => {
  beforeEach(() => clearContainer());

  it('should register and resolve transient instances', () => {
    new Infrastructure({ repositories: [UserRepository] });
    const inst1 = resolveDependency(UserRepository);
    const inst2 = resolveDependency(UserRepository);
    expect(inst1).not.toBe(inst2); // Different instances
  });

  it('should detect and report circular dependencies', () => {
    expect(() => {
      new Infrastructure({ repositories: [circularA, circularB] });
    }).toThrow(/circular|cycle/i);
  });
});
```

**Files:**

- Expand `test/unit/dependency-injection/container.test.ts`
- Add `test/unit/service/layers/auto-registration.test.ts`

---

## Priority 4: Route Handlers & Adapters (Estimated +15% coverage)

### Target: HTTP Handler Contracts

**Current State:** Minimal tests

**To Add:**

- ✅ Framework adapter translation (FastifyRequest → Domain Input)
- ✅ Successful request → response mapping
- ✅ Error serialization in HTTP responses
- ✅ Request validation (schema, types)
- ✅ Status codes (200, 201, 400, 404, 500)
- ✅ Both Fastify and Express handlers

**Example:**

```typescript
describe("GetGreetingsHandler (Fastify)", () => {
  it("should return 200 with all greetings", async () => {
    const mockService = { getAll: vi.fn().mockResolvedValue([...]) };
    const handler = new GetGreetingsHandler(mockService);

    const request = { /* FastifyRequest mock */ };
    const response = await handler.handle(request);

    expect(response).toEqual([...]);
    expect(mockService.getAll).toHaveBeenCalled();
  });

  it("should handle service errors and map to HTTP", async () => {
    const error = new InternalServerError({ message: "DB failed" });
    mockService.getAll.mockRejectedValue(error);

    await expect(() => handler.handle(request))
      .rejects.toThrow(error);
  });
});
```

**Files:**

- `test/unit/service/layers/application/handlers/` — Add tests for:
  - `GetRouteHandler` for both Fastify and Express
  - `PostRouteHandler` (with body validation)
  - `PutRouteHandler` (with ID param)
  - `DeleteRouteHandler` (with ID param)
  - Error mapping (CustomError → HTTP response)

---

## Priority 5: Repository Adapters (Estimated +10% coverage)

### Target: One Reference Implementation Per ORM

Pick the most-used ORM (e.g., Sequelize) and test it thoroughly once. Then mark other adapters as tested via that model.

**To Add:**

- ✅ CRUD operations: create, findAll, findById, update, delete
- ✅ Filter/where clause handling
- ✅ Error cases: not found, constraint violation, connection error
- ✅ Type safety: model property typing
- ✅ Transactions (if applicable)

**Example:**

```typescript
describe('SequelizeGreetingRepository', () => {
  it('should find all greetings', async () => {
    const results = await repo.findAll();
    expect(Array.isArray(results)).toBe(true);
  });

  it("should throw NotFoundError when ID doesn't exist", async () => {
    await expect(repo.findById('nonexistent-id')).rejects.toThrow(NotFoundError);
  });

  it('should save and return with generated ID', async () => {
    const result = await repo.save({ message: 'Test' });
    expect(result.id).toBeDefined();
    expect(result.message).toBe('Test');
  });
});
```

**Files:**

- `test/unit/service/layers/infrastructure/repositories/`
- Start with one ORM; others inherit coverage model

---

## Priority 6: Configuration & Edge Cases (Estimated +8% coverage)

### Target: Config Loading, Validation, Defaults

**To Add:**

- ✅ Valid JSON/YAML loading
- ✅ Schema validation with Zod
- ✅ Missing required fields → error
- ✅ Type coercion (string to number)
- ✅ Environment variable injection
- ✅ Default values

**Example:**

```typescript
describe('loadJSON', () => {
  it('should load and validate schema', async () => {
    const config = loadJSON('./test.json', serverSchema);
    expect(config.port).toBe(3000);
  });

  it('should throw ValidationError on invalid schema', () => {
    expect(() => loadJSON('./invalid.json', serverSchema)).toThrow(ValidationError);
  });
});
```

**Files:**

- `test/unit/configuration/` — Expand loader tests

---

## Priority 7: Localization & Logging (Estimated +5% coverage)

### Target: Adapter Contracts (Not Third-Party Testing)

**To Add:**

- ✅ i18n locale switching
- ✅ Logger adapter methods (info, warn, error, fatal)
- ✅ Log output formatting
- ✅ Missing translations fallback

**Files:**

- `test/unit/logs/pino-adapter.test.ts` — Pino adapter interface
- `test/unit/logs/console-adapter.test.ts` — Console adapter interface
- `test/unit/logs/config.test.ts` — Pino config factory
- `test/unit/localization/` — i18n adapter contracts

---

## Summary & Roadmap

| Priority  | Area                | Est. Gain | Effort | ROI          | Status                                  |
| --------- | ------------------- | --------- | ------ | ------------ | --------------------------------------- |
| 1         | Error Handling      | +8%       | Low    | 🟢 Excellent | 🟡 In Progress                          |
| 2         | Domain Services     | +12%      | Medium | 🟢 Excellent | ⏳ Not Started                          |
| 3         | DI & Auto-Reg       | +6%       | Low    | 🟢 High      | 🟡 Partial                              |
| 4         | Handlers & Adapters | +15%      | High   | 🟠 Good      | ⏳ Not Started                          |
| 5         | Repositories        | +10%      | Medium | 🟢 High      | ⏳ Not Started                          |
| 6         | Config & Validation | +8%       | Low    | 🟢 High      | ⏳ Not Started                          |
| 7         | Logging & i18n      | +5%       | Low    | 🟡 Medium    | ⏳ Not Started                          |
| **Total** |                     | **+64%**  |        |              | **→ 52% + 64% = 116% (capped at 100%)** |

**Realistic Target:** Following priorities 1–5 = **+53%** coverage → **~75%** total

---

## Testing Strategy

### Phase 1 (Quick Wins) — Weeks 1–2

- Finish error class tests (Priority 1)
- Expand DI container tests (Priority 3, partial)
- **Goal:** +8–10% coverage

### Phase 2 (Core Logic) — Weeks 3–4

- Add domain service tests (Priority 2)
- **Goal:** +10–12% coverage

### Phase 3 (Handlers & Adapters) — Weeks 5–6

- Implement handler tests (Priority 4)
- **Goal:** +10–15% coverage

### Phase 4 (Repositories) — Weeks 7–8

- Add repository adapter tests (Priority 5)
- **Goal:** +8–10% coverage

### Stretch (Polish)

- Configuration tests (Priority 6)
- Logging/i18n tests (Priority 7)

---

## Guidelines for New Tests

1. **Follow Arrange-Act-Assert pattern** (see [testing.md](../guidelines/testing.md))
2. **One logical assertion per test** — easier to debug
3. **Use meaningful fixture names** — e.g., `validGreeting` not just `input`
4. **Mock external deps** — test behavior, not implementations
5. **Test happy path + error cases** — both matter equally
6. **Avoid testing internals** — test contracts, not impl details

---

## Avoiding Over-Testing

❌ **Don't add tests for:**

- Barrel exports (`export * from`)
- Generated D.TS files
- Third-party library internals
- Trivial getters/setters
- Formatting/display logic that doesn't affect behavior

✅ **Do test:**

- Public API contracts
- Error paths and edge cases
- Business logic & validation
- Integration boundaries (adapters)

---

## Tools & Setup

### Coverage Reports

```bash
npm run test:coverage    # Generate HTML report
open coverage/index.html  # View detailed breakdown
```

### Tracking Progress

Keep in `package.json`:

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 60,
      "functions": 75,
      "lines": 70,
      "statements": 70
    }
  }
}
```

Gradually increase thresholds as coverage improves.

---

## Next Steps

1. **Pick Priority 1** (Error handling) and complete all tests
2. **Run coverage report** and identify gaps
3. **Move to Priority 2** (Domain services)
4. **Update this roadmap** quarterly with actual progress
