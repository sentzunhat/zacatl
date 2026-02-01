# Logging API

Structured logging with Pino adapter.

## Import

```typescript
import { createLogger } from "@sentzunhat/zacatl";
import { PinoAdapter } from "@sentzunhat/zacatl/logs/adapters";
```

## Create Logger

```typescript
const logger = createLogger(new PinoAdapter());
```

## Log Levels

```typescript
logger.info("Server started", { port: 3000 });
logger.debug("Debug information", { userId: "123" });
logger.warn("Warning message", { deprecation: true });
logger.error("Error occurred", { error: err });
```

## Structured Logging

```typescript
logger.info("User created", {
  userId: user.id,
  email: user.email,
  timestamp: new Date(),
});
```

## Configuration

```typescript
import pino from "pino";

const pinoInstance = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

const logger = createLogger(new PinoAdapter(pinoInstance));
```

## Child Loggers

```typescript
const childLogger = logger.child({ module: "UserService" });

childLogger.info("User operation", { action: "create" });
// Output: { module: "UserService", action: "create", ... }
```

---

**Next**: [i18n →](./i18n.md)
