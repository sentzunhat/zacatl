# Mocking Dependencies

Mock dependencies and external services in your tests.

## Basic Mocking with vi

```typescript
import { describe, it, expect, vi } from "vitest";
import { UserService } from "../../../src/service/domain/services/user-service";
import { IRepository } from "@sentzunhat/zacatl";

describe("UserService with Mocked Repository", () => {
  it("should fetch user from repository", async () => {
    // Create mock repository
    const mockUserRepo: Partial<IRepository<User>> = {
      findById: vi.fn().mockResolvedValue({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
      }),
    };

    // Inject mock into service
    const userService = new UserService(mockUserRepo as any);

    // Call method
    const result = await userService.getUser("1");

    // Assert result
    expect(result.id).toBe("1");
    expect(result.name).toBe("John Doe");

    // Verify mock was called correctly
    expect(mockUserRepo.findById).toHaveBeenCalledWith("1");
    expect(mockUserRepo.findById).toHaveBeenCalledOnce();
  });

  it("should handle repository errors", async () => {
    const mockUserRepo: Partial<IRepository<User>> = {
      findById: vi.fn().mockRejectedValue(new Error("DB Connection failed")),
    };

    const userService = new UserService(mockUserRepo as any);

    await expect(userService.getUser("1")).rejects.toThrow(
      "DB Connection failed",
    );
  });
});
```

## Mock Return Values

```typescript
// Simple value
const mock = vi.fn().mockReturnValue(42);

// Promise (resolved)
const mock = vi.fn().mockResolvedValue({ id: 1 });

// Promise (rejected)
const mock = vi.fn().mockRejectedValue(new Error("Failed"));

// Different values on consecutive calls
const mock = vi
  .fn()
  .mockReturnValueOnce("first")
  .mockReturnValueOnce("second")
  .mockReturnValue("default");

// Custom implementation
const mock = vi.fn((id) => ({ id, name: `User ${id}` }));
```

## Mock HTTP Calls

```typescript
import { describe, it, expect, vi } from "vitest";
import fetch from "node-fetch";

describe("ExternalServiceIntegration", () => {
  it("should call external API", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: "success" }),
    });

    // Global mock
    global.fetch = mockFetch;

    const service = new ExternalService();
    const result = await service.fetchData();

    expect(result.data).toBe("success");
    expect(mockFetch).toHaveBeenCalledWith("https://api.example.com/data");
  });
});
```

## Mock Database

```typescript
import { describe, it, expect, vi } from "vitest";

describe("SequelizeRepository", () => {
  it("should query database correctly", async () => {
    const mockModel = {
      findByPk: vi.fn().mockResolvedValue({ id: "1", name: "Test" }),
      create: vi.fn().mockResolvedValue({ id: "2", name: "New User" }),
      update: vi.fn().mockResolvedValue([1]), // Rows affected
      destroy: vi.fn().mockResolvedValue(1),
    };

    const repository = new UserRepository(mockModel as any);
    const result = await repository.findById("1");

    expect(result.name).toBe("Test");
    expect(mockModel.findByPk).toHaveBeenCalledWith("1");
  });
});
```

## Mock Modules

```typescript
// Mock entire module
vi.mock("../../../src/utils/email", () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
}));

// Mock specific exports
vi.mock("../../../src/config", () => ({
  config: {
    apiKey: "test-key",
    env: "test",
  },
}));

// Partial mock (keep some real implementation)
vi.mock("../../../src/utils/helpers", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    someFunction: vi.fn().mockReturnValue("mocked"),
  };
});
```

## Spy on Existing Methods

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Spying", () => {
  it("should spy on method calls", () => {
    const obj = {
      method: (x: number) => x * 2,
    };

    const spy = vi.spyOn(obj, "method");

    obj.method(5);

    expect(spy).toHaveBeenCalledWith(5);
    expect(spy).toHaveReturnedWith(10);
  });

  it("should spy and override implementation", () => {
    const obj = {
      method: () => "original",
    };

    const spy = vi.spyOn(obj, "method").mockReturnValue("mocked");

    expect(obj.method()).toBe("mocked");
    expect(spy).toHaveBeenCalled();
  });
});
```

## Verify Mock Calls

```typescript
// Called at least once
expect(mock).toHaveBeenCalled();

// Called specific number of times
expect(mock).toHaveBeenCalledOnce();
expect(mock).toHaveBeenCalledTimes(3);

// Called with specific arguments
expect(mock).toHaveBeenCalledWith("arg1", "arg2");

// Called with arguments matching pattern
expect(mock).toHaveBeenCalledWith(
  expect.stringContaining("test"),
  expect.any(Number),
);

// Last call
expect(mock).toHaveBeenLastCalledWith("final");

// Nth call
expect(mock).toHaveBeenNthCalledWith(2, "second call");

// Return value
expect(mock).toHaveReturnedWith(42);
```

## Reset Mocks

```typescript
describe("Mock lifecycle", () => {
  const mock = vi.fn();

  beforeEach(() => {
    mock.mockClear(); // Clear call history
  });

  afterEach(() => {
    mock.mockReset(); // Clear + remove implementation
    mock.mockRestore(); // Restore original (for spies)
  });

  it("test 1", () => {
    mock("test1");
    expect(mock).toHaveBeenCalledOnce();
  });

  it("test 2", () => {
    // mock is clean here because of beforeEach
    mock("test2");
    expect(mock).toHaveBeenCalledOnce();
  });
});
```

## Mock Timers

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Timer tests", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should wait for timeout", () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);

    // Fast-forward time
    vi.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
  });

  it("should run all timers", () => {
    const callback = vi.fn();

    setTimeout(callback, 1000);
    setInterval(callback, 500);

    vi.runAllTimers();

    expect(callback).toHaveBeenCalled();
  });
});
```

---

**Next**: [HTTP Testing →](./04-http-testing.md)
