import { AsyncLocalStorage } from 'node:async_hooks';

import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';

import { getContainer } from '../../../../dependency-injection/container';

// Consumer repositories usually call super(config) with no container argument.
// Capture their owning Infrastructure scope only while DI constructs them; ORM
// adapters retain that scope for later model/connection resolution. Direct
// construction outside a Service keeps the legacy global-container behavior.
const constructionScope = new AsyncLocalStorage<DependencyContainer>();

export const withOrmConstructionScope = <T>(
  container: DependencyContainer,
  construct: () => T,
): T => constructionScope.run(container, construct);

export const getOrmConstructionScope = (): DependencyContainer =>
  constructionScope.getStore() ?? getContainer();
