# Logging API

Structured, high-performance logging with Pino adapter.

## Import

```typescript
import { createLogger, logger } from "@sentzunhat/zacatl/logs";
import {
  PinoLoggerAdapter,
  ConsoleLoggerAdapter,
} from "@sentzunhat/zacatl/logs";
import { createPinoConfig } from "@sentzunhat/zacatl/logs";
```

## Quick Start

### Use Default Logger

```typescript
import { logger } from "@sentzunhat/zacatl/logs";

logger.info("Server started", { data: { port: 3000 } });
```

### Create Custom Logger

```typescript
import { createLogger, PinoLoggerAdapter } from "@sentzunhat/zacatl/logs";

const logger = createLogger(new PinoLoggerAdapter());
```

## Log Levels

```typescript
logger.info("Informational message", { data: { userId: "123" } });
logger.trace("Detailed trace info", { data: { query: "SELECT *" } });
logger.warn("Warning message", { data: { deprecation: true } });
logger.error("Error occurred", { data: { error: err.message } });
logger.fatal("Fatal error", { data: { code: "SYSTEM_FAILURE" } });
```

## Structured Logging

All log methods accept a message and optional structured data:

```typescript
logger.info("User created", {
  data: {
    userId: user.id,
    email: user.email,
  },
  details: {
    timestamp: new Date(),
    ipAddress: req.ip,
  },
});
```

## Adapters

### Pino Adapter (Production)

High-performance JSON logging for microservices:

```typescript
import { createLogger, PinoLoggerAdapter } from "@sentzunhat/zacatl/logs";

const logger = createLogger(new PinoLoggerAdapter());
// Auto-detects: pretty in dev, JSON in production
```

### Console Adapter (CLI/Desktop)

Simple console output for CLI tools and desktop apps:

```typescript
import { createLogger, ConsoleLoggerAdapter } from "@sentzunhat/zacatl/logs";

const logger = createLogger(new ConsoleLoggerAdapter());
```

## Configuration

### Basic Configuration

```typescript
import {
  createLogger,
  PinoLoggerAdapter,
  createPinoConfig,
} from "@sentzunhat/zacatl/logs";

const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      serviceName: "user-api",
      appVersion: "1.0.0",
    }),
  ),
);
```

### File Logging

```typescript
import pino from "pino";
import {
  createLogger,
  PinoLoggerAdapter,
  createPinoConfig,
} from "@sentzunhat/zacatl/logs";

const fileDestination = pino.destination("/var/log/app/app.log");
const logger = createLogger(
  new PinoLoggerAdapter(createPinoConfig(), fileDestination),
);
```

### Multi-Transport (Console + File)

No spread operator needed - use `pinoConfig` option:

```typescript
import {
  createLogger,
  PinoLoggerAdapter,
  createPinoConfig,
} from "@sentzunhat/zacatl/logs";

const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      pinoConfig: {
        transport: {
          targets: [
            { target: "pino/file", options: { destination: "./app.log" } },
            { target: "pino-pretty", options: { colorize: true } },
          ],
        },
      },
    }),
  ),
);
```

### Third-Party Services (Prometheus, Grafana, etc.)

```typescript
import {
  createLogger,
  PinoLoggerAdapter,
  createPinoConfig,
} from "@sentzunhat/zacatl/logs";

const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      serviceName: "my-service",
      pinoConfig: {
        transport: {
          target: "pino/file",
          options: { destination: "/var/log/metrics.json" },
        },
        formatters: {
          log: (object) => ({
            ...object,
            labels: { service: "my-api", env: "production" },
          }),
        },
      },
    }),
  ),
);
```

## Environment-Aware Defaults

`createPinoConfig()` automatically detects environment:

- **Development** (`NODE_ENV=development`): Uses `pino-pretty` for colorized console output
- **Production** (`NODE_ENV=production`): Outputs structured JSON

Override with environment variables:

- `LOG_LEVEL`: Set log level (trace, debug, info, warn, error, fatal)
- `SERVICE_NAME`: Service identifier in logs
- `APP_VERSION`: Application version in logs

## Dependency Injection

### Export Pattern

Create a shared logger instance:

```typescript
// src/utils/logger.ts
import {
  createLogger,
  PinoLoggerAdapter,
  createPinoConfig,
} from "@sentzunhat/zacatl/logs";

export const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      serviceName: "my-service",
    }),
  ),
);
```

Use across your application:

```typescript
import { logger } from "./utils/logger";

logger.info("Application started");
```

### DI Container

```typescript
import { container, inject, singleton } from "@sentzunhat/zacatl";
import type { LoggerInput } from "@sentzunhat/zacatl/logs";
import { createLogger, PinoLoggerAdapter } from "@sentzunhat/zacatl/logs";

@singleton()
class AppLogger {
  private readonly logger = createLogger(new PinoLoggerAdapter());

  info(message: string, input?: LoggerInput) {
    this.logger.info(message, input);
  }
}

container.registerSingleton(AppLogger, AppLogger);

// In your services
class UserService {
  constructor(@inject(AppLogger) private logger: AppLogger) {}

  async createUser(data: UserData) {
    this.logger.info("Creating user", { data });
  }
}
```

## TypeScript Types

```typescript
import type {
  Logger,
  LoggerPort,
  LoggerInput,
  LoggerAdapterType,
  PinoLoggerConfig,
} from "@sentzunhat/zacatl/logs";

// LoggerInput structure
const input: LoggerInput = {
  data: { userId: "123" },
  details: { timestamp: new Date() },
};

// Custom adapter implementation
class MyAdapter implements LoggerPort {
  info(message: string, input?: LoggerInput): void {
    // Your implementation
  }
  // ... other methods
}
```

---

**Next**: [Localization →](../localization/README.md)
