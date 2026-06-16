import type { MongooseBaseRepositoryConfig, MongooseRepositoryModel } from './mongoose/types';
import type { NodeSqliteBaseRepositoryConfig, NodeSqliteRepositoryModel } from './nodesqlite/types';
import type { SequelizeBaseRepositoryConfig, SequelizeRepositoryModel } from './sequelize/types';

export type BaseRepositoryConfig<D extends object = object> =
  | MongooseBaseRepositoryConfig<D>
  | SequelizeBaseRepositoryConfig<D>
  | NodeSqliteBaseRepositoryConfig;

/** ORM adapter interface - implemented by Mongoose, Sequelize, and node:sqlite adapters */
export interface ORMPort<
  ModelType = unknown,
  InputType = unknown,
  OutputType = unknown,
  FilterType = Record<string, unknown>,
> {
  readonly model: ModelType;
  initialize(): Promise<void>;
  findById(id: string): Promise<OutputType | null>;
  findMany(filter?: FilterType): Promise<OutputType[]>;
  create(entity: InputType): Promise<OutputType>;
  update(id: string, update: Partial<InputType>): Promise<OutputType | null>;
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
  findById(id: string): Promise<OutputType | null>;
  findMany(filter?: FilterType): Promise<OutputType[]>;
  create(entity: InputType): Promise<OutputType>;
  update(id: string, update: Partial<InputType>): Promise<OutputType | null>;
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

export { ORMType } from './mongoose/types';
