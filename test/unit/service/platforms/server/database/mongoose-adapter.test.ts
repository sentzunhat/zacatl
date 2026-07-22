import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  clearMongooseIndexRegistry,
  registerMongooseIndexOptions,
} from '../../../../../../src/service/layers/infrastructure/orm/mongoose/index-policy';
import { MongooseAdapter } from '../../../../../../src/service/platforms/server/database/adapters/mongoose';
import {
  DatabaseVendor,
  type DatabaseConfig,
} from '../../../../../../src/service/platforms/server/database/port';

interface MockMongooseInstance {
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

const makeConfig = (
  indexes?: DatabaseConfig['indexes'],
): { config: DatabaseConfig; mongoose: MockMongooseInstance } => {
  const mongoose: MockMongooseInstance = {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
  };
  const config: DatabaseConfig = {
    vendor: DatabaseVendor.MONGOOSE,
    connection: { url: 'mongodb://localhost/zacatl_test' },
    instance: mongoose as never,
  };

  if (indexes != null) {
    config.indexes = indexes;
  }

  return { config, mongoose };
};

describe('Mongoose database adapter', () => {
  beforeEach(() => {
    clearMongooseIndexRegistry();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearMongooseIndexRegistry();
    vi.unstubAllEnvs();
  });

  it('connects with autoIndex and autoCreate disabled when bootMode is off', async () => {
    const { config, mongoose } = makeConfig({ bootMode: 'off' });
    const adapter = new MongooseAdapter();

    await adapter.connect('svc', config);

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost/zacatl_test', {
      dbName: 'zacatl_test',
      autoIndex: false,
      autoCreate: false,
    });
  });

  it('connects with autoIndex and autoCreate enabled when bootMode is create', async () => {
    const { config, mongoose } = makeConfig({ bootMode: 'create' });
    const adapter = new MongooseAdapter();

    await adapter.connect('svc', config);

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost/zacatl_test', {
      dbName: 'zacatl_test',
      autoIndex: true,
      autoCreate: true,
    });
  });

  it('uses the environment-aware default policy when indexes are omitted', async () => {
    registerMongooseIndexOptions(undefined, undefined);
    vi.stubEnv('APP_ENV', 'production');

    const { config, mongoose } = makeConfig();
    const adapter = new MongooseAdapter();

    await adapter.connect('svc', config);

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost/zacatl_test', {
      dbName: 'zacatl_test',
      autoIndex: false,
      autoCreate: false,
    });
  });
});
