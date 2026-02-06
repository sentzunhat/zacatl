# Example Comparison & Best Practices

## 🎯 Overview

Zacatl provides multiple example projects showing different patterns and scales. This guide helps you choose the right approach and understand the evolution of best practices.

## 📊 Quick Comparison

| Aspect             | Fastify Examples       | Mictlan (Production)       | Your Choice                     |
| ------------------ | ---------------------- | -------------------------- | ------------------------------- |
| **Lines to Start** | ~50                    | ~150                       | ✅ Fastify (simpler)            |
| **Middleware**     | Minimal (none)         | Heavy (Swagger, Auth, etc) | ⚡ Start minimal, add as needed |
| **DI Pattern**     | Auto via config layers | Manual container setup     | ✅ Auto (easier)                |
| **API Style**      | New `Service` class    | Old `MicroService`         | ✅ Use `Service`                |
| **Startup Time**   | < 1s (SQLite)          | 2-3s                       | ⚡ Faster is better             |
| **Best For**       | Learning, prototypes   | Enterprise apps            | Start simple, scale up          |

## 🏆 Recommended Patterns

### 1. Entry Point (index.ts)

**✅ DO - Minimal & Fast (Fastify Examples)**

```typescript
import "reflect-metadata";
import "./init-di"; // Just reflect-metadata import
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl/service";
import { config, createServiceConfig } from "./config";

const fastify = Fastify({ logger: false });
const sequelize = new Sequelize({ dialect: "sqlite", storage: "db.sqlite" });
const service = new Service(createServiceConfig(fastify, sequelize));

await service.start({ port: 8081 });
```

**❌ DON'T - Manual Setup (Old Pattern)**

```typescript
// Manual DI registration
for (const dependency of clients) {
  container.register(dependency, { useValue: new dependency() });
}

// Manual architecture wiring
const microService = new MicroService({
  architecture: {
    application: {
      /* ... */
    },
    domain: {
      /* ... */
    },
    infrastructure: {
      /* ... */
    },
    service: {
      /* ... */
    },
  },
});
```

### 2. Configuration Pattern

**✅ DO - Centralized Config Function**

```typescript
// config.ts
export function createServiceConfig(fastify, sequelize) {
  return {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: "my-service",
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
        },
        databases: [{ vendor: DatabaseVendor.SEQUELIZE, instance: sequelize }],
      },
    },
    layers: {
      infrastructure: { repositories: [GreetingRepository] },
      domain: { services: [GreetingService] },
      application: {
        entryPoints: { rest: { routes: [GetAllHandler, CreateHandler] } },
      },
    },
  };
}
```

**Benefits:**

- ✅ Single source of truth
- ✅ Automatic DI registration
- ✅ Easy to test (mock config)
- ✅ Type-safe

### 3. Dependency Injection

**✅ DO - Class-Token Injection**

```typescript
@singleton()
export class GreetingService {
  constructor(
    @inject(GreetingRepository)
    private readonly repo: GreetingRepository,
  ) {}
}
```

**Benefits:**

- ✅ Auto-wired by Zacatl
- ✅ Type-safe
- ✅ No manual container code

### 4. Route Handlers

**✅ DO - Extend AbstractRouteHandler**

```typescript
@singleton()
export class GetAllGreetingsHandler extends AbstractRouteHandler<
  void,
  void,
  Greeting[]
> {
  constructor(@inject(GreetingService) private service: GreetingService) {
    super({ url: "/greetings", method: "GET", schema: {} });
  }

  async handler(request: Request<void>, reply: FastifyReply) {
    return this.service.getAllGreetings();
  }
}
```

**Benefits:**

- ✅ Auto-registered from config
- ✅ Testable
- ✅ Clean separation

## 🚀 Performance Best Practices

### From the Examples

1. **Disable Logger in Production**

   ```typescript
   const fastify = Fastify({ logger: false }); // Faster responses
   ```

2. **Use Bun Runtime**

   ```bash
   bun index.ts  # 2-3x faster startup vs Node.js
   ```

3. **Minimal Middleware**

   ```typescript
   // ✅ Start with ZERO middleware
   // ❌ Don't add Swagger, Helmet, CORS unless you need them
   ```

4. **SQLite for Prototypes**

   ```typescript
   // ✅ No network latency, single file
   // ❌ Don't use MongoDB unless you need scaling
   ```

5. **Lazy Loading**
   ```typescript
   // ✅ Only import what you use
   import { Service } from "@sentzunhat/zacatl/service";
   // ❌ Don't import entire framework
   import * as Zacatl from "@sentzunhat/zacatl"; // Slow!
   ```

## 📈 Scaling Path

### Phase 1: Prototype (Use SQLite Example)

- ✅ 50 lines of code
- ✅ < 1 second startup
- ✅ Zero infrastructure
- ✅ Perfect for MVPs

### Phase 2: Production (Upgrade to MongoDB)

- ✅ Same code structure
- ✅ Just swap config
- ✅ Add middleware as needed
- ✅ Still < 2 second startup

### Phase 3: Enterprise (Inspired by Mictlan)

- Add OpenTelemetry for observability
- Add Swagger for API docs
- Add authentication/authorization
- Add areas-based architecture
- **Note:** Only add what you actually need!

## 🎯 Migration Tips

### From Mictlan Pattern to Fastify Pattern

1. **Replace manual DI:**

   ```typescript
   // Before (Mictlan)
   for (const dep of clients) {
     container.register(dep, { useValue: new dep() });
   }

   // After (Fastify)
   // Nothing! Config handles it automatically
   ```

2. **Simplify service creation:**

   ```typescript
   // Before (Mictlan)
   const microService = new MicroService({ architecture: { ... } });

   // After (Fastify)
   const service = new Service(createServiceConfig(fastify, db));
   ```

3. **Remove unnecessary middleware:**

   ```typescript
   // Before (Mictlan - heavy setup)
   await server.register(fastifyMultipart);
   await server.register(openTelemetryPlugin);
   await server.register(cors);
   await server.register(helmet);
   await server.register(fastifySwagger);

   // After (Fastify - start minimal)
   const fastify = Fastify({ logger: false });
   // Add middleware ONLY when needed
   ```

## 🏁 Recommendation

**Start with**: `examples/platform-fastify/01-with-sqlite`

- Fastest to get running
- Simplest code
- Best for learning

**Upgrade to**: `examples/platform-fastify/02-with-mongodb`

- When you need scaling
- Same simple pattern
- Production-ready

**Reference**: `mictlan-example`

- For enterprise patterns
- When you need observability
- Don't copy the complexity unless needed!

## 📚 Key Takeaways

1. ⚡ **Simple is Fast** - Fewer lines = faster startup
2. 🎯 **Start Minimal** - Add complexity only when needed
3. 🔄 **Same Pattern Works** - SQLite → MongoDB is just config change
4. 📦 **Config-Based DI** - Let Zacatl wire dependencies
5. 🚀 **Bun for Speed** - Use the fastest runtime
