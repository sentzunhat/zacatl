import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import type { MongooseRepositoryModel } from '../../repositories/mongoose/types';

export type MongooseIndexBootMode = 'off' | 'create' | 'sync';

export interface MongooseRepositoryIndexOptions {
  /**
   * Controls what Zacatl does with declared Mongoose indexes during repository
   * readiness.
   *
   * - `off`: resolve/register models only; do not mutate indexes.
   * - `create`: create collections and missing declared indexes; do not drop.
   * - `sync`: create missing indexes and drop undeclared indexes; explicit opt-in.
   */
  readonly bootMode?: MongooseIndexBootMode;
}

const MONGOOSE_DEFAULT_CONNECTION_NAME = 'MONGOOSE';
const normalizeConnectionName = (connectionName?: string): string =>
  connectionName == null || connectionName.length === 0
    ? MONGOOSE_DEFAULT_CONNECTION_NAME
    : connectionName;

const normalizeEnvironment = (): string => {
  const appEnv = process.env['APP_ENV']?.trim().toLowerCase();
  if (appEnv != null && appEnv.length > 0) return appEnv;

  const nodeEnv = process.env['NODE_ENV']?.trim().toLowerCase();
  return nodeEnv != null && nodeEnv.length > 0 ? nodeEnv : 'development';
};

export const getDefaultMongooseIndexBootMode = (): MongooseIndexBootMode => {
  const environment = normalizeEnvironment();

  if (environment === 'production' || environment === 'prod' || environment === 'staging') {
    return 'off';
  }

  return 'create';
};

/** Index options and models owned by one Service or by standalone callers. */
export class MongooseIndexRegistry {
  private readonly indexOptionsByConnection = new Map<string, MongooseRepositoryIndexOptions>();
  private readonly modelsByConnection = new Map<string, Map<string, MongooseRepositoryModel<unknown>>>();

  registerOptions(
    connectionName: string | undefined,
    options: MongooseRepositoryIndexOptions | undefined,
  ): void {
    if (options == null) return;
    this.indexOptionsByConnection.set(normalizeConnectionName(connectionName), options);
  }

  unregisterOptions(connectionName: string | undefined): void {
    this.indexOptionsByConnection.delete(normalizeConnectionName(connectionName));
  }

  getOptions(connectionName: string | undefined): Required<MongooseRepositoryIndexOptions> {
    const configured = this.indexOptionsByConnection.get(normalizeConnectionName(connectionName));
    return { bootMode: configured?.bootMode ?? getDefaultMongooseIndexBootMode() };
  }

  registerModel(
    connectionName: string | undefined,
    model: MongooseRepositoryModel<unknown>,
  ): void {
    const normalized = normalizeConnectionName(connectionName);
    const models = this.modelsByConnection.get(normalized) ?? new Map();
    models.set(model.modelName, model);
    this.modelsByConnection.set(normalized, models);
  }

  getModels(connectionName?: string): MongooseRepositoryModel<unknown>[] {
    const models = this.modelsByConnection.get(normalizeConnectionName(connectionName));
    return models == null ? [] : Array.from(models.values());
  }

  clear(): void {
    this.indexOptionsByConnection.clear();
    this.modelsByConnection.clear();
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const MongooseIndexRegistryToken: InjectionToken<MongooseIndexRegistry> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/infrastructure/orm/mongoose/index-registry',
);

/** Standalone/manual adapter compatibility; Service creates its own registry. */
export const globalMongooseIndexRegistry = new MongooseIndexRegistry();

export const registerMongooseIndexOptions = (
  connectionName: string | undefined,
  options: MongooseRepositoryIndexOptions | undefined,
): void => globalMongooseIndexRegistry.registerOptions(connectionName, options);

export const unregisterMongooseIndexOptions = (connectionName: string | undefined): void =>
  globalMongooseIndexRegistry.unregisterOptions(connectionName);

export const getMongooseIndexOptions = (
  connectionName: string | undefined,
): Required<MongooseRepositoryIndexOptions> =>
  globalMongooseIndexRegistry.getOptions(connectionName);

export const registerMongooseIndexModel = (
  connectionName: string | undefined,
  model: MongooseRepositoryModel<unknown>,
): void => globalMongooseIndexRegistry.registerModel(connectionName, model);

export const getMongooseIndexModels = (connectionName?: string): MongooseRepositoryModel<unknown>[] =>
  globalMongooseIndexRegistry.getModels(connectionName);

export const clearMongooseIndexRegistry = (): void => globalMongooseIndexRegistry.clear();
