import { getContainer, registerValue } from '@zacatl/dependency-injection';
import { InternalServerError } from '@zacatl/error';
import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { type DatabaseVendor, type DatabaseInstance } from './port';
import { createDatabaseToken } from '../../../layers/infrastructure/orm/tokens/factory';

export { createDatabaseToken } from '../../../layers/infrastructure/orm/tokens/factory';

/**
 * ORM instance helper shared by database adapters and service bootstrap.
 *
 * `registerOrmInstance` binds a running database instance to a provider-specific
 * token in the DI container. `getOrmInstance` resolves that instance later
 * from repository or adapter code using the same token.
 */
export const getOrmInstance = <T>(token: InjectionToken<unknown>): T => {
  const container = getContainer();
  const typedToken = token as InjectionToken<T>;

  if (!container.isRegistered(typedToken)) {
    throw new InternalServerError({
      message: 'ORM instance not registered',
      reason: 'The ORM token has not been bound to a database instance in the DI container.',
      component: 'OrmRegistration',
      operation: 'getOrmInstance',
      metadata: { token: String(token) },
    });
  }

  return container.resolve(typedToken);
};

export const registerOrmInstance = (
  vendor: DatabaseVendor,
  connection: { url: string; name?: string } | undefined,
  instance: DatabaseInstance | undefined,
): void => {
  if (instance == null) {
    return;
  }

  // Repositories resolve the unnamed default connection by vendor. A URL is
  // not a stable public connection name and would make default registrations
  // impossible to resolve (for example, `:memory:` versus `SQLITE`).
  const tokenKey = connection?.name ?? vendor;
  const token = createDatabaseToken(vendor, tokenKey);

  registerValue(token as InjectionToken<DatabaseInstance>, instance);
};
