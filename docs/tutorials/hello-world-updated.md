# Hello World API

⚡ Minimal Fastify API - Get started in 30 seconds.

## Complete Example (~20 lines)

```typescript
import "reflect-metadata";
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl/service";

const fastify = Fastify({ logger: false });

// Add a simple route
fastify.get("/hello", async () => {
  return { message: "Hello from Zacatl!" };
});

// Create service with minimal config
const service = new Service({
  type: "SERVER",
  platforms: {
    server: {
      name: "hello-service",
      server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
    },
  },
  layers: {
    infrastructure: { repositories: [] },
    domain: { services: [] },
    application: { entryPoints: { rest: { routes: [] } } },
  },
});

// Start server
await service.start({ port: 3000 });
console.log("✅ Server running at http://localhost:3000");
```

## Test It

```bash
# Run the file
bun index.ts  # or: tsx index.ts

# In another terminal, test the endpoint
curl http://localhost:3000/hello
# {"message":"Hello from Zacatl!"}
```

## What's Happening

1. **Import reflect-metadata** - Required for TypeScript decorators (DI)
2. **Create Fastify** - Standard Fastify instance
3. **Add Routes** - Define endpoints before creating Service
4. **Service Config** - Zacatl wraps and orchestrates everything
5. **Start** - Server listens on port 3000

## ⚡ Performance Note

- Using `logger: false` = faster startup & responses
- Minimal config = < 100ms cold start with Bun
- Add only what you need (no unused middleware)

## Next Steps

- [First Service →](./first-service.md) - Add business logic
- [Full Examples →](../../examples/platform-fastify/) - Production-ready apps
- [REST API Tutorial →](./rest-api.md) - Complete CRUD app
