# Error Handling

Structured error handling with correlation IDs.

## Built-in Error Types

Zacatl provides 7 custom error types:

```typescript
import {
  BadRequestError, // 400
  UnauthorizedError, // 401
  ForbiddenError, // 403
  NotFoundError, // 404
  ValidationError, // 400
  InternalServerError, // 500
  BadResourceError, // 422
} from "@sentzunhat/zacatl";
```

## Basic Usage

```typescript
import { NotFoundError, ValidationError } from "@sentzunhat/zacatl";

class UserService {
  async getUser(id: string) {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async createUser(data: any) {
    if (!data.email) {
      throw new ValidationError("Email is required");
    }
    return this.repo.create(data);
  }
}
```

## With Metadata

Add context to errors:

```typescript
throw new NotFoundError("User not found", {
  userId: id,
  requestedBy: currentUser.id,
  timestamp: new Date(),
});
```

## Global Error Handler

Set up error handling for your API:

```typescript
import { FastifyInstance } from "fastify";
import { CustomError } from "@sentzunhat/zacatl";

export function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler(async (error, request, reply) => {
    // Handle Zacatl errors
    if (error instanceof CustomError) {
      return reply.status(error.statusCode).send({
        error: error.message,
        correlationId: error.correlationId,
        metadata: error.metadata,
      });
    }

    // Handle unknown errors
    console.error("Unhandled error:", error);
    return reply.status(500).send({
      error: "Internal Server Error",
    });
  });
}
```

## Usage in Service

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";
import { setupErrorHandler } from "./middleware/error-handler";

const fastify = Fastify();
setupErrorHandler(fastify);

// Your routes...

const service = new Service({
  architecture: {
    server: {
      server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
    },
  },
});

await service.start({ port: 3000 });
```

## Error Response Format

Errors return this structure:

```json
{
  "error": "User not found",
  "correlationId": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "userId": "123",
    "requestedBy": "admin"
  }
}
```

## Best Practices

✅ **Use specific error types** - NotFoundError, ValidationError, etc.  
✅ **Include metadata** - Add context for debugging  
✅ **Log correlation IDs** - Track errors across systems  
✅ **Set up global handler** - Catch all errors consistently  
❌ **Don't expose stack traces** - Keep production responses clean

## Error Types Reference

| Error                 | Code | When to Use              |
| --------------------- | ---- | ------------------------ |
| `BadRequestError`     | 400  | Invalid input format     |
| `UnauthorizedError`   | 401  | Missing/invalid auth     |
| `ForbiddenError`      | 403  | No permission            |
| `NotFoundError`       | 404  | Resource doesn't exist   |
| `ValidationError`     | 400  | Failed validation rules  |
| `InternalServerError` | 500  | Unexpected server errors |
| `BadResourceError`    | 422  | Invalid resource state   |

**Next**: [Internationalization →](./06-i18n.md)
