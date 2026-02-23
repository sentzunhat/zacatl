# Express.js Integration

Zacatl provides Express.js support through the **same `Service` pipeline and `AbstractRouteHandler` base class used by Fastify**. There is one handler abstraction; the `ExpressApiAdapter` inside the platform layer translates it to Express at runtime.

## Quick Start

### Installation

```bash
npm install express @sentzunhat/zacatl
```

### Basic Setup

```typescript
import express from 'express';
import { Service, ServiceType, ServerVendor, ServerType } from '@sentzunhat/zacatl';
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

await service.start({ port: 3000 });
```

## Handler Structure

Express and Fastify handlers use **the same base class**: `AbstractRouteHandler` (from `@sentzunhat/zacatl`). The `ExpressApiAdapter` wraps the Express response in a `FastifyReply`-compatible interface so handlers are portable.

```typescript
import { AbstractRouteHandler } from '@sentzunhat/zacatl';
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

  async handler(request, reply): Promise<GreetingResponse> {
    const greeting = await this.service.createGreeting(request.body);
    await reply.code(201).send({ ok: true, data: greeting });
    return greeting;
  }
}
```

## Key Differences at Runtime

| Aspect             | Fastify                | Express (via adapter)              |
| ------------------ | ---------------------- | ---------------------------------- |
| Handler base class | `AbstractRouteHandler` | `AbstractRouteHandler` (same)      |
| Schema validation  | `fastify-zod`          | `applyZodSchema` in adapter        |
| Response           | `reply.code().send()`  | Adapter translates to `res.json()` |
| Hook support       | All Fastify hooks      | `onRequest`, `preHandler` only     |

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
await service.start({ port: 3000 });
```

## Full Example

See `examples/platform-express` for complete working examples:

- SQLite + Sequelize (`with-sqlite-react`)
- MongoDB + Mongoose (`with-mongodb-react`)
- PostgreSQL + Sequelize (`with-postgres-react`)
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
- [examples/platform-express](../../examples/platform-express/README.md) - Working examples

## Quick Start

### Installation

```bash
npm install express @sentzunhat/zacatl
```

### Basic Setup

```typescript
import express from 'express';
import { AbstractExpressRouteHandler, ExpressApiServerAdapter } from '@sentzunhat/zacatl/service';
import { singleton, inject } from 'tsyringe';

// 1. Create a handler
@singleton()
export class GetGreetingsHandler extends AbstractExpressRouteHandler<
  void,
  void,
  GreetingResponse[]
> {
  config = {
    url: '/greetings',
    method: 'GET' as const,
  };

  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super();
  }

  async execute(req: Express.Request, res: Express.Response): Promise<GreetingResponse[]> {
    const greetings = await this.greetingService.getAllGreetings();
    res.status(200).json(greetings);
    return greetings;
  }
}

// 2. Create app and register handlers
const app = express();
const adapter = new ExpressApiServerAdapter(app);

adapter.registerRoutes([
  new GetGreetingsHandler(greetingService),
  new CreateGreetingHandler(greetingService),
]);

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Handler Structure

Express handlers follow the same pattern as Fastify handlers:

```typescript
@singleton()
export class CreateGreetingHandler extends AbstractExpressRouteHandler<
  CreateGreetingBody, // Request body type
  void, // Query parameters type
  GreetingResponse // Response type
> {
  config = {
    url: '/greetings',
    method: 'POST' as const,
  };

  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super();
  }

  async execute(
    req: Express.Request<void, GreetingResponse, CreateGreetingBody>,
    res: Express.Response<GreetingResponse>,
  ): Promise<GreetingResponse> {
    const greeting = await this.greetingService.createGreeting(req.body);
    res.status(201).json(greeting);
    return greeting;
  }
}
```

## Key Differences from Fastify

| Aspect          | Fastify             | Express            |
| --------------- | ------------------- | ------------------ |
| Request Object  | `FastifyRequest`    | `Express.Request`  |
| Response Object | `FastifyReply`      | `Express.Response` |
| Status Code     | `reply.status(200)` | `res.status(200)`  |
| JSON Response   | `reply.json(data)`  | `res.json(data)`   |
| Headers         | `reply.header()`    | `res.set()`        |

## Middleware Integration

Express handlers work with standard Express middleware:

```typescript
const app = express();

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Register Zacatl handlers
const adapter = new ExpressApiServerAdapter(app);
adapter.registerRoutes(handlers);

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

app.listen(3000);
```

## Full Example

See `examples/platform-express` for a complete working example with:

