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
const indexOptionsByConnection = new Map<string, MongooseRepositoryIndexOptions>();
const modelsByConnection = new Map<string, Map<string, MongooseRepositoryModel<unknown>>>();

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

export const registerMongooseIndexOptions = (
  connectionName: string | undefined,
  options: MongooseRepositoryIndexOptions | undefined,
): void => {
  const normalizedConnectionName = normalizeConnectionName(connectionName);

  if (options == null || options.bootMode == null) {
    indexOptionsByConnection.delete(normalizedConnectionName);
    return;
  }

  indexOptionsByConnection.set(normalizedConnectionName, options);
};

export const getMongooseIndexOptions = (
  connectionName: string | undefined,
): Required<MongooseRepositoryIndexOptions> => {
  const configured = indexOptionsByConnection.get(normalizeConnectionName(connectionName));

  return {
    bootMode: configured?.bootMode ?? getDefaultMongooseIndexBootMode(),
  };
};

export const registerMongooseIndexModel = (
  connectionName: string | undefined,
  model: MongooseRepositoryModel<unknown>,
): void => {
  const normalizedConnectionName = normalizeConnectionName(connectionName);
  const models = modelsByConnection.get(normalizedConnectionName) ?? new Map();

  models.set(model.modelName, model);
  modelsByConnection.set(normalizedConnectionName, models);
};

export const getMongooseIndexModels = (
  connectionName?: string,
): MongooseRepositoryModel<unknown>[] => {
  const models = modelsByConnection.get(normalizeConnectionName(connectionName));
  return models == null ? [] : Array.from(models.values());
};

export const clearMongooseIndexRegistry = (): void => {
  indexOptionsByConnection.clear();
  modelsByConnection.clear();
};
