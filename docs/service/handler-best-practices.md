# REST Handler Best Practices

This guide covers patterns and best practices for building REST handlers with Zacatl using both Fastify and Express.

## Philosophy

Zacatl handlers follow a **lean, generic approach**:

- Handlers return raw application data with no default envelope
- Frameworks handle transmission, status codes, and headers natively
- Error handling is automatic but customizable
- Business logic belongs in services, not handlers

## Basic Handler Pattern

### Simple GET Handler

Fetch a single resource by ID:

```typescript
import { GetRouteHandler } from '@sentzunhat/zacatl/service';
import type User from '../domain';
import { UserService } from '../domain';

interface GetUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export class GetUserHandler extends GetRouteHandler<
  void, // Body
  void, // Query
  GetUserResponse, // Response
  { id: string }, // Params
  void // Headers
> {
  constructor(private userService: UserService) {
    super({
      url: '/users/:id',
      schema: {
        params: z.object({ id: z.string().uuid() }),
        response: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().email(),
          createdAt: z.string().datetime(),
        }),
      },
    });
  }

  async handler(request) {
    const user = await this.userService.findById(request.params.id);

    if (!user) {
      throw new NotFoundError({
        message: `User "${request.params.id}" not found`,
        reason: 'No user exists with this ID',
        component: 'GetUserHandler',
        operation: 'handler',
      });
    }

    return user;
  }
}
```

### Simple POST Handler

Create a new resource:

```typescript
import { PostRouteHandler } from '@sentzunhat/zacatl/service';
import type { CreateUserInput } from '../domain';
import { UserService } from '../domain';

interface CreateUserRequest {
  name: string;
  email: string;
}

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export class CreateUserHandler extends PostRouteHandler<
  CreateUserRequest, // Body
  void, // Query
  CreateUserResponse, // Response
  void, // Params
  void // Headers
> {
  constructor(private userService: UserService) {
    super({
      url: '/users',
      schema: {
        body: z.object({
          name: z.string().min(1).max(255),
          email: z.string().email(),
        }),
        response: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string(),
          createdAt: z.string().datetime(),
        }),
      },
    });
  }

  async handler(request) {
    // Validation happens automatically via Zod schema
    const created = await this.userService.create({
      name: request.body.name,
      email: request.body.email,
    });

    return created;
  }
}
```

### Framework-Specific Note

For **Express**, import from the express-specific handlers:

```typescript
import {
  GetExpressRouteHandler,
  PostExpressRouteHandler,
} from '@sentzunhat/zacatl/service/express';
```

Both Fastify and Express handlers use the same type parameters and schema structure.

## Error Handling

### Automatic Error Mapping

Zacatl maps error types to HTTP status codes automatically:

| Error Type            | Status Code | When to Use                            |
| --------------------- | ----------- | -------------------------------------- |
| `NotFoundError`       | 404         | Resource doesn't exist                 |
| `BadRequestError`     | 400         | Invalid request format                 |
| `BadResourceError`    | 400         | Invalid resource state                 |
| `ValidationError`     | 422         | Validation failed (typically from Zod) |
| `UnauthorizedError`   | 401         | Missing or invalid authentication      |
| `ForbiddenError`      | 403         | Authenticated but lacks permission     |
| `InternalServerError` | 500         | Server error                           |

```typescript
export class GetPostHandler extends GetRouteHandler<void, void, Post, { id: string }, void> {
  constructor(private postService: PostService) {
    super({ url: '/posts/:id', schema: {} });
  }

  async handler(request) {
    const post = await this.postService.findById(request.params.id);

    if (!post) {
      // Automatically returns 404
      throw new NotFoundError({
        message: 'Post not found',
        reason: 'No post matches the given ID',
        component: 'GetPostHandler',
        operation: 'handler',
      });
    }

    return post;
  }
}
```

### Custom Error Handling

Override `handleError()` to customize error responses:

