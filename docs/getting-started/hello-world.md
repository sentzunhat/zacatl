# Hello World API

Minimal Fastify API to get started quickly.

## Complete Example

```typescript
import Fastify from "fastify";
import {
  Service,
  ServiceType,
  ServerType,
  ServerVendor,
} from "@sentzunhat/zacatl";

const fastify = Fastify({ logger: true });

// Add a simple route
fastify.get("/hello", async () => {
  return { message: "Hello from Zacatl!" };
});

// Create service
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [],
          routes: [],
        },
      },
    },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: "hello-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
    },
  },
});

// Start server
await service.start({ port: 3000 });
console.log("✅ Server running at http://localhost:3000");
```

## Test It

```bash
curl http://localhost:3000/hello
# {"message":"Hello from Zacatl!"}
```

## What's Happening

1. **Fastify Instance** - Create HTTP server
2. **Add Routes** - Define endpoints
3. **Service Wrapper** - Zacatl orchestrates everything
4. **Start** - Server listens on port 3000

## Next Steps

- Add more routes
- Add validation with Zod
- Add error handling

**Next**: [CLI Application →](./02-cli-app.md)
