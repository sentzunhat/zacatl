# HTTP Testing

Test REST API handlers and HTTP endpoints with Fastify.

## Basic HTTP Test

```typescript
import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { UserHandler } from "../../../src/service/application/http/handlers/user-handler";

describe("UserHandler", () => {
  it("should handle GET /users/:id request", async () => {
    const fastify = Fastify();

    // Mock repository
    const mockUserRepo = {
      findById: vi.fn().mockResolvedValue({
        id: "1",
        name: "John Doe",
        email: "john@example.com",
      }),
    };

    // Register handler
    const handler = new UserHandler(mockUserRepo as any);
    fastify.get("/users/:id", handler.getUser);

    // Inject request (no server needed)
    const response = await fastify.inject({
      method: "GET",
      url: "/users/1",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      id: "1",
      name: "John Doe",
      email: "john@example.com",
    });

    await fastify.close();
  });
});
```

## Test POST Requests

```typescript
it("should create a user", async () => {
  const fastify = Fastify();

  const mockUserRepo = {
    create: vi.fn().mockResolvedValue({
      id: "2",
      name: "Jane Doe",
      email: "jane@example.com",
    }),
  };

  const handler = new UserHandler(mockUserRepo as any);
  fastify.post("/users", handler.createUser);

  const response = await fastify.inject({
    method: "POST",
    url: "/users",
    payload: {
      name: "Jane Doe",
      email: "jane@example.com",
    },
  });

  expect(response.statusCode).toBe(201);
  expect(response.json()).toMatchObject({
    id: "2",
    name: "Jane Doe",
  });

  await fastify.close();
});
```

## Test Error Responses

```typescript
it("should return 404 when user not found", async () => {
  const mockUserRepo = {
    findById: vi.fn().mockResolvedValue(null),
  };

  const fastify = Fastify();
  const handler = new UserHandler(mockUserRepo as any);
  fastify.get("/users/:id", handler.getUser);

  const response = await fastify.inject({
    method: "GET",
    url: "/users/nonexistent",
  });

  expect(response.statusCode).toBe(404);
  expect(response.json()).toMatchObject({
    error: "Not Found",
  });

  await fastify.close();
});

it("should return 400 for validation errors", async () => {
  const fastify = Fastify();
  const handler = new UserHandler(mockUserRepo as any);
  fastify.post("/users", handler.createUser);

  const response = await fastify.inject({
    method: "POST",
    url: "/users",
    payload: {
      // Missing required fields
    },
  });

  expect(response.statusCode).toBe(400);

  await fastify.close();
});
```

## Test with Headers

```typescript
it("should require authentication", async () => {
  const fastify = Fastify();
  const handler = new UserHandler(mockUserRepo as any);
  fastify.get("/users", handler.listUsers);

  const response = await fastify.inject({
    method: "GET",
    url: "/users",
    headers: {
      authorization: "Bearer test-token",
    },
  });

  expect(response.statusCode).toBe(200);

  await fastify.close();
});

it("should reject unauthorized requests", async () => {
  const fastify = Fastify();
  const handler = new UserHandler(mockUserRepo as any);
  fastify.get("/users", handler.listUsers);

  const response = await fastify.inject({
    method: "GET",
    url: "/users",
    // No authorization header
  });

  expect(response.statusCode).toBe(401);

  await fastify.close();
});
```

## Test Query Parameters

```typescript
it("should handle query parameters", async () => {
  const fastify = Fastify();

  const mockUserRepo = {
    findMany: vi.fn().mockResolvedValue([
      { id: "1", name: "John" },
      { id: "2", name: "Jane" },
    ]),
  };

  const handler = new UserHandler(mockUserRepo as any);
  fastify.get("/users", handler.listUsers);

  const response = await fastify.inject({
    method: "GET",
    url: "/users?page=1&limit=10&sort=name",
  });

  expect(response.statusCode).toBe(200);
  expect(mockUserRepo.findMany).toHaveBeenCalledWith({
    page: 1,
    limit: 10,
    sort: "name",
  });

  await fastify.close();
});
```

## Test Multiple Routes

```typescript
describe("UserHandler - Complete API", () => {
  let fastify: FastifyInstance;
  let mockUserRepo: any;

  beforeEach(() => {
    fastify = Fastify();
    mockUserRepo = {
      findMany: vi.fn().mockResolvedValue([]),
      findById: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue(undefined),
      delete: vi.fn().mockResolvedValue(undefined),
    };

    const handler = new UserHandler(mockUserRepo);
    fastify.get("/users", handler.listUsers);
    fastify.get("/users/:id", handler.getUser);
    fastify.post("/users", handler.createUser);
    fastify.put("/users/:id", handler.updateUser);
    fastify.delete("/users/:id", handler.deleteUser);
  });

  afterEach(async () => {
    await fastify.close();
  });

  it("should list users", async () => {
    const response = await fastify.inject({ method: "GET", url: "/users" });
    expect(response.statusCode).toBe(200);
  });

  it("should get user by ID", async () => {
    const response = await fastify.inject({ method: "GET", url: "/users/1" });
    expect(mockUserRepo.findById).toHaveBeenCalledWith("1");
  });

  it("should create user", async () => {
    const response = await fastify.inject({
      method: "POST",
      url: "/users",
      payload: { name: "Test" },
    });
    expect(mockUserRepo.create).toHaveBeenCalled();
  });
});
```

## Test with Cookies

```typescript
it("should set cookies", async () => {
  const fastify = Fastify();
  fastify.get("/login", async (request, reply) => {
    return reply.setCookie("session", "abc123").send({ ok: true });
  });

  const response = await fastify.inject({
    method: "GET",
    url: "/login",
  });

  expect(response.cookies).toContainEqual(
    expect.objectContaining({
      name: "session",
      value: "abc123",
    }),
  );

  await fastify.close();
});
```

---

**Next**: [Error Testing →](./05-error-testing.md)
