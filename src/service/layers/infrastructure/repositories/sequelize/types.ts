import type {
  ModelStatic,
  SequelizeModel as Model,
} from '../../../../../third-party/databases/sequelize';
import type { ConnectionRef } from '../../../../platforms/server/database/port';
import type { ORMType } from '../../orm/types';
export type { LeanDocument } from '../../orm/sequelize/types';

export interface SequelizeRepositoryConfig {
  readonly type?: ORMType.Sequelize;
  /**
   * The name used when the model was registered with the Sequelize instance
   * (e.g. the first argument to `sequelize.define('MyModel', ...)` or
   * the `modelName` option in `Model.init()`). The adapter resolves the
   * Sequelize instance from the DI container via `SequelizeToken` and
   * retrieves this model with `sequelize.model(name)`.
   */
  readonly name: string;
  /** Which database connection to use; omit for single-database default */
  readonly connection?: ConnectionRef;
}

export type SequelizeBaseRepositoryConfig = SequelizeRepositoryConfig & {
  readonly type: ORMType.Sequelize;
};

/** Model types for Sequelize ORM */
export type SequelizeRepositoryModel<D extends object = object> = ModelStatic<Model<D>>;
