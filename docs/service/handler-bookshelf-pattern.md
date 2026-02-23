# Handler Provider "Bookshelf" Pattern

## Overview

Zacatl provides **provider-specific handler exports** following the same pattern as Mongoose/Sequelize repositories. Developers choose their framework at import time—no runtime checking needed.

## Available Providers

### Fastify Handlers

```typescript
import {
  AbstractRouteHandler,
  GetRouteHandler,
  PostRouteHandler,
  DeleteRouteHandler,
  PatchRouteHandler,
  PutRouteHandler,
} from '@sentzunhat/zacatl/handlers/fastify';
```

### Express Handlers

```typescript
import {
  AbstractRouteHandler,
  GetRouteHandler,
  PostRouteHandler,
  DeleteRouteHandler,
  PatchRouteHandler,
  PutRouteHandler,
} from '@sentzunhat/zacatl/handlers/express';
```

## HTTP Method Coverage

| Method | Fastify | Express | Status    |
| ------ | ------- | ------- | --------- |
| GET    | ✅      | ✅      | Available |
| POST   | ✅      | ✅      | Available |
| DELETE | ✅      | ✅      | Available |
| PATCH  | ✅      | ✅      | Available |
| PUT    | ✅      | ✅      | Available |

## Usage Patterns

### Option 1: AbstractRouteHandler (Flexible)

Specify the HTTP method explicitly in the constructor:

```typescript
// Fastify
import { AbstractRouteHandler } from '@sentzunhat/zacatl/handlers/fastify';

export class MyHandler extends AbstractRouteHandler<TBody, TQuery, TResponse> {
  constructor() {
    super({
      url: '/my-route',
      method: 'GET', // Explicit method
      schema: {},
    });
  }
}
```

```typescript
// Express
import { AbstractRouteHandler } from '@sentzunhat/zacatl/handlers/express';

export class MyHandler extends AbstractRouteHandler<TBody, TQuery, TResponse> {
  constructor() {
    super({
      url: '/my-route',
      method: 'GET', // Explicit method
      schema: {},
    });
  }
}
```

### Option 2: Convenience Classes (HTTP Method Pre-set)

The HTTP method is automatically set based on the class:

```typescript
// Fastify
import { GetRouteHandler } from '@sentzunhat/zacatl/handlers/fastify';

export class GetUserHandler extends GetRouteHandler<void, void, UserResponse> {
  constructor() {
    super({
      url: '/users/:id',
      schema: {}, // Method: "GET" is automatic
    });
  }
}
```

```typescript
// Express
import { PostRouteHandler } from '@sentzunhat/zacatl/handlers/express';

export class CreateUserHandler extends PostRouteHandler<CreateUserBody, void, UserResponse> {
  constructor() {
    super({
      url: '/users',
      schema: {}, // Method: "POST" is automatic
    });
  }
}
```

## Framework Comparison

### Similarities

- ✅ **Same API surface**: Both use identical method signatures
- ✅ **Type safety**: Full TypeScript support
- ✅ **Zod validation**: Both support schema validation
- ✅ **DI integration**: tsyringe decorator support

### Differences

- **Request/Response types**: Fastify uses `FastifyReply`, Express uses `Response`
- **Schema format**: Fastify supports `FastifySchema`, Express uses generic `Record<string, unknown>`
- **Type definitions**: Framework-specific under the hood

## Migration Between Frameworks

Switching frameworks is as simple as changing the import path:

```typescript
// Before (Fastify)
import { AbstractRouteHandler } from '@sentzunhat/zacatl/handlers/fastify';

// After (Express) - same implementation!
import { AbstractRouteHandler } from '@sentzunhat/zacatl/handlers/express';
```

## Examples

See working examples in:

- `examples/platform-fastify/with-*-react/apps/backend/src/application/handlers/`
- `examples/platform-express/with-*-react/apps/backend/src/application/handlers/`

Each example demonstrates:

- GET (get-all, get-by-id, get-random)
- POST (create)
- DELETE (delete)

PATCH and PUT patterns follow the same structure.

## Architecture Benefits

1. **No runtime checks**: Framework choice at compile-time
2. **Tree-shakeable**: Only import what you use
3. **Type-safe**: No casting between framework types
4. **Clear intent**: Import path shows framework choice
5. **Consistent with ORM pattern**: Same approach as mongoose/sequelize
