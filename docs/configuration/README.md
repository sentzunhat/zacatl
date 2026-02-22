# Configuration

Zacatl provides helpers to load **YAML** and **JSON** configuration files with optional Zod validation.

## Import

```typescript
import { loadJSON, loadYML } from "@sentzunhat/zacatl";
// or via subpath:
import { loadJSON, loadYML } from "@sentzunhat/zacatl/configuration";
```

## API

### `loadJSON<T>(filePath, schema?): T`

Load and parse a JSON (or JSONC) file. Optionally validate with a Zod schema.

```typescript
import { loadJSON } from "@sentzunhat/zacatl";
import { z } from "zod";

const schema = z.object({ port: z.number(), host: z.string() });

const config = loadJSON("./config/server.json", schema);
console.log(config.port); // 3000
```

## Validate with Zod

```typescript
import { loadJSON } from "@sentzunhat/zacatl";
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

const config = loadJSON("./config/default.json", schema);
// config is fully typed as z.infer<typeof schema>
```

## Environment-Specific Files

```typescript
const env = process.env.NODE_ENV ?? "development";
const config = loadJSON(`./config/${env}.json`);
```

### `loadYML<T>(filePath, schema?): T`

Load and parse a YAML file. Optionally validate with a Zod schema. Also exported as `loadYAML`.

```typescript
import { loadYML } from "@sentzunhat/zacatl";

const config = loadYML("./config/app.yaml");
console.log(config.service.name);
```

## Supported Formats

- **JSON / JSONC** — loaded with `loadJSON` (strips `//` and `/* */` comments)
- **YAML / YML** — loaded with `loadYML` / `loadYAML` (via `js-yaml`)

## Example Config Files

**`config/app.yaml`**

```yaml
service:
  name: "user-service"
  port: 3000

database:
  host: "localhost"
  maxConnections: 10
```

**`config/server.json`**

```json
{
  "host": "0.0.0.0",
  "port": 3000
}
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
    "url": "mongodb://localhost:27017/mydb"
  }
}
```

## Error Handling

Both loaders throw typed Zacatl errors:

- `NotFoundError` — file does not exist
- `BadRequestError` — invalid JSON or YAML syntax
- `ValidationError` — Zod schema mismatch
