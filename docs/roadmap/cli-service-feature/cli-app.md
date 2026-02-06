# CLI Application

Build command-line tools without HTTP servers.

## Simple CLI

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";

// Business logic service
class GreetingService {
  greet = (name: string) => {
    console.log(`Hello, ${name}!`);
  };
}

// Create service (no HTTP server)
const service = new Service({
  architecture: {
    domain: { providers: [GreetingService] },
  },
});

await service.start();

// Get service via DI
const greeter = resolveDependency<GreetingService>("GreetingService");

// Use it
const name = process.argv[2] || "World";
greeter.greet(name);

await service.stop();
```

## Run It

```bash
node cli.js Alice
# Hello, Alice!
```

## With File Operations

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import fs from "fs/promises";

class ConfigService {
  async loadConfig(path: string) {
    const data = await fs.readFile(path, "utf-8");
    return JSON.parse(data);
  }

  async saveConfig(path: string, config: any) {
    await fs.writeFile(path, JSON.stringify(config, null, 2));
  }
}

const service = new Service({
  architecture: {
    domain: { providers: [ConfigService] },
  },
});

await service.start();

const configSvc = resolveDependency<ConfigService>("ConfigService");
const config = await configSvc.loadConfig("./config.json");
console.log("Loaded:", config);
```

## When to Use

✅ Command-line tools  
✅ Automation scripts  
✅ Batch processors  
✅ Desktop applications  
❌ Web APIs (use Fastify/Express instead)

**Next**: [REST API →](./03-rest-api.md)
