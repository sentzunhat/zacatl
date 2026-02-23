import type { Sequelize } from 'sequelize';

import { CustomError } from '@zacatl/error';

import type { DatabaseServerPort, DatabaseConfig } from './port';
import { getContainer } from '../../../../dependency-injection/container';

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
      await onDatabaseConnected(instance);
    }

    getContainer().register<Sequelize>(sequelize.constructor.name, {
      useValue: sequelize,
    });
  }

  async disconnect(): Promise<void> {
    // Implement disconnect if needed
  }
}
