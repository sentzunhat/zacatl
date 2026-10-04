import { DatabaseSync } from 'node:sqlite';

import fastify from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getContainer } from '../../../src/dependency-injection/container';
import { createDatabaseToken } from '../../../src/service/layers/infrastructure/orm/tokens/factory';
import { BaseRepository as MongooseRepository } from '../../../src/service/layers/infrastructure/repositories/mongoose/repository';
import { BaseRepository } from '../../../src/service/layers/infrastructure/repositories/nodesqlite/repository';
import { BaseRepository as SequelizeRepository } from '../../../src/service/layers/infrastructure/repositories/sequelize/repository';
import { DatabaseVendor } from '../../../src/service/platforms/server/database/port';
import {
  ServerType,
  ServerVendor,
} from '../../../src/service/platforms/server/types/server-config';
import { Service } from '../../../src/service/service';
import { ServiceType, type ServiceConfig } from '../../../src/service/types';
import { Mongoose, Schema } from '../../../src/third-party/databases/mongoose';
import { injectable } from '../../../src/third-party/dependency-injection/tsyringe';

interface Input {
  label: string;
}

interface Output extends Input {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const repositories: ScopedRepository[] = [];
const mongooseRepositories: ScopedMongooseRepository[] = [];
const sequelizeRepositories: ScopedSequelizeRepository[] = [];
const connectionName = 'service-orm-scope-review';
const mongooseSchema = new Schema<Input>({ label: String });

@injectable()
class ScopedRepository extends BaseRepository<Input, Output> {
  constructor() {
    super({ name: 'review_items', connection: { name: connectionName } });
    repositories.push(this);
  }
}

@injectable()
class ScopedMongooseRepository extends MongooseRepository<Input, Input, Output> {
  constructor() {
    super({ name: 'ReviewDocument', schema: mongooseSchema, connection: { name: connectionName } });
    mongooseRepositories.push(this);
  }
}

@injectable()
class ScopedSequelizeRepository extends SequelizeRepository<Input, Input, Output> {
  constructor() {
    super({ name: 'ReviewDocument', connection: { name: connectionName } });
    sequelizeRepositories.push(this);
  }
}

const makeService = (instance?: DatabaseSync): Service => {
  const config: ServiceConfig = {
    type: ServiceType.SERVER,
    layers: {
      application: { entryPoints: { rest: { routes: [] } } },
      infrastructure: { repositories: [ScopedRepository] },
    },
    platforms: {
      server: {
        name: 'scope-review',
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify(),
        },
        databases: [{
          vendor: DatabaseVendor.SQLITE,
          connection: { url: ':memory:', name: connectionName },
          ...(instance != null ? { instance } : {}),
        }],
      },
    },
    run: { auto: false },
  };
  return new Service(config);
};

const makeOtherService = (
  vendor: DatabaseVendor.MONGOOSE | DatabaseVendor.SEQUELIZE,
  instance: object,
  repository: typeof ScopedMongooseRepository | typeof ScopedSequelizeRepository,
): Service => new Service({
  type: ServiceType.SERVER,
  layers: {
    application: { entryPoints: { rest: { routes: [] } } },
    infrastructure: { repositories: [repository] as never },
  },
  platforms: {
    server: {
      name: 'scope-review',
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify() },
      databases: [{
        vendor,
        connection: { url: 'mongodb://localhost/review', name: connectionName },
        instance: instance as never,
        ...(vendor === DatabaseVendor.MONGOOSE ? { indexes: { bootMode: 'off' as const } } : {}),
      }],
    },
  },
  run: { auto: false },
});

describe('Service-owned ORM scopes', () => {
  afterEach(() => {
    repositories.splice(0);
    mongooseRepositories.splice(0);
    sequelizeRepositories.splice(0);
  });

  it('keeps supplied same-name SQLite instances in their own repositories', () => {
    const firstDatabase = new DatabaseSync(':memory:');
    const secondDatabase = new DatabaseSync(':memory:');
    try {
      makeService(firstDatabase);
      makeService(secondDatabase);

      expect(repositories).toHaveLength(2);
      expect(repositories[0]?.model).toBe(firstDatabase);
      expect(repositories[1]?.model).toBe(secondDatabase);
      expect(getContainer().isRegistered(createDatabaseToken('SQLITE', connectionName), false))
        .toBe(false);
    } finally {
      firstDatabase.close();
      secondDatabase.close();
    }
  });

  it('binds databases opened during preparation to the owning Service', async () => {
    const firstService = makeService();
    const secondService = makeService();

    try {
      await firstService.start({ host: '127.0.0.1', port: 0 });
      await secondService.start({ host: '127.0.0.1', port: 0 });

      expect(repositories).toHaveLength(2);
      expect(repositories[0]?.model).not.toBe(repositories[1]?.model);
      expect(getContainer().isRegistered(createDatabaseToken('SQLITE', connectionName), false))
        .toBe(false);
    } finally {
      await firstService.stop();
      await secondService.stop();
    }
  });

  it('keeps same-name Mongoose models and index managers with their Service', async () => {
    const firstMongoose = new Mongoose();
    const secondMongoose = new Mongoose();
    const firstService = makeOtherService(
      DatabaseVendor.MONGOOSE, firstMongoose, ScopedMongooseRepository,
    );
    const secondService = makeOtherService(
      DatabaseVendor.MONGOOSE, secondMongoose, ScopedMongooseRepository,
    );

    const firstModel = mongooseRepositories[0]?.model;
    const secondModel = mongooseRepositories[1]?.model;
    expect(firstModel).toBe(firstMongoose.models['ReviewDocument']);
    expect(secondModel).toBe(secondMongoose.models['ReviewDocument']);
    expect(firstModel).not.toBe(secondModel);
    if (firstModel == null || secondModel == null) {
      throw new Error('Both Service-owned Mongoose models must be registered');
    }
    const firstDiff = vi.spyOn(firstModel, 'diffIndexes').mockResolvedValue({ toCreate: [], toDrop: [] });
    const secondDiff = vi.spyOn(secondModel, 'diffIndexes').mockResolvedValue({ toCreate: [], toDrop: [] });

    await mongooseRepositories[0]?.ready();
    await mongooseRepositories[1]?.ready();
    await firstService.getMongooseIndexManager(connectionName).diff();
    expect(firstDiff).toHaveBeenCalledOnce();
    expect(secondDiff).not.toHaveBeenCalled();
    await secondService.getMongooseIndexManager(connectionName).diff();
    expect(secondDiff).toHaveBeenCalledOnce();
  });

  it('keeps same-name Sequelize models with their Service', () => {
    const firstModel = { source: 'first' };
    const secondModel = { source: 'second' };
    makeOtherService(
      DatabaseVendor.SEQUELIZE,
      { model: () => firstModel },
      ScopedSequelizeRepository,
    );
    makeOtherService(
      DatabaseVendor.SEQUELIZE,
      { model: () => secondModel },
      ScopedSequelizeRepository,
    );

    expect(sequelizeRepositories[0]?.model).toBe(firstModel);
    expect(sequelizeRepositories[1]?.model).toBe(secondModel);
  });
});
