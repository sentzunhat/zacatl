# logs

Structured logging with pluggable adapters (Pino, console).

→ Full docs: ../../docs/logs/README.md

## Exports

logger, createLogger, toFastifyLogger, LoggerToken, ConsoleLoggerAdapter, PinoLoggerAdapter, createPinoConfig

## Quick use

```typescript
import { logger } from '@sentzunhat/zacatl/logs';
logger.info('Started', { data: { port: 3000 } });
```

Share one logger with Fastify and the Service:

```typescript
const adapter = new PinoLoggerAdapter();
const logger = createLogger(adapter);
const fastify = Fastify({ loggerInstance: toFastifyLogger(adapter) });
new Service({ type: ServiceType.SERVER, logger, platforms, layers });
```

Inject it in layer classes with `@inject(LoggerToken) logger: Logger`.
