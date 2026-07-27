import type { Mongoose } from 'mongoose';

import { CustomError } from '@zacatl/error';

import {
  getMongooseIndexOptions,
  registerMongooseIndexOptions,
} from '../../../../layers/infrastructure/orm/mongoose/index-policy';
import { registerOrmInstance } from '../orm-instance';
import { DatabaseVendor, type DatabaseServerPort, type DatabaseConfig } from '../port';

export class MongooseAdapter implements DatabaseServerPort {
  private mongooseInstance: Mongoose | null = null;

  async connect(serviceName: string, config: DatabaseConfig): Promise<void> {
    const { instance, connection, onDatabaseConnected } = config;

    const getMongoDbName = (uri: string): string | undefined => {
      const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)(\?|$)/);
      return match?.[1] != null ? decodeURIComponent(match[1]) : undefined;
    };

    const mongoose = instance as Mongoose;

    if (mongoose == null || typeof mongoose.connect !== 'function') {
      throw new CustomError({
        message: 'database instance is not provided',
        code: 500,
        reason: 'database instance not provided',
      });
    }

    const dbName = getMongoDbName(connection.url) ?? serviceName;
    registerMongooseIndexOptions(connection.name, config.indexes);

    const { bootMode } = getMongooseIndexOptions(connection.name);
    const shouldAutoManageIndexes = bootMode === 'create' || bootMode === 'sync';

    await mongoose.connect(connection.url, {
      dbName,
      autoIndex: shouldAutoManageIndexes,
      autoCreate: shouldAutoManageIndexes,
    });

    if (onDatabaseConnected != null) {
      await onDatabaseConnected(mongoose);
    }

    this.mongooseInstance = mongoose;
    registerOrmInstance(DatabaseVendor.MONGOOSE, connection, mongoose);
  }

  async disconnect(): Promise<void> {
    await this.mongooseInstance?.disconnect();
  }
}
