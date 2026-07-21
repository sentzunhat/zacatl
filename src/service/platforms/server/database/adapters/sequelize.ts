import type { Sequelize } from 'sequelize';

import { CustomError } from '@zacatl/error';

import { registerOrmInstance } from '../orm-instance';
import { DatabaseVendor, type DatabaseServerPort, type DatabaseConfig } from '../port';

export class SequelizeAdapter implements DatabaseServerPort {
  private sequelizeInstance: Sequelize | null = null;

  async connect(_serviceName: string, config: DatabaseConfig): Promise<void> {
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

    if (onDatabaseConnected != null) {
      await onDatabaseConnected(sequelize);
    }

    this.sequelizeInstance = sequelize;
    registerOrmInstance(DatabaseVendor.SEQUELIZE, connection, sequelize);
  }

  async disconnect(): Promise<void> {
    await this.sequelizeInstance?.close();
  }
}
