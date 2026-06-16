import type { Sequelize } from 'sequelize';

import { CustomError } from '@zacatl/error';

import { registerOrmInstance } from '../orm-instance';
import { DatabaseVendor, type DatabaseServerPort, type DatabaseConfig } from '../port';

export class SequelizeAdapter implements DatabaseServerPort {
  async connect(_serviceName: string, config: DatabaseConfig): Promise<void> {
    const { instance, onDatabaseConnected } = config;
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

    registerOrmInstance(DatabaseVendor.SEQUELIZE, sequelize);
  }

  async disconnect(): Promise<void> {
    // Implement disconnect if needed
  }
}
