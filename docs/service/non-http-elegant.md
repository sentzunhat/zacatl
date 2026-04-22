# Zacatl for Non-HTTP Processes

Use Zacatl dependency injection helpers directly for scripts, workers, and migration jobs.

## Current Status

- Service runtime supports `ServiceType.SERVER` today.
- `ServiceType.CLI` is declared but runtime startup is not implemented.
- `ServiceType.DESKTOP` is declared but runtime startup is not implemented.
- Server Service startup currently requires both:
  - `platforms.server`
  - `layers.application.entryPoints.rest`

For non-HTTP execution today, prefer standalone DI helpers from
`@sentzunhat/zacatl/dependency-injection`.

## Recommended Pattern Today: Standalone DI

```typescript
import {
  clearContainer,
  registerDependency,
  registerValue,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import { logger } from '@sentzunhat/zacatl/logs';

const ENV_TOKEN = Symbol('ENV_CONFIG');

type EnvConfig = {
  intervalMs: number;
  dryRun: boolean;
};

@singleton()
class Clock {
  now = (): Date => new Date();
}

@singleton()
class WorkerService {
  constructor(private readonly clock: Clock, @inject(ENV_TOKEN) private readonly env: EnvConfig) {}

  runOnce = async (): Promise<void> => {
    logger.info('worker tick', {
      at: this.clock.now().toISOString(),
      dryRun: this.env.dryRun,
    });
  };
}

clearContainer();
registerDependency(Clock, Clock);
registerDependency(WorkerService, WorkerService);
registerValue(ENV_TOKEN, { intervalMs: 1000, dryRun: true });

const worker = resolveDependency(WorkerService);
await worker.runOnce();
```

## Minimal Setup

```typescript
import { registerDependency, resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

@singleton()
class Calculator {
  add = (a: number, b: number): number => a + b;
}

registerDependency(Calculator, Calculator);

const calculator = resolveDependency(Calculator);
console.log(calculator.add(2, 3));
```

## Registering Classes

```typescript
import { registerDependencies, resolveDependencies } from '@sentzunhat/zacatl/dependency-injection';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

@singleton()
class UserRepository {
  findById = async (id: string): Promise<{ id: string; email: string } | null> => {
    return { id, email: 'user@example.com' };
  };
}

@singleton()
class UserNotifier {
  constructor(private readonly users: UserRepository) {}

  notify = async (id: string): Promise<void> => {
    const user = await this.users.findById(id);
    if (user != null) {
      console.log(`Notified ${user.email}`);
    }
  };
}

registerDependencies([UserRepository, UserNotifier]);

const [notifier] = resolveDependencies([UserNotifier]);
await notifier.notify('42');
```

## Registering Values and Config Objects

```typescript
import { loadYML } from '@sentzunhat/zacatl/configuration';
import {
  registerDependency,
  registerValue,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

const APP_CONFIG = Symbol('APP_CONFIG');

type AppConfig = {
  retries: number;
  queueName: string;
};

const config = loadYML<AppConfig>('./config.worker.yml');

@singleton()
class QueueJob {
  constructor(@inject(APP_CONFIG) private readonly appConfig: AppConfig) {}

  describe = (): string => `${this.appConfig.queueName}:${this.appConfig.retries}`;
}

registerDependency(QueueJob, QueueJob);
registerValue(APP_CONFIG, config);

const job = resolveDependency(QueueJob);
console.log(job.describe());
```

## Background Worker Example

```typescript
import {
  registerDependency,
  registerValue,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { InternalServerError } from '@sentzunhat/zacatl/error';
import { logger } from '@sentzunhat/zacatl/logs';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

const WORKER_OPTIONS = Symbol('WORKER_OPTIONS');

type WorkerOptions = {
  delayMs: number;
};

@singleton()
class JobRunner {
  constructor(@inject(WORKER_OPTIONS) private readonly options: WorkerOptions) {}

  start = async (): Promise<void> => {
    for (;;) {
      try {
        logger.info('polling job queue');
        await new Promise((resolve) => setTimeout(resolve, this.options.delayMs));
      } catch (error) {
        throw new InternalServerError({
          message: 'Worker loop failed',
          reason: error instanceof Error ? error.message : String(error),
          component: 'JobRunner',
          operation: 'start',
          error: error instanceof Error ? error : undefined,
        });
      }
    }
  };
}

registerDependency(JobRunner, JobRunner);
registerValue(WORKER_OPTIONS, { delayMs: 5000 });

const runner = resolveDependency(JobRunner);
await runner.start();
```

## Migration or Script Example

```typescript
import {
  clearContainer,
  registerDependency,
  resolveDependency,
} from '@sentzunhat/zacatl/dependency-injection';
import { logger } from '@sentzunhat/zacatl/logs';
import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';

@singleton()
class LegacyReader {
  fetch = async (): Promise<Array<{ id: string; oldName: string }>> => {
    return [{ id: '1', oldName: 'legacy' }];
  };
}

@singleton()
class MigrationService {
  constructor(private readonly legacyReader: LegacyReader) {}

  run = async (): Promise<void> => {
    const rows = await this.legacyReader.fetch();
    logger.info('migration finished', { count: rows.length });
  };
}

const main = async (): Promise<void> => {
  clearContainer();
  registerDependency(LegacyReader, LegacyReader);
  registerDependency(MigrationService, MigrationService);

  const migration = resolveDependency(MigrationService);
  await migration.run();
};

await main();
```

## When To Use Service Later

Use `Service` for non-HTTP orchestration only after CLI/Desktop runtimes are implemented.

Until then:

- Use standalone DI helpers for local scripts and workers.
- Keep Service usage focused on `ServiceType.SERVER` with REST entry points.
- Do not treat `ServiceType.CLI` as runnable in production yet.
