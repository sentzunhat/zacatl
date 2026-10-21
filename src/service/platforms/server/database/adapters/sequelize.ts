import type { Sequelize } from 'sequelize';

import { CustomError } from '@zacatl/error';
import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';


import { registerOrmInstance } from '../orm-instance';
import { DatabaseVendor, type DatabaseServerPort, type DatabaseConfig } from '../port';

export class SequelizeAdapter implements DatabaseServerPort {
  private sequelizeInstance: Sequelize | null = null;

  async connect(
    _serviceName: string,
    config: DatabaseConfig,
    container?: DependencyContainer,
  ): Promise<void> {
    const { instance, connection, onDatabaseConnected } = config;
    const sequelize = instance as Sequelize;

    if (sequelize == null || typeof sequelize.authenticate !== 'function') {
      throw new CustomError({
        message: 'database instance is not provided or invalid',
        code: 500,
        reason: 'database instance not provided',
      });
    }

    await sequelize.authenticate();

    // Retain the live instance before user setup can reject so the owning
    // DatabaseServer can release it during failed startup cleanup.
    this.sequelizeInstance = sequelize;

    if (onDatabaseConnected != null) {
      await onDatabaseConnected(sequelize);
    }

    registerOrmInstance(DatabaseVendor.SEQUELIZE, connection, sequelize, container);
  }

  async disconnect(): Promise<void> {
    await this.sequelizeInstance?.close();
  }
}
