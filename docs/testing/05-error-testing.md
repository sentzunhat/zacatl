# Error Testing

Test error scenarios and exception handling in your services.

## Testing Custom Errors

```typescript
import { describe, it, expect } from "vitest";
import {
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
} from "@sentzunhat/zacatl";

describe("Error Handling", () => {
  it("should throw NotFoundError with metadata", () => {
    const error = new NotFoundError("User not found", { userId: 123 });

    expect(error.message).toBe("User not found");
    expect(error.statusCode).toBe(404);
    expect(error.metadata).toEqual({ userId: 123 });
    expect(error.correlationId).toBeDefined();
  });

  it("should throw ValidationError", () => {
    const error = new ValidationError("Email is required");

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe("Email is required");
  });

  it("should throw UnauthorizedError", () => {
    const error = new UnauthorizedError("Invalid token");

    expect(error.statusCode).toBe(401);
  });

  it("should throw ForbiddenError", () => {
    const error = new ForbiddenError("Access denied");

    expect(error.statusCode).toBe(403);
  });

  it("should throw InternalServerError", () => {
    const error = new InternalServerError("Database connection failed");

    expect(error.statusCode).toBe(500);
  });
});
```

## Testing Service Errors

```typescript
import { describe, it, expect, vi } from "vitest";
import { UserService } from "../../../src/service/domain/services/user-service";
import { NotFoundError } from "@sentzunhat/zacatl";

describe("UserService - Error Cases", () => {
  it("should throw NotFoundError when user not found", async () => {
    const mockRepo = {
      findById: vi.fn().mockResolvedValue(null),
    };

    const service = new UserService(mockRepo as any);

    await expect(service.getUser("999")).rejects.toThrow(NotFoundError);
    await expect(service.getUser("999")).rejects.toThrow("User not found");
  });

  it("should throw ValidationError for invalid data", async () => {
    const service = new UserService(mockRepo as any);

    await expect(service.createUser({ email: "invalid" })).rejects.toThrow(
      ValidationError,
    );
  });

  it("should propagate repository errors", async () => {
    const mockRepo = {
      findById: vi.fn().mockRejectedValue(new Error("DB Connection failed")),
    };

    const service = new UserService(mockRepo as any);

    await expect(service.getUser("1")).rejects.toThrow("DB Connection failed");
  });
});
```

## Testing Error Handlers

```typescript
import { describe, it, expect } from "vitest";
import Fastify from "fastify";
import { NotFoundError } from "@sentzunhat/zacatl";

describe("Global Error Handler", () => {
  it("should return 404 for NotFoundError", async () => {
    const fastify = Fastify();

    fastify.get("/users/:id", async (request, reply) => {
      throw new NotFoundError("User not found");
    });

    const response = await fastify.inject({
      method: "GET",
      url: "/users/999",
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: "Not Found",
      message: "User not found",
    });

    await fastify.close();
  });

  it("should return 500 for unhandled errors", async () => {
    const fastify = Fastify();

    fastify.get("/error", async () => {
      throw new Error("Unexpected error");
    });

    const response = await fastify.inject({
      method: "GET",
      url: "/error",
    });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toHaveProperty("error");

    await fastify.close();
  });
});
```

## Testing Try-Catch Blocks

```typescript
describe("Error Recovery", () => {
  it("should catch and handle errors gracefully", async () => {
    const service = new PaymentService();

    const result = await service.processPayment({
      amount: 100,
      cardNumber: "invalid",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Invalid card number");
  });

  it("should retry on transient errors", async () => {
    const mockApi = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockRejectedValueOnce(new Error("Network timeout"))
      .mockResolvedValue({ success: true });

    const service = new RetryService(mockApi);

    const result = await service.callWithRetry();

    expect(result.success).toBe(true);
    expect(mockApi).toHaveBeenCalledTimes(3);
  });
});
```

## Testing Error Metadata

```typescript
it("should include correlation ID in error", () => {
  const error = new NotFoundError("Resource not found");

  expect(error.correlationId).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
  );
});

it("should include metadata in error", () => {
  const error = new ValidationError("Invalid input", {
    field: "email",
    value: "invalid@",
  });

  expect(error.metadata).toEqual({
    field: "email",
    value: "invalid@",
  });
});
```

## Testing Validation Errors

```typescript
import { z } from "zod";

describe("Validation", () => {
  it("should throw on invalid schema", () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    const invalidData = {
      email: "not-an-email",
      age: 15,
    };

    expect(() => schema.parse(invalidData)).toThrow();
  });

  it("should pass on valid schema", () => {
    const schema = z.object({
      email: z.string().email(),
      age: z.number().min(18),
    });

    const validData = {
      email: "user@example.com",
      age: 25,
    };

    expect(() => schema.parse(validData)).not.toThrow();
  });
});
```

---

**Next**: [Test Organization →](./06-test-organization.md)