- SQLite + Sequelize
- MongoDB + Mongoose
- PostgreSQL + Sequelize
- React frontend
- Same layered architecture as Fastify examples

## Switching Between Fastify and Express

The beauty of this pattern is that your domain and infrastructure layers remain unchanged. Only the application layer handlers differ slightly:

### Fastify Handler

```typescript
async handler(request: FastifyRequest, reply: FastifyReply) {
  const result = await this.service.doSomething();
  return result;
}
```

### Express Handler

```typescript
async execute(req: Express.Request, res: Express.Response) {
  const result = await this.service.doSomething();
  res.json(result);
  return result;
}
```

## Best Practices

1. **Keep handlers thin** - Move complex logic to domain services
2. **Use DI consistently** - Inject all dependencies via constructor
3. **Type everything** - Use generic types for request/response bodies
4. **Error handling** - Use Express error middleware for centralized handling
5. **Validation** - Apply Zod schemas in handlers or middleware

> **Note**: Zod is the recommended validation library. Future versions will support Yup and optional validation for flexibility. See [Roadmap: Schema Validation Flexibility](../roadmap/index.md#schema-validation-flexibility-v0040--v010).

## Migration Guide

To migrate from Fastify to Express:

1. Change handler base class from `AbstractRouteHandler` to `AbstractExpressRouteHandler`
2. Update `handler` method to `execute`
3. Change `FastifyReply` to `Express.Response`
4. Update response methods: `reply.json()` → `res.json()`
5. Keep all domain and infrastructure code unchanged

That's it! Your business logic remains portable across frameworks.

## Testing Express Handlers

### Unit Testing Pattern

When testing Express handlers, mock `Express.Request` and `Express.Response`:

```typescript
import { vi, describe, it, expect } from 'vitest';
import { CreateGreetingHandler } from './create-handler';

describe('CreateGreetingHandler', () => {
  it('should call service and send JSON response', async () => {
    const mockService = {
      createGreeting: vi.fn().mockResolvedValue({ id: 1, text: 'Hello' }),
    };

    const handler = new CreateGreetingHandler(mockService);

    const req = {
      body: { text: 'Hello' },
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;

    const result = await handler.execute(req, res);

    expect(mockService.createGreeting).toHaveBeenCalledWith({ text: 'Hello' });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 1, text: 'Hello' });
    expect(result).toEqual({ id: 1, text: 'Hello' });
  });
});
```

**Key points:**

- Mock `res.status()` to return `res` (for chaining)
- Mock `res.json()` to capture the response payload
- Both handler return value AND `res.json()` call are tested
- Handlers should call `res.json()` themselves

### Integration Testing

For integration tests, use `supertest`:

```typescript
import request from 'supertest';
import express from 'express';
import { ExpressApiServerAdapter } from '@sentzunhat/zacatl/service';

describe('GET /greetings', () => {
  let app: Express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    const adapter = new ExpressApiServerAdapter(app);
    adapter.registerRoutes([new GetAllGreetingsHandler(greetingService)]);
  });

  it('should return all greetings', async () => {
    const response = await request(app).get('/greetings');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, text: 'Hello' },
      { id: 2, text: 'Hi' },
    ]);
  });
});
```

## Handler Response Pattern

**Important:** Express handlers must explicitly call response methods. The return value is secondary:

```typescript
async execute(req: Express.Request, res: Express.Response) {
  const result = await this.service.getData();

  // MUST call res.json() - Express doesn't auto-send return values
  res.status(200).json(result);

  // Return value is kept for adapter parity (future enhancement)
  return result;
}
```

This differs from Fastify, where return values are implicitly sent.

## Known Issues & Planned Fixes

### v0.0.39 ✅ Current

- ✅ All HTTP methods working (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ Validation with Zod integration
- ✅ Middleware compatibility
- ℹ️ **Minor test coverage note**: Handler return values are captured but not auto-sent by adapter (code works fine—handlers call `res.json()` explicitly)

### v0.0.40 🔧 Planned

- **Adapter enhancement**: Auto-send return values via `res.json()` if not already sent
- **Benefit**: Provides parity with Fastify's implicit response handling
- **Status**: Non-breaking change; existing code continues working

## See Also

- [QA & Testing Guide](../roadmap/qa-testing-guide.md) - Comprehensive testing patterns and framework comparison
- [REST Handlers Guide](./rest-handlers.md) - Framework-agnostic handler patterns
- [Service Adapter Pattern](./service-adapter-pattern.md) - How adapters work
- [examples/platform-express](../../examples/platform-express/README.md) - Working examples
