import { AsyncLocalStorage } from 'node:async_hooks';

import { getContainer } from '@zacatl/third-party/dependency-injection';
import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';


// Consumer repositories usually call super(config) with no container argument.
// Capture their owning Infrastructure scope only while DI constructs them; ORM
// adapters retain that scope for later model/connection resolution. Standalone
// layer composition uses the global container as its explicit registration source.
const constructionScope = new AsyncLocalStorage<DependencyContainer>();

export const withOrmConstructionScope = <T>(
  container: DependencyContainer,
  construct: () => T,
): T => constructionScope.run(container, construct);

/** Scope explicitly chosen by an enclosing composition boundary, if any. */
export const getActiveOrmConstructionScope = (): DependencyContainer | undefined =>
  constructionScope.getStore();

export const getOrmConstructionScope = (): DependencyContainer =>
  constructionScope.getStore() ?? getContainer();