```typescript
export class GetUserHandler extends GetRouteHandler<void, void, User, { id: string }, void> {
  constructor(private userService: UserService) {
    super({ url: '/users/:id', schema: {} });
  }

  async handler(request) {
    // ... handler logic
  }

  protected override handleError(error: Error) {
    // Custom error mapping
    if (error instanceof ValidationError) {
      return {
        code: 'VALIDATION_FAILED',
        message: (error as any).details,
        statusCode: 422,
      };
    }

    // Fall back to default mapping for other errors
    return super.handleError(error);
  }
}
```

**Important**: `statusCode` is extracted from the response before sending, so it won't appear in the JSON response.

## Status Codes & Custom Responses

### Using Framework-Native Methods

For custom status codes beyond the automatic mapping:

**Fastify:**

```typescript
export class CreateUserHandler extends PostRouteHandler<CreateUserRequest, void, User, void, void> {
  constructor(private userService: UserService) {
    super({ url: '/users', schema: {} });
  }

  async handler(request, reply) {
    const user = await this.userService.create(request.body);

    // Set custom status code
    reply.code(201); // Created

    // Add custom headers
    reply.header('Location', `/users/${user.id}`);

    return user;
  }
}
```

**Express:**

```typescript
export class CreateUserHandler extends PostExpressRouteHandler<
  CreateUserRequest,
  void,
  User,
  void,
  void
> {
  constructor(private userService: UserService) {
    super({ url: '/users', schema: {} });
  }

  async handler(request, reply) {
    const user = await this.userService.create(request.body);

    // Set custom status code
    reply.status(201); // Created

    // Add custom headers
    reply.header('Location', `/users/${user.id}`);

    return user;
  }
}
```

Both return the user object, which Zacatl sends as-is with the custom status code.

## Real-World Patterns

### Pagination Handler

```typescript
interface GetUsersQuery {
  page?: number;
  limit?: number;
}

interface GetUsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class GetUsersHandler extends GetRouteHandler<
  void,
  GetUsersQuery,
  GetUsersResponse,
  void,
  void
> {
  constructor(private userService: UserService) {
    super({
      url: '/users',
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().positive().default(1),
          limit: z.coerce.number().int().positive().max(100).default(20),
        }),
        response: z.object({
          data: z.array(userSchema),
          pagination: z.object({
            page: z.number(),
            limit: z.number(),
            total: z.number(),
            pages: z.number(),
          }),
        }),
      },
    });
  }

  async handler(request) {
    const page = request.query.page || 1;
    const limit = request.query.limit || 20;

    const result = await this.userService.findMany({ skip: (page - 1) * limit, take: limit });

    return {
      data: result.items,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: Math.ceil(result.total / limit),
      },
    };
  }
}
```

### Filtering Handler

```typescript
interface GetPostsQuery {
  authorId?: string;
  published?: 'true' | 'false';
  search?: string;
}

export class GetPostsHandler extends GetRouteHandler<void, GetPostsQuery, Post[], void, void> {
  constructor(private postService: PostService) {
    super({
      url: '/posts',
      schema: {
        querystring: z.object({
          authorId: z.string().uuid().optional(),
          published: z.enum(['true', 'false']).optional(),
          search: z.string().min(1).max(100).optional(),
        }),
      },
    });
  }

  async handler(request) {
    const filters = {
      authorId: request.query.authorId,
      published:
        request.query.published === 'true'
          ? true
          : request.query.published === 'false'
          ? false
          : undefined,
      search: request.query.search,
    };

    return this.postService.findMany(filters);
  }
}
```

### Update Handler with Validation

