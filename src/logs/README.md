# logs

Structured logging with pluggable adapters (Pino, console).

→ Full docs: ../../docs/logs/README.md

## Exports

logger, createLogger, ConsoleLoggerAdapter, PinoLoggerAdapter, createPinoConfig

## Quick use

```typescript
import { logger } from "@sentzunhat/zacatl/logs";
logger.info("Started", { port: 3000 });
```
