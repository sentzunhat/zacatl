# Configuration API

Load and validate configuration from JSON or environment.

## Import

```typescript
import { loadConfig } from "@sentzunhat/zacatl";
```

## Load from JSON

```typescript
const config = loadConfig("./config/default.json", "json");

console.log(config.data.server.port); // 3000
```

## Load from Environment

```typescript
const config = loadConfig({
  PORT: process.env.PORT || "3000",
  DATABASE_URL: process.env.DATABASE_URL,
});
```

## Validate with Zod

```typescript
import { z } from "zod";

const schema = z.object({
  server: z.object({
    port: z.number().min(1000).max(65535),
    host: z.string(),
  }),
  database: z.object({
    url: z.string().url(),
  }),
});

const config = loadConfig("./config/default.json", "json");
const validated = schema.parse(config.data);
```

## Environment-Specific

```typescript
const env = process.env.NODE_ENV || "development";
const config = loadConfig(`./config/${env}.json`, "json");
```

## Config File Example

`config/default.json`:

```json
{
  "server": {
    "port": 3000,
    "host": "localhost"
  },
  "database": {
    "url": "postgresql://localhost:5432/mydb"
  }
}
```

---

**Next**: [Logging →](./logging.md)
