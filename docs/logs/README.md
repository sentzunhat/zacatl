# Logging API

Structured, high-performance logging with pluggable adapters.

## Import

```typescript
// Default logger (Pino) and factory
import { logger, createLogger } from '@sentzunhat/zacatl/logs';

// Adapters
import { PinoLoggerAdapter, ConsoleLoggerAdapter } from '@sentzunhat/zacatl/logs';

// Configuration factories
import { createPinoConfig, createConsoleConfig } from '@sentzunhat/zacatl/logs';

// Default instances
import { pinoLogger, consoleLogger } from '@sentzunhat/zacatl/logs';
```

## Quick Start

### Use Default Logger

The default `logger` alias uses Pino for production-ready structured logging:

```typescript
import { logger } from '@sentzunhat/zacatl/logs';

logger.info('Server started', { data: { port: 3000 } });
```

### Use Provider-Specific Default Loggers

Choose between Pino (production) or Console (CLI/development) default instances:

```typescript
// Pino logger (same as default logger)
import { pinoLogger } from '@sentzunhat/zacatl/logs';
pinoLogger.info('Production-ready structured logging');

// Console logger (for CLI tools and scripts)
import { consoleLogger } from '@sentzunhat/zacatl/logs';
consoleLogger.info('Simple console output');
```

### Create Custom Logger

```typescript
import { createLogger, PinoLoggerAdapter } from '@sentzunhat/zacatl/logs';

const logger = createLogger(new PinoLoggerAdapter());
```

## One Logger for the Service and Fastify

Create the logger once and hand it to both Fastify and the Service. Fastify's
`request.log` / `reply.log` (request logs, handled route errors) and Zacatl's
own logs then go through the same logger as your app code.

```typescript
import Fastify from 'fastify';
import { createLogger, toFastifyLogger } from '@sentzunhat/zacatl/logs';
import { Service, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const logger = createLogger(); // pino by default; or createLogger(new ConsoleLoggerAdapter())
const fastify = Fastify({ loggerInstance: toFastifyLogger(logger) });

const service = new Service({
  type: ServiceType.SERVER,
  logger, // same logger the app and Fastify use
  platforms: { server: { /* ..., */ server: { vendor: ServerVendor.FASTIFY, instance: fastify } } },
  // layers, localization, ...
});

// App code uses the same logger
logger.error('Payment failed', { data: { orderId } });
```

- **Pino-backed loggers** (`createLogger()`, `createLogger(new PinoLoggerAdapter(...))`,
  the default `logger`): `toFastifyLogger` returns the real pino instance, so
  Fastify keeps pino's performance and its `req`/`res`/`err` serializers.
- **Console and custom adapters**: `toFastifyLogger` returns a bridge that
  implements Fastify's logger contract. Child bindings (such as `reqId`) and
  Fastify's serialized `req` / `res` / `err` arrive in `input.data`; Fastify's
  `debug` maps to the adapter's `trace`. Set the minimum level with
  `toFastifyLogger(logger, { level: 'warn' })` (default `info`).
- `ServiceConfig.logger` is optional and defaults to the Zacatl `logger`. The
  Service hands it to its platforms through their configs
  (`PlatformsConfig.logger`, `ServerConfig.logger`); a logger set directly on a
  platform config takes precedence.
- Fastify must receive the logger when it is created (`loggerInstance`); an
  instance created with `logger: false` stays silent.

### Custom Adapter (e.g. a SQLite or file writer)

Implement `LoggerPort` and pass it to `createLogger`; it works for app code,
the Service, and Fastify (through the bridge):

```typescript
import type { LoggerInput, LoggerPort } from '@sentzunhat/zacatl/logs';

class SqliteLogWriter implements LoggerPort {
  constructor(private readonly insert: (level: string, message: string, data: unknown) => void) {}
  log(message: string, input?: LoggerInput) { this.insert('info', message, input?.data); }
  info(message: string, input?: LoggerInput) { this.insert('info', message, input?.data); }
  trace(message: string, input?: LoggerInput) { this.insert('trace', message, input?.data); }
  warn(message: string, input?: LoggerInput) { this.insert('warn', message, input?.data); }
  error(message: string, input?: LoggerInput) { this.insert('error', message, input?.data); }
  fatal(message: string, input?: LoggerInput) { this.insert('fatal', message, input?.data); }
}

const logger = createLogger(new SqliteLogWriter(writeRow));
const fastify = Fastify({ loggerInstance: toFastifyLogger(logger) });
```

## Log Levels

```typescript
logger.info('Informational message', { data: { userId: '123' } });
logger.trace('Detailed trace info', { data: { query: 'SELECT *' } });
logger.warn('Warning message', { data: { deprecation: true } });
logger.error('Error occurred', { data: { error: err.message } });
logger.fatal('Fatal error', { data: { code: 'SYSTEM_FAILURE' } });
```

## Structured Logging

All log methods accept a message and optional structured data:

