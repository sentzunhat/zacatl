# logs

Structured logging with pluggable adapters (Pino, console).

→ Full docs: ../../docs/logs/README.md

## Exports

logger, createLogger, toFastifyLogger, ConsoleLoggerAdapter, PinoLoggerAdapter, createPinoConfig

## Quick use

```typescript
import { logger } from '@sentzunhat/zacatl/logs';
logger.info('Started', { data: { port: 3000 } });
```

Share one logger with Fastify and the Service:

```typescript
const logger = createLogger();
const fastify = Fastify({ loggerInstance: toFastifyLogger(logger) });
new Service({ type: ServiceType.SERVER, logger, platforms, layers });
```
