# REST API Handlers

Zacatl provides framework-agnostic REST API handler patterns that work consistently across different HTTP frameworks.

## Shared HTTP Methods

All handlers use a unified `HTTPMethod` type defined in `src/service/layers/application/entry-points/rest/common/http-methods.ts`:

All handlers use a unified `HTTPMethod` type defined in `src/service/layers/application/entry-points/rest/common/http-methods.ts`.

## Fastify Handlers

Located in `src/service/layers/application/entry-points/rest/fastify/handlers/`

- **AbstractRouteHandler** - Base class for all Fastify route handlers

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

## Express Handlers

Located in `src/service/layers/application/entry-points/rest/express/handlers/`

- **AbstractRouteHandler** - Base class for all Express route handlers
- **GetRouteHandler** - Convenience class for GET requests
- **PostRouteHandler** - Convenience class for POST requests
- **PutRouteHandler** - Convenience class for PUT requests
- **PatchRouteHandler** - Convenience class for PATCH requests
- **DeleteRouteHandler** - Convenience class for DELETE requests
- Imports `HTTPMethod` from common

**Example:**

```typescript
import { GetRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers';

export class FetchGreetingsHandler extends GetRouteHandler {
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

| Aspect               | Fastify                                           | Express                                                   |
| -------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| **Request Type**     | `Request<TBody, TQuerystring, TParams, THeaders>` | `ExpressRequest<TParams, TResponse, TBody, TQuerystring>` |
| **Reply Type**       | `FastifyReply`                                    | `ExpressResponse`                                         |
| **Base Class**       | `AbstractRouteHandler`                            | `AbstractRouteHandler`                                    |
| **Handler Methods**  | `Get/PostRouteHandler`                            | `Get/Post/Put/Patch/Delete/Head/OptionsRouteHandler`      |
| **Handler Methods**  | `Get/Post/Put/Patch/DeleteRouteHandler`           | `Get/Post/Put/Patch/DeleteRouteHandler`                   |
| **HTTP Method Type** | `HTTPMethod` (from common)                        | `HTTPMethod` (from common)                                |

## Best Practices

1. **Extend Specific Handlers** - Use `GetRouteHandler`, `PostRouteHandler`, etc., instead of `AbstractRouteHandler` for cleaner type hints
2. **Share Logic** - Implement business logic in services, not handlers
3. **Validate Input** - Use Zod schemas to validate request bodies and query parameters
4. **Consistent Responses** - Both frameworks send the value returned by `handler()` unless a reply was already sent
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
│   │   ├── get-route-handler.ts
│   │   ├── post-route-handler.ts
│   │   ├── put-route-handler.ts
│   │   ├── patch-route-handler.ts
│   │   ├── delete-route-handler.ts
│   │   └── index.ts
│   └── index.ts
├── hook-handlers/
├── index.ts
```

## Migration Guide

Migrating from Fastify to Express:

1. Keep the same handler class names (`GetRouteHandler`, `PostRouteHandler`, etc.)
2. Update imports to the Express handlers path under `service/layers/application/entry-points/rest/express/handlers`
3. Change request/reply parameters: `(request, reply)` → `(req, res)`
4. Use `HTTPMethod` from common (already unified)

Fastify and Express implementations share the same HTTP method types, making migration straightforward.
