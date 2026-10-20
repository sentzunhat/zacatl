# Express.js Integration

Zacatl provides Express.js support through the same `Service` lifecycle as
Fastify, with framework-specific handler classes and adapters.

## Quick Start

### Installation

```bash
npm install express @sentzunhat/zacatl
```

### Basic Setup

```typescript
import express from 'express';
import { Service, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { singleton, inject } from 'tsyringe';
import { GetGreetingsHandler } from './application/handlers/get-greetings';

const app = express();
app.use(express.json());

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [],
          routes: [GetGreetingsHandler],
        },
      },
    },
    domain: { providers: [GreetingService] },
    infrastructure: { repositories: [GreetingRepository] },
  },
  platforms: {
    server: {
      name: 'greetings-service',
      port: 3000,
      databases: [],
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.EXPRESS,
        instance: app,
      },
    },
  },
});

await service.start({ host: '0.0.0.0', port: 3000 });
```

## Handler Structure

Express and Fastify handlers have parallel, framework-specific base classes.
Import the Express handler from the Express path when using Express; do not
share a Fastify handler class across both adapters.

```typescript
import { AbstractRouteHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/express/handlers/abstract';
import { singleton, inject } from 'tsyringe';

@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateGreetingBody, // Request body type
  void, // Query parameters type
  GreetingResponse // Response type
> {
  constructor(@inject(GreetingService) private readonly service: GreetingService) {
    super({
      url: '/greetings',
      method: 'POST',
      schema: { body: createGreetingSchema },
    });
  }

  async handler(request): Promise<GreetingResponse> {
    const greeting = await this.service.createGreeting(request.body);
    return greeting;
  }
}
```

## Key Differences at Runtime

| Aspect             | Fastify                         | Express                       |
| ------------------ | ------------------------------- | ----------------------------- |
| Handler base class | Fastify `AbstractRouteHandler`  | Express `AbstractRouteHandler`|
| Schema validation  | Fastify schema handling         | Express adapter validation    |
| Response           | Handler return value is sent    | Handler return value is sent  |
| Hook support       | Fastify lifecycle hooks         | `onRequest`, `preHandler`     |

## Middleware Integration

Express middleware is registered on the `express()` instance **before** passing it to `Service`:

```typescript
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Error handling middleware (registered after service.start())
app.use((err, req, res, _next) => {
  const code = err?.code ?? 500;
  res.status(code).json({ ok: false, message: err.message });
});

const service = new Service({ ..., platforms: { server: { ..., server: { vendor: ServerVendor.EXPRESS, instance: app } } } });
await service.start({ host: '0.0.0.0', port: 3000 });
```

## Full Example

See `examples/express-*` for complete working examples:

- SQLite + Sequelize (`express-sqlite-react`)
- MongoDB + Mongoose (`express-mongodb-react`)
- PostgreSQL + Sequelize (`express-postgres-react`)
- React frontend
- Same layered architecture as Fastify examples

## Switching Between Fastify and Express

Only the `platforms.server.vendor` and `instance` change. **Zero handler changes required:**

```typescript
// Fastify
server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify }

// Express — same handlers, same routes config
server: { type: ServerType.SERVER, vendor: ServerVendor.EXPRESS, instance: expressApp }
```

## Best Practices

1. **Keep handlers thin** — Move complex logic to domain services
2. **Use DI consistently** — Inject all dependencies via constructor
3. **Type everything** — Use generic types for request/response bodies
4. **Error handling** — Use Express error middleware for centralised handling
5. **Validation** — Pass Zod schemas to handler `schema` config; the adapter runs them before `execute`

## Testing Express Handlers

Because handlers extend `AbstractRouteHandler` and use the reply adapter interface, unit tests are the same as Fastify:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { CreateGreetingHandler } from './create-handler';

describe('CreateGreetingHandler', () => {
  it('should call service and reply with 201', async () => {
    const mockService = {
      createGreeting: vi.fn().mockResolvedValue({ id: 1, text: 'Hello' }),
    };

    const handler = new CreateGreetingHandler(mockService as any);

    const req = { body: { text: 'Hello' } } as any;
    const reply = {
      sent: false,
      codeCalled: 0,
      code: vi.fn().mockImplementation(function (this: any, n: number) {
        this.codeCalled = n;
        return this;
      }),
      send: vi.fn().mockImplementation(function (this: any) {
        this.sent = true;
        return this;
      }),
      header: vi.fn().mockReturnThis(),
    };

    await handler.execute(req, reply as any);

    expect(mockService.createGreeting).toHaveBeenCalledWith({ text: 'Hello' });
    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalled();
  });
});
```

For integration tests use `supertest` against the full `Service`-wired Express instance.

## See Also

- [QA & Testing Guide](../roadmap/qa-testing-guide.md) - Testing patterns and framework comparison
- [REST Handlers Guide](./rest-handlers.md) - Framework-agnostic handler patterns
- [Service Adapter Pattern](./service-adapter-pattern.md) - How adapters work
- [Express SQLite React Example](../../examples/express-sqlite-react/)
