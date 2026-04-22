# Non-HTTP Setup (Current Support)

This guide is the recommended setup for non-HTTP processes in Zacatl today.

## What Is Supported Today

- Supported now: standalone dependency injection helpers from
  `@sentzunhat/zacatl/dependency-injection`.
- Declared but not runnable yet: `ServiceType.CLI` and `ServiceType.DESKTOP`.
- Not part of the current API: `ServiceType.WORKER`.
- `ServiceType.SERVER` startup currently requires:
  - `platforms.server`
  - `layers.application.entryPoints.rest`

For scripts, workers, migrations, and one-off jobs, use DI helpers directly.

## Standalone DI Quick Start

```typescript
import {
  clearContainer,
  registerDependency,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

@singleton()
class GreetingService {
  greet = (name: string): string => `Hello, ${name}`;
}

clearContainer();
registerDependency(GreetingService, GreetingService);

const greetingService = resolveDependency(GreetingService);
console.log(greetingService.greet('Zacatl'));
```

## Constructor Injection Example

```typescript
import { registerDependencies, resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

@singleton()
class UserRepository {
  findById = async (id: string): Promise<{ id: string; email: string }> => {
    return { id, email: 'alice@example.com' };
  };
}

@singleton()
class NotificationService {
  constructor(private readonly users: UserRepository) {}

  sendWelcome = async (id: string): Promise<void> => {
    const user = await this.users.findById(id);
    console.log(`Welcome sent to ${user.email}`);
  };
}

registerDependencies([UserRepository, NotificationService]);

const notifications = resolveDependency(NotificationService);
await notifications.sendWelcome('user-1');
```

## RegisterValue for Config and Env Objects

```typescript
import {
  registerDependency,
  registerValue,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { loadYML } from '@sentzunhat/zacatl/configuration';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

const ENV_TOKEN = Symbol('ENV_TOKEN');

type EnvConfig = {
  queueName: string;
  maxRetries: number;
};

@singleton()
class QueueProcessor {
  constructor(@inject(ENV_TOKEN) private readonly env: EnvConfig) {}

  inspect = (): string => `${this.env.queueName}:${this.env.maxRetries}`;
}

const envConfig = loadYML<EnvConfig>('./worker.yml');
registerDependency(QueueProcessor, QueueProcessor);
registerValue(ENV_TOKEN, envConfig);

const processor = resolveDependency(QueueProcessor);
console.log(processor.inspect());
```

## Worker Loop Example

```typescript
import {
  registerDependency,
  registerValue,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { InternalServerError } from '@sentzunhat/zacatl/error';
import { logger } from '@sentzunhat/zacatl/logs';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

const WORKER_INTERVAL = Symbol('WORKER_INTERVAL');

@singleton()
class EmailWorker {
  constructor(@inject(WORKER_INTERVAL) private readonly intervalMs: number) {}

  processQueue = async (): Promise<void> => {
    for (;;) {
      try {
        logger.info('email worker polling');
        await new Promise((resolve) => setTimeout(resolve, this.intervalMs));
      } catch (error) {
        throw new InternalServerError({
          message: 'Email worker failed',
          reason: error instanceof Error ? error.message : String(error),
          component: 'EmailWorker',
          operation: 'processQueue',
          error: error instanceof Error ? error : undefined,
        });
      }
    }
  };
}

registerDependency(EmailWorker, EmailWorker);
registerValue(WORKER_INTERVAL, 3000);

const worker = resolveDependency(EmailWorker);
await worker.processQueue();
```

## Migration Script Example

```typescript
import {
  clearContainer,
  registerDependencies,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { logger } from '@sentzunhat/zacatl/logs';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

@singleton()
class SourceRepository {
  readAll = async (): Promise<Array<{ id: string; oldValue: string }>> => {
    return [{ id: '1', oldValue: 'legacy-value' }];
  };
}

@singleton()
class DestinationRepository {
  writeMany = async (rows: Array<{ id: string; newValue: string }>): Promise<void> => {
    logger.info('rows written', { count: rows.length });
  };
}

@singleton()
class MigrationRunner {
  constructor(
    private readonly source: SourceRepository,
    private readonly destination: DestinationRepository,
  ) {}

  run = async (): Promise<void> => {
    const rows = await this.source.readAll();
    await this.destination.writeMany(rows.map((row) => ({ id: row.id, newValue: row.oldValue })));
  };
}

const main = async (): Promise<void> => {
  clearContainer();
  registerDependencies([SourceRepository, DestinationRepository, MigrationRunner]);

  const migration = resolveDependency(MigrationRunner);
  await migration.run();
};

await main();
```

## Troubleshooting

- `TypeInfo not known for X`:
  - Ensure `reflect-metadata` support is present through Zacatl imports.
  - Ensure classes use `@singleton()` (or compatible injectable decorators).
- `Failed to resolve ... from the DI container`:
  - Register the class with `registerDependency` or `registerDependencies` before resolving.
  - Prefer class tokens in `resolveDependency(MyClass)` for type safety.
- Import path errors:
  - Use published paths for this workflow:
    - `@sentzunhat/zacatl/dependency-injection`
    - `@sentzunhat/zacatl/configuration`
    - `@sentzunhat/zacatl/error`
    - `@sentzunhat/zacatl/logs`
- Confusion about Service runtimes:
  - `ServiceType.CLI` and `ServiceType.DESKTOP` are declared, not runnable yet.
  - `ServiceType.WORKER` is not available in the current API.
