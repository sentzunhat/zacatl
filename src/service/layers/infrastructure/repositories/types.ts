import type { MongooseBaseRepositoryConfig } from './mongoose/types';
import type { SequelizeBaseRepositoryConfig } from './sequelize/types';

export type BaseRepositoryConfig<D extends object = object> =
  | MongooseBaseRepositoryConfig<D>
  | SequelizeBaseRepositoryConfig<D>;

/** ORM adapter interface - implemented by Mongoose and Sequelize adapters */
export interface ORMPort<ModelType = unknown, InputType = unknown, OutputType = unknown> {
  readonly model: ModelType;
  toLean(input: unknown): OutputType | null;
  findById(id: string): Promise<OutputType | null>;
  findMany(filter?: Record<string, unknown>): Promise<OutputType[]>;
  create(entity: InputType): Promise<OutputType>;
  update(id: string, update: Partial<InputType>): Promise<OutputType | null>;
  delete(id: string): Promise<OutputType | null>;
  exists(id: string): Promise<boolean>;
}

/**
 * Repository contract - public interface for consumers
 * Implemented by BaseRepository with ORM adapters
 */
export interface RepositoryPort<ModelType = unknown, InputType = unknown, OutputType = unknown> {
  readonly model?: ModelType;
  toLean(input: unknown): OutputType | null;
  findById(id: string): Promise<OutputType | null>;
  findMany(filter?: Record<string, unknown>): Promise<OutputType[]>;
  create(entity: InputType): Promise<OutputType>;
  update(id: string, update: Partial<InputType>): Promise<OutputType | null>;
  delete(id: string): Promise<OutputType | null>;
  exists(id: string): Promise<boolean>;
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
} from './sequelize/types';

/** Union of all supported model types */
export type RepositoryModel<D extends object = object> =
  | import('./mongoose/types').MongooseRepositoryModel<D>
  | import('./sequelize/types').SequelizeRepositoryModel<D>;

export { ORMType } from './mongoose/types';