```typescript
logger.info('User created', {
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

## Module Structure

Each logger provider lives in its own folder with complete isolation:

- **`logs/pino/`** — Pino adapter, config factory, and default instance
- **`logs/console/`** — Console adapter, config factory, and default instance

All providers export the same `Logger` interface, making them interchangeable.

### Pino Adapter (Production)

High-performance JSON logging for microservices:

```typescript
import { createLogger, PinoLoggerAdapter } from '@sentzunhat/zacatl/logs';

const logger = createLogger(new PinoLoggerAdapter());
// Auto-detects: pretty in dev, JSON in production
```

Or use the default Pino logger:

```typescript
import { pinoLogger } from '@sentzunhat/zacatl/logs';

pinoLogger.info('Using default Pino instance');
```

### Console Adapter (CLI/Desktop)

Simple console output for CLI tools and desktop apps:

```typescript
import { createLogger, ConsoleLoggerAdapter } from '@sentzunhat/zacatl/logs';

const logger = createLogger(new ConsoleLoggerAdapter());
```

Or use the default Console logger:

```typescript
import { consoleLogger } from '@sentzunhat/zacatl/logs';

consoleLogger.info('Using default Console instance');
```

## Configuration

### Console Logger Configuration

```typescript
import { ConsoleLoggerAdapter, createConsoleConfig } from '@sentzunhat/zacatl/logs';

const adapter = new ConsoleLoggerAdapter(
  createConsoleConfig({
    colors: true, // Enable ANSI color codes (default: true)
    timestamps: true, // Include ISO timestamps (default: true)
  }),
);
```

### Pino Basic Configuration

```typescript (Pino)
import { createLogger, PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';

const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      serviceName: 'user-api',
      appVersion: '1.0.0',
    }),
  ),
);
```

### File Logging

```typescript
import pino from 'pino';
import { createLogger, PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';

const fileDestination = pino.destination('/var/log/app/app.log');
const logger = createLogger(new PinoLoggerAdapter(createPinoConfig(), fileDestination));
```

### Multi-Transport (Console + File - Pino)

No spread operator needed - use `pinoConfig` option:

```typescript
import { createLogger, PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';

const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      pinoConfig: {
        transport: {
          targets: [
            { target: 'pino/file', options: { destination: './app.log' } },
            { target: 'pino-pretty', options: { colorize: true } },
          ],
        },
      },
    }),
  ),
);
```

### Third-Party Services (Prometheus, Grafana, etc. - Pino)

```typescript
import { createLogger, PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';

const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      serviceName: 'my-service',
      pinoConfig: {
        transport: {
          target: 'pino/file',
          options: { destination: '/var/log/metrics.json' },
        },
        formatters: {
          log: (object) => ({
            ...object,
            labels: { service: 'my-api', env: 'production' },
          }),
        },
      },
    }),
  ),
);
```

## Environment-Aware Defaults (Pino)

`createPinoConfig()` automatically detects environment:

- **Development** (`NODE_ENV=development`): Uses `pino-pretty` for colorized console output
- **Production** (`NODE_ENV=production`): Outputs structured JSON

Override with environment variables:

- `LOG_LEVEL`: Set log level (trace, debug, info, warn, error, fatal)
- `SERVICE_NAME`: Service identifier in logs
- `APP_VERSION`: Application version in logs

- `NODE_ENV`: Node environment; used to select pretty (development) vs JSON (production) output
- `APP_ENV`: Optional environment tag included in structured logs (e.g., staging, production)

## Request Context (AsyncLocalStorage)

Opt in to automatic request-scoped fields (`requestId`, `tenantId`, `userId`) in every log
line by passing `requestContextMixin` to `PinoLoggerAdapter`:

```typescript
import { createLogger, PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';
import { requestContext, requestContextMixin } from '@sentzunhat/zacatl/logs';

// 1. Create logger with mixin — fields appear automatically when context is set
const logger = createLogger(
  new PinoLoggerAdapter({ ...createPinoConfig(), mixin: requestContextMixin }),
);

// 2. Initialize context at the platform boundary (once per request)
requestContext.run({ requestId: 'abc-123', tenantId: 'acme', userId: 'u-1' }, () => {
  // 3. Any logger call inside the async chain picks up the context
  logger.info('User action'); // → { requestId: 'abc-123', tenantId: 'acme', userId: 'u-1', ... }
});
```

All three fields are **optional strings** — only set what you have. Context is propagated
automatically across all `await` calls; no manual threading needed.

---

## Dependency Injection

### Export Pattern

Create a shared logger instance:

```typescript
// src/utils/logger.ts
import { createLogger, PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';

export const logger = createLogger(
  new PinoLoggerAdapter(
    createPinoConfig({
      serviceName: 'my-service',
    }),
  ),
);
```

Use across your application:

```typescript
import { logger } from './utils/logger';

logger.info('Application started');
```

### DI Container

```typescript
import { container, inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { LoggerInput } from '@sentzunhat/zacatl/logs';
import { createLogger, PinoLoggerAdapter } from '@sentzunhat/zacatl/logs';

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
    this.logger.info('Creating user', { data });
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
  PinoConfigOptions,
  ConsoleLoggerOptions,
} from '@sentzunhat/zacatl/logs';

// LoggerInput structure
const input: LoggerInput = {
  data: { userId: '123' },
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
