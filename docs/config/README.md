# Configuration

Zacatl provides configuration loading for **YAML** and **JSON** files. The module is separate from application-wide settings (which are handled by `node-config`).

## Two Approaches

### 1. Application-wide Settings (via `node-config`)

Use `getConfigOrThrow` to read from the `config/` directory (managed by `node-config`):

```typescript
import { getConfigOrThrow } from "@sentzunhat/zacatl";

// Reads from config/default.json + config/{NODE_ENV}.json
const serviceName = getConfigOrThrow<string>("SERVICE_NAME");
const port = getConfigOrThrow<number>("PORT");
```

`node-config` automatically merges files:

- `config/default.{json,yaml}` - Base settings
- `config/{NODE_ENV}.{json,yaml}` - Environment-specific overrides
- `config/local.{json,yaml}` - Local/machine-specific (not version-controlled)

### 2. Explicit File Loading (Loaders)

Load specific config files with explicit format selection:

```typescript
import { loadConfig, getLoader } from "@sentzunhat/zacatl";

// Explicit format selection (like ORM adapters)
const appConfig = loadConfig<AppConfig>("config/app.yaml", "yaml");
const serverConfig = loadConfig<ServerConfig>("config/server.json", "json");

// Or get a loader directly
const yamlLoader = getLoader("yaml");
const data = yamlLoader.load("path/to/file.yaml");
```

## API

### `loadConfig<T>(filePath, format): LoadedConfig<T>`

Load a single config file.

```typescript
const result = loadConfig<MyConfig>("./config/app.yaml", "yaml");
console.log(result.data); // Your parsed config
console.log(result.filePath); // Path used
console.log(result.format); // "yaml" | "json"
```

### `loadConfigFromPaths<T>(paths): LoadedConfig<T>`

Try multiple paths, return first found:

```typescript
const config = loadConfigFromPaths<AppConfig>([
  { path: "./config/local.yaml", format: "yaml" },
  { path: "./config/default.yaml", format: "yaml" },
  { path: "./config/default.json", format: "json" },
]);
```

### `getLoader(format): ConfigLoader<T>`

Get a loader instance for a specific format:

```typescript
const jsonLoader = getLoader("json"); // JSONLoader
const yamlLoader = getLoader("yaml"); // YAMLLoader
const data = yamlLoader.parse(yamlString);
```

## Supported Formats

- **`"json"`** - JSON with comment support (JSONC)
- **`"yaml"` or `"yml"`** - YAML format (via `js-yaml`)

## Example Config Files

**`config/app.yaml`**

```yaml
service:
  name: "user-service"
  version: "1.0.0"

database:
  host: "localhost"
  port: 5432
  pool:
    min: 2
    max: 10
```

**`config/server.json`**

```jsonc
{
  // Server configuration
  "host": "0.0.0.0",
  "port": 3000,
  "ssl": {
    "enabled": false,
  },
}
```

## Design Notes

- **Loaders are stateless** - Each call creates a new loader instance (similar to ORM adapters)
- **Format is explicit** - You choose "json" or "yaml", not auto-detected
- **Type-safe** - Generics for typed configuration objects
- **Node-config still supported** - Use `getConfigOrThrow` for app-wide settings

## Usage

### Loading Configuration

Use `loadConfig` to load a specific file, or `loadConfigFromPaths` to search through multiple locations.

```typescript
import { loadConfig, loadConfigFromPaths } from "@sentzunhat/zacatl";

// 1. Load a specific file (explicit format)
const config = loadConfig<{ port: number }>("config/production.yaml", "yaml");
console.log(config.data.port);

// 2. Search in multiple paths (first match wins)
const appConfig = loadConfigFromPaths([
  { path: "config/local.yaml", format: "yaml" },
  { path: "config/default.yaml", format: "yaml" },
  { path: "config/default.json", format: "json" },
]);
console.log(appConfig.filePath);
```

### Example Configuration Files

**`config/default.yaml`**

```yaml
service:
  name: "user-service"
  port: 3000

database:
  host: "localhost"
  maxConnections: 10
```

**`config/default.json`**

```jsonc
{
  "service": {
    "name": "user-service",
    "port": 3000,
  },
  // Database settings
  "database": {
    "host": "localhost",
    "maxConnections": 10,
  },
}
```

## Legacy Support

The module exports `getConfigOrThrow` which wraps the legacy `config` (node-config) package for backward compatibility. This will be deprecated in future phases.

```typescript
import { getConfigOrThrow } from "@sentzunhat/zacatl";

const val = getConfigOrThrow<string>("SERVICE_NAME");
```
