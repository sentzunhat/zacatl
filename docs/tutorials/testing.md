# Testing Examples

Test your Zacatl services with Vitest.

## Simple Unit Test

```typescript
import { describe, it, expect } from "vitest";

class Calculator {
  add = (a: number, b: number) => a + b;
}

describe("Calculator", () => {
  it("should add two numbers", () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });
});
```

## Testing with Mocks

```typescript
import { describe, it, expect, vi } from "vitest";
import { UserService } from "./user-service";

describe("UserService", () => {
  it("should get user from repository", async () => {
    // Create mock repository
    const mockRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "1",
        name: "John",
        email: "john@example.com",
      }),
    };

    // Inject mock
    const service = new UserService(mockRepo as any);

    // Call method
    const user = await service.getUser("1");

    // Assertions
    expect(user.name).toBe("John");
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
    expect(mockRepo.findById).toHaveBeenCalledOnce();
  });
});
```

## Testing Error Cases

```typescript
import { describe, it, expect } from "vitest";
import { NotFoundError } from "@sentzunhat/zacatl";
import { UserService } from "./user-service";

describe("UserService - Errors", () => {
  it("should throw NotFoundError when user not found", async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(null),
    };

    const service = new UserService(mockRepo as any);

    await expect(service.getUser("999")).rejects.toThrow(NotFoundError);
  });
});
```

## Testing HTTP Handlers

```typescript
import { describe, it, expect, vi } from "vitest";
import Fastify from "fastify";
import { UserHandler } from "./user-handler";

describe("UserHandler", () => {
  it("should return user list", async () => {
    const fastify = Fastify();

    const mockService = {
      listUsers: vi.fn().mockResolvedValue([
        { id: "1", name: "John" },
        { id: "2", name: "Jane" },
      ]),
    };

    const handler = new UserHandler(mockService as any);
    fastify.get("/users", handler.listUsers);

    const response = await fastify.inject({
      method: "GET",
      url: "/users",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveLength(2);

    await fastify.close();
  });

  it("should handle 404 errors", async () => {
    const fastify = Fastify();

    const mockService = {
      getUser: vi.fn().mockRejectedValue(new NotFoundError("Not found")),
    };

    const handler = new UserHandler(mockService as any);
    fastify.get("/users/:id", handler.getUser);

    const response = await fastify.inject({
      method: "GET",
      url: "/users/999",
    });

    expect(response.statusCode).toBe(404);

    await fastify.close();
  });
});
```

## Using Fixtures

Create reusable test data:

```typescript
// test/fixtures/user-fixtures.ts
export const createMockUser = (overrides = {}) => ({
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  createdAt: new Date(),
  ...overrides,
});

export const createMockUserRepo = (overrides = {}) => ({
  findById: vi.fn().mockResolvedValue(createMockUser()),
  findMany: vi.fn().mockResolvedValue([createMockUser()]),
  create: vi.fn().mockResolvedValue(createMockUser()),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  exists: vi.fn().mockResolvedValue(true),
  ...overrides,
});
```

Use in tests:

```typescript
import { createMockUser, createMockUserRepo } from "../fixtures/user-fixtures";

it("should work with fixtures", async () => {
  const repo = createMockUserRepo();
  const service = new UserService(repo as any);

  const user = await service.getUser("1");

  expect(user).toEqual(createMockUser());
});
```

## Async Testing

```typescript
describe("Async operations", () => {
  it("should wait for promise", async () => {
    const service = new AsyncService();
    const result = await service.asyncOperation();
    expect(result).toBeDefined();
  });

  it("should reject on error", async () => {
    const service = new AsyncService();
    await expect(service.failingOperation()).rejects.toThrow();
  });
});
```

## Running Tests

```bash
npm test                 # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # With coverage report
npm test -- MyTest      # Run specific test file
```

## Best Practices

✅ **Test behaviors, not implementation** - Focus on what, not how  
✅ **Mock external dependencies** - Database, APIs, etc.  
✅ **Use fixtures** - Reusable test data  
✅ **Test error cases** - Don't just test happy paths  
✅ **Keep tests focused** - One test per behavior  
❌ **Don't test third-party code** - Trust your dependencies

## Coverage Goals

Zacatl maintains **79% coverage**. Aim for:

- **Statements**: 75%+
- **Branches**: 70%+
- **Functions**: 80%+
- **Lines**: 75%+

---

**Complete Examples Index**: [← Back to Examples](./README.md)
