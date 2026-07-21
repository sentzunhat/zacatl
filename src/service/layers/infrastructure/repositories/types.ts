import type { MongooseBaseRepositoryConfig, MongooseRepositoryModel } from './mongoose/types';
import type { NodeSqliteBaseRepositoryConfig, NodeSqliteRepositoryModel } from './nodesqlite/types';
import type { SequelizeBaseRepositoryConfig, SequelizeRepositoryModel } from './sequelize/types';

export type BaseRepositoryConfig<D extends object = object> =
  | MongooseBaseRepositoryConfig<D>
  | SequelizeBaseRepositoryConfig
  | NodeSqliteBaseRepositoryConfig;

/** Query pagination options */
export interface QueryOptions {
  limit?: number;
  offset?: number;
}

/** Default maximum limit to prevent unbounded queries */
export const DEFAULT_QUERY_LIMIT = 20;

/** ORM adapter interface - implemented by Mongoose, Sequelize, and node:sqlite adapters */
export interface ORMPort<
  ModelType = unknown,
  InputType = unknown,
  OutputType = unknown,
  FilterType = Record<string, unknown>,
> {
  readonly model: ModelType;
  ready(): Promise<void>;
  findById(id: string): Promise<OutputType | null>;
  findMany(filter?: FilterType, options?: QueryOptions): Promise<OutputType[]>;
  create(entity: InputType): Promise<OutputType>;
  update(
    id: string,
    update: Partial<InputType>,
    options?: {
      raw?: boolean;
    },
  ): Promise<OutputType | null>;
  delete(id: string): Promise<OutputType | null>;
  exists(id: string): Promise<boolean>;
  toLean(input: unknown): OutputType | null;
}

/**
 * Repository contract - public interface for consumers
 * Implemented by BaseRepository with ORM adapters
 */
export interface RepositoryPort<
  ModelType = unknown,
  InputType = unknown,
  OutputType = unknown,
  FilterType = Record<string, unknown>,
> {
  readonly model: ModelType;
  ready(): Promise<void>;
  findById(id: string): Promise<OutputType | null>;
  findMany(filter?: FilterType, options?: QueryOptions): Promise<OutputType[]>;
  create(entity: InputType): Promise<OutputType>;
  update(
    id: string,
    update: Partial<InputType>,
    options?: {
      raw?: boolean;
    },
  ): Promise<OutputType | null>;
  delete(id: string): Promise<OutputType | null>;
  exists(id: string): Promise<boolean>;
  toLean(input: unknown): OutputType | null;
}

// Re-export ORM-specific types and configs
export type {
  MongooseBaseRepositoryConfig,
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  LeanWithMeta,
} from './mongoose/types';
export type {
  SequelizeBaseRepositoryConfig,
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
  LeanDocument,
} from './sequelize/types';
export type {
  NodeSqliteBaseRepositoryConfig,
  NodeSqliteRepositoryConfig,
  NodeSqliteRepositoryModel,
  NodeSqliteLean,
  NodeSqliteLeanDocument,
} from './nodesqlite/types';

/** Union of all supported model types */
export type RepositoryModel<D extends object = object> =
  | MongooseRepositoryModel<D>
  | SequelizeRepositoryModel<D>
  | NodeSqliteRepositoryModel;

export { ORMType } from '../orm/types';
