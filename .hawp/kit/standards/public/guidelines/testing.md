# Testing Guide

Test framework setup, file organization, naming conventions, and patterns for all projects.

## Table of Contents

1. [Framework Choice](#framework-choice)
2. [Setup](#setup)
3. [File Organization](#file-organization)
4. [Naming Conventions](#naming-conventions)
5. [Test Structure & Patterns](#test-structure--patterns)
6. [Mocking Patterns](#mocking-patterns)
7. [What to Test](#what-to-test)
8. [Coverage Targets](#coverage-targets)

---

## Framework Choice

**Vitest** — chosen for all projects because:

- Fast execution with native ESM support.
- Jest-compatible API (familiar, low migration cost).
- Excellent TypeScript support out of the box.
- First-class Vite integration for frontend projects.

---

## Setup

### Vite / Vitest Config

```javascript
// vite.config.mjs (or vitest.config.mjs)
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // describe, it, expect without imports
    include: ["test/**/*.test.ts"],
    environment: "node", // change to 'jsdom' for frontend projects
    globalSetup: "./test/unit/lib/global-setup.ts",
    setupFiles: ["./test/setup.ts", "./test/unit/lib/setup-files.ts"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "lcov"],
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["**/*.d.ts"],
    },
  },
});
```

- `globalSetup` — runs once before all test suites (DB connections, global mocks).
- `setupFiles` — runs before each test file; accepts an array for multiple bootstrap files.

### package.json Scripts

```json
{
  "scripts": {
    "test": "NODE_ENV=test ENV=test vitest run",
    "test:watch": "NODE_ENV=test ENV=test vitest",
    "test:coverage": "NODE_ENV=test ENV=test vitest run --coverage"
  }
}
```

---

## File Organization

Test folders **must mirror** `src/` structure for easy navigation:

```
src/
├── error/bad-request.ts
├── service/user.service.ts
└── utils/measure-execution-time.ts

test/unit/
├── error/bad-request.test.ts
├── service/user.service.test.ts
└── utils/measure-execution-time.test.ts
```

Full test structure:

```
test/
├── setup.ts                 # Shared bootstrap loaded for all tests
├── tsconfig.json            # Test-specific TypeScript config
└── unit/                    # Unit tests (majority)
    ├── helpers/             # Shared test utilities / factories
    ├── lib/                 # Global setup / teardown (Vitest hooks)
    └── <module>/            # Mirrors src/ subdirectories
```

Integration tests (if used) live under `test/integration/` and follow the same mirroring rule.

---

## Naming Conventions

| Item           | Pattern                            | Example                                       |
| -------------- | ---------------------------------- | --------------------------------------------- |
| Test files     | `<module>.test.ts`                 | `bad-request.test.ts`, `user.service.test.ts` |
| Describe block | module path or class name          | `describe('BadRequestError', ...)`            |
| Test case      | `it('should <behavior>', ...)`     | `it('should return 400 status code', ...)`    |
| Test factory   | `create[Entity]` or `make[Entity]` | `createUser()`, `makeAuthContext()`           |

---

## Test Structure & Patterns

### Standard Unit Test Shape

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BadRequestError } from "@/error/bad-request";

describe("BadRequestError", () => {
  it("should set status code to 400", () => {
    const error = new BadRequestError({ message: "Invalid input" });
    expect(error.statusCode).toBe(400);
  });

  it("should include reason in metadata when provided", () => {
    const error = new BadRequestError({
      message: "Invalid",
      reason: "Email required",
    });
    expect(error.reason).toBe("Email required");
  });
});
```

### Mocking Dependencies

```typescript
import { vi } from "vitest";
import { UserService } from "@/service/user.service";
import type { UserRepositoryPort } from "@/domain/providers/user-repository.port";

const mockRepo: UserRepositoryPort = {
  findById: vi.fn(),
  save: vi.fn(),
};

describe("UserService", () => {
  let service: UserService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new UserService(mockRepo);
  });

  it("should call repo.findById with correct id", async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue({ id: "1", name: "Alice" });
    const result = await service.findById("1");
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
    expect(result?.name).toBe("Alice");
  });
});
```

### Test Data Factories

Centralize test data creation in `test/unit/helpers/`:

```typescript
// test/unit/helpers/create-user.ts
export const createUser = (overrides = {}) => ({
  id: "test-id",
  name: "Test User",
  email: "test@example.com",
  ...overrides,
});
```

---

## Mocking Patterns

### Using `vi.mock()` and `vi.hoisted()`

Vitest hoists `vi.mock(...)` calls to the top of the file before any `import` statements. If your mock factory references a local `const` defined in the same scope, wrap it in `vi.hoisted()`:

```typescript
// ✅ Correct — vi.hoisted ensures fn is available when vi.mock runs
const infoMock = vi.hoisted(() => vi.fn());

vi.mock("@your-org/logger", () => ({
  logger: { info: infoMock },
}));

// ❌ Incorrect — infoMock is not yet initialized when vi.mock hoists
const infoMock = vi.fn();
vi.mock("@your-org/logger", () => ({
  logger: { info: infoMock }, // ReferenceError at runtime
}));
```

> Reference: [Vitest `vi.hoisted()` documentation](https://vitest.dev/api/vi.html#vi-hoisted)

### Mocking External Dependencies

Create mock objects for repositories, external services, and adapters:

```typescript
import { vi } from "vitest";

const mockRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  delete: vi.fn(),
};

describe("UserService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return user when found", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue({
      id: "1",
      name: "Alice",
    });
    const result = await service.findById("1");
    expect(result?.name).toBe("Alice");
  });

  it("should throw NotFoundError when user not found", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);
    await expect(service.findById("999")).rejects.toThrow(NotFoundError);
  });
});
```

### Database Mocking (MongoDB)

When testing with MongoDB, use `mongodb-memory-server` for in-memory testing:

```typescript
// test/unit/lib/setup-files.ts
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer;