```typescript
interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export class UpdateUserHandler extends PutRouteHandler<
  UpdateUserRequest,
  void,
  User,
  { id: string },
  void
> {
  constructor(private userService: UserService) {
    super({
      url: '/users/:id',
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z
          .object({
            name: z.string().min(1).max(255).optional(),
            email: z.string().email().optional(),
          })
          .refine((obj) => Object.keys(obj).length > 0, 'At least one field must be provided'),
      },
    });
  }

  async handler(request) {
    const updated = await this.userService.update(request.params.id, request.body);

    if (!updated) {
      throw new NotFoundError({
        message: 'User not found',
        reason: 'No user exists with this ID',
      });
    }

    return updated;
  }
}
```

## Hook/Middleware Patterns

### Authentication Hook

Verify JWT and attach user to request:

```typescript
import type { HookHandler } from '@sentzunhat/zacatl/service';

export const AuthHook: HookHandler = {
  name: 'preHandler',
  execute: async (request, reply) => {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError({
        message: 'Missing authentication token',
        reason: 'Authorization header not provided',
      });
    }

    const user = await verifyToken(token);
    (request as any).user = user;
  },
};
```

Register in Service config:

```typescript
new Service({
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [AuthHook],
          routes: [GetUserHandler, CreateUserHandler],
        },
      },
    },
  },
  // ...
});
```

### Logging Hook

Log request details:

```typescript
import type { HookHandler } from '@sentzunhat/zacatl/service';

export const LoggingHook: HookHandler = {
  name: 'onRequest',
  execute: async (request, reply) => {
    const startTime = Date.now();

    (request as any).startTime = startTime;
    (request as any).requestId = crypto.randomUUID();

    const logger = getLogger();
    logger.info({
      requestId: (request as any).requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
    });
  },
};
```

### Timer Hook

Track request duration:

```typescript
export const TimerHook: HookHandler = {
  name: 'onRequest',
  execute: async (request) => {
    (request as any).startTime = Date.now();
  },
};

// In handler or another hook:
const duration = Date.now() - (request as any).startTime;
logger.info(`Request completed in ${duration}ms`);
```

## Testing Patterns

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('GetUserHandler', () => {
  it('returns user when found', async () => {
    const mockUserService = {
      findById: vi.fn().mockResolvedValue({
        id: '123',
        name: 'John',
        email: 'john@example.com',
      }),
    };

    const handler = new GetUserHandler(mockUserService as any);
    const mockRequest = { params: { id: '123' } } as any;

    const result = await handler.handler(mockRequest);

    expect(result).toEqual({
      id: '123',
      name: 'John',
      email: 'john@example.com',
    });
  });

  it('throws NotFoundError when user not found', async () => {
    const mockUserService = {
      findById: vi.fn().mockResolvedValue(null),
    };

    const handler = new GetUserHandler(mockUserService as any);
    const mockRequest = { params: { id: '999' } } as any;

    await expect(handler.handler(mockRequest)).rejects.toThrow(NotFoundError);
  });
});
```

## Common Patterns Summary

| Pattern                     | Use Case               | Example                |
| --------------------------- | ---------------------- | ---------------------- |
| Extend `GetRouteHandler`    | Fetch single resource  | `/users/:id`           |
| Extend `PostRouteHandler`   | Create resource        | `/users` with body     |
| Extend `PutRouteHandler`    | Replace resource       | `/users/:id` with body |
| Extend `PatchRouteHandler`  | Partial update         | `/users/:id` with body |
| Extend `DeleteRouteHandler` | Remove resource        | `/users/:id`           |
| Override `handleError()`    | Custom error format    | Map validation errors  |
| Use `reply.code(201)`       | Custom status codes    | New resource created   |
| Register hooks              | Cross-cutting concerns | Auth, logging, timing  |

## Summary

- **Return raw data** from handlers — let frameworks handle transmission
- **Throw Zacatl errors** for automatic status code mapping
- **Use Zod schemas** for validation (automatic via adapters)
- **Put business logic in services** — handlers are just adapters
- **Override `handleError()`** only when you need custom error formats
- **Use framework methods** (`reply.code()`, `reply.status()`) for custom status codes
- **Hooks handle cross-cutting concerns** — auth, logging, timing, etc.
