# REST API Handlers

Zacatl provides framework-agnostic REST API handler patterns that work consistently across different HTTP frameworks.

## Shared HTTP Methods

All handlers use a unified `HTTPMethod` type defined in `src/service/layers/application/entry-points/rest/common/http-methods.ts`:

```typescript
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
```

This ensures consistent HTTP method naming across Fastify and Express implementations.

## Framework-Specific Implementations

### Fastify Handlers

Located in `src/service/layers/application/entry-points/rest/fastify/handlers/`

- **AbstractRouteHandler** - Base class for all Fastify route handlers
- **GetRouteHandler** - Convenience class for GET requests
- **PostRouteHandler** - Convenience class for POST requests
- Imports `HTTPMethod` from common

**Example:**

```typescript
import { GetRouteHandler } from '@sentzunhat/zacatl/service';

export class FetchGreetingsHandler extends GetRouteHandler {
  constructor() {
    super({
      url: '/greetings',
      schema: {
        response: z.object({ message: z.string() }),
      },
    });
  }

  async handler(request, reply) {
    return { message: 'Hello from Fastify!' };
  }
}
```

### Express Handlers

Located in `src/service/layers/application/entry-points/rest/express/handlers/`

- **AbstractExpressRouteHandler** - Base class for all Express route handlers
- **GetExpressRouteHandler** - Convenience class for GET requests
- **PostExpressRouteHandler** - Convenience class for POST requests
- **PutExpressRouteHandler** - Convenience class for PUT requests
- **PatchExpressRouteHandler** - Convenience class for PATCH requests
- **DeleteExpressRouteHandler** - Convenience class for DELETE requests
- **HeadExpressRouteHandler** - Convenience class for HEAD requests
- **OptionsExpressRouteHandler** - Convenience class for OPTIONS requests
- Imports `HTTPMethod` from common

**Example:**

```typescript
import { GetExpressRouteHandler } from '@sentzunhat/zacatl/service';

export class FetchGreetingsHandler extends GetExpressRouteHandler {
  constructor() {
    super({
      url: '/greetings',
      schema: {
        response: z.object({ message: z.string() }),
      },
    });
  }

  async handler(req, res) {
    return { message: 'Hello from Express!' };
  }
}
```

## Key Differences

| Aspect               | Fastify                                           | Express                                                     |
| -------------------- | ------------------------------------------------- | ----------------------------------------------------------- |
| **Request Type**     | `Request<TBody, TQuerystring, TParams, THeaders>` | `ExpressRequest<TParams, TResponse, TBody, TQuerystring>`   |
| **Reply Type**       | `FastifyReply`                                    | `ExpressResponse`                                           |
| **Base Class**       | `AbstractRouteHandler`                            | `AbstractExpressRouteHandler`                               |
| **Handler Methods**  | `Get/PostRouteHandler`                            | `Get/Post/Put/Patch/Delete/Head/OptionsExpressRouteHandler` |
| **HTTP Method Type** | `HTTPMethod` (from common)                        | `HTTPMethod` (from common)                                  |

## Best Practices

1. **Extend Specific Handlers** - Use `GetRouteHandler`, `PostRouteHandler`, etc., instead of `AbstractRouteHandler` for cleaner type hints
2. **Share Logic** - Implement business logic in services, not handlers
3. **Validate Input** - Use Zod schemas to validate request bodies and query parameters
4. **Consistent Responses** - Both frameworks wrap responses in `{ ok, message, data }` format
5. **Port-Adapter Pattern** - Keep handlers focused on adapting framework-specific types to domain logic

## Structure Overview

```
rest/
├── common/
│   ├── handler.ts
│   ├── request.ts
│   ├── http-methods.ts      ← Shared HTTP methods
│   └── index.ts
├── fastify/
│   ├── handlers/
│   │   ├── abstract.ts      ← Base class
│   │   ├── route-handler.ts ← Interface
│   │   ├── get-route-handler.ts
│   │   ├── post-route-handler.ts
│   │   ├── generics.ts
│   │   └── index.ts
│   └── index.ts
├── express/
│   ├── handlers/
│   │   ├── abstract.ts      ← Base class
│   │   ├── get-handler.ts
│   │   ├── post-handler.ts
│   │   ├── put-handler.ts
│   │   ├── patch-handler.ts
│   │   ├── delete-handler.ts
│   │   ├── head-handler.ts
│   │   ├── options-handler.ts
│   │   └── index.ts
│   ├── express-api-server.ts
│   └── index.ts
├── hook-handlers/
├── index.ts
```

## Migration Guide

Migrating from Fastify to Express:

1. Replace `GetRouteHandler` with `GetExpressRouteHandler`
2. Update imports from `@sentzunhat/zacatl/service` (paths include `express`)
3. Change request/reply parameters: `(request, reply)` → `(req, res)`
4. Use `HTTPMethod` from common (already unified)

Fastify and Express implementations share the same HTTP method types, making migration straightforward.