export const setup = async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongoServer.getUri();
};

export const teardown = async () => {
  if (mongoServer) await mongoServer.stop();
};
```

Then in your test files:

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { connect, disconnect } from "mongoose";

describe("GreetingRepository with MongoDB", () => {
  beforeEach(async () => {
    await connect(process.env.MONGO_URI!);
  });

  afterEach(async () => {
    await disconnect();
  });

  it("should save and retrieve greeting", async () => {
    const repo = new GreetingRepository();
    const greeting = await repo.save({ message: "Hello" });

    expect(greeting.id).toBeDefined();
    expect(greeting.message).toBe("Hello");
  });
});
```

---

## What to Test

### Should Test

- **Public API**: Every public method/function in services, handlers, and utilities.
- **Error paths**: Validate that errors are thrown with correct type, code, and message.
- **Edge cases**: Nulls, empty arrays, boundary values, type coercions, and malformed input.
- **Business logic**: Rules, validations, and side effects that matter to the domain.
- **Async operations**: Resolved values, rejection paths, and race conditions (if applicable).

**Example:**

```typescript
it("should throw BadRequestError when email is invalid", async () => {
  await expect(service.create({ email: "not-an-email" })).rejects.toThrow(
    BadRequestError,
  );
});

it("should return all greetings sorted by creation date", async () => {
  const result = await service.getAll();
  expect(result[0].createdAt).toBeLessThanOrEqual(result[1].createdAt);
});
```

### Should NOT Test

- **Framework internals**: Fastify/Express routing, middleware mechanics.
- **Auto-generated code**: DI container wiring, ORM-generated schemas.
- **Implementation details**: Private method calls, internal state mutations (only test observable outcomes).
- **Third-party libraries**: Trust that Zod, Mongoose, etc. work as documented.
- **Trivial code**: Simple getters/setters with no logic.

**Example (avoid):**

```typescript
// ❌ Don't test framework details
it("should call Express next() middleware", () => {
  // This is Express internals, not your business logic
});

// ❌ Don't test implementation
it("should call internal _validate() method", () => {
  const spy = vi.spyOn(service as any, "_validate");
  // This tests the implementation, not the behavior
});
```

---

## Coverage Targets

| Layer                       | Target |
| --------------------------- | ------ |
| Domain (entities, services) | 90%+   |
| Application (handlers)      | 80%+   |
| Infrastructure (repos)      | 70%+   |
| Utils / helpers             | 80%+   |

Coverage is a guide, not a mandate. Prefer meaningful tests over padding coverage with trivial assertions.
