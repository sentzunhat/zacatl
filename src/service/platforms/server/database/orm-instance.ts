import { getContainer, registerValue } from '@zacatl/dependency-injection';
import { InternalServerError } from '@zacatl/error';
import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { DatabaseVendor, type DatabaseInstance } from './port';
import { MongooseToken } from '../../../layers/infrastructure/orm/tokens/mongoose';
import { NodeSqliteToken } from '../../../layers/infrastructure/orm/tokens/nodesqlite';
import { SequelizeToken } from '../../../layers/infrastructure/orm/tokens/sequelize';

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
  instance: DatabaseInstance | undefined,
): void => {
  if (instance == null) {
    return;
  }

  switch (vendor) {
    case DatabaseVendor.MONGOOSE:
      registerValue(MongooseToken as InjectionToken<DatabaseInstance>, instance);
      break;
    case DatabaseVendor.SEQUELIZE:
      registerValue(SequelizeToken as InjectionToken<DatabaseInstance>, instance);
      break;
    case DatabaseVendor.SQLITE:
      registerValue(NodeSqliteToken as InjectionToken<DatabaseInstance>, instance);
      break;
    default:
      break;
  }
};
