# Getting Started

Quick guides to get Zacatl running.

- **[Installation](./INSTALLATION.md)** - Install and setup
- **[First Service](./first-service.md)** - Build your first API
- **[Database Setup](./database-setup.md)** - Connect to databases

## Quick Install

```bash
npm install @sentzunhat/zacatl fastify
```

## Minimal Example

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";

const fastify = Fastify();
fastify.get("/", async () => ({ hello: "world" }));

const service = new Service({
  architecture: {
    domain: { providers: [] },
    infrastructure: { repositories: [] },
    server: {
      name: "my-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
        instance: fastify,
      },
    },
  },
});

await service.start({ port: 3000 });
```

---

**Start here**: [Installation →](./installation.md)
