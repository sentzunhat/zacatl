# Test Fixtures

Reusable test data and mock implementations.

## Creating Fixtures

`test/fixtures/user-fixtures.ts`:

```typescript
import { vi } from "vitest";

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

## Using Fixtures

```typescript
import {
  createMockUser,
  createMockUserRepo,
} from "../../fixtures/user-fixtures";

it("should get user", async () => {
  const repo = createMockUserRepo();
  const service = new UserService(repo as any);

  const user = await service.getUser("1");

  expect(user).toEqual(createMockUser());
});

it("should handle custom data", async () => {
  const repo = createMockUserRepo({
    findById: vi.fn().mockResolvedValue(createMockUser({ name: "Jane" })),
  });

  const service = new UserService(repo as any);
  const user = await service.getUser("1");

  expect(user.name).toBe("Jane");
});
```

---

**Next**: [Async Testing →](./08-async-testing.md)
