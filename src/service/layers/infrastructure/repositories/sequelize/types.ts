import type { ModelStatic, SequelizeModel as Model } from '../../../../../third-party/sequelize';
import type { ORMType } from '../../orm/types';
export type { LeanDocument } from '../../orm/sequelize/types';

export interface SequelizeRepositoryConfig<D extends object = object> {
  readonly type?: ORMType.Sequelize;
  /**
   * The name used when the model was registered with the Sequelize instance
   * (e.g. the first argument to `sequelize.define('MyModel', ...)` or
   * the `modelName` option in `Model.init()`). The adapter resolves the
   * Sequelize instance from the DI container via `SequelizeToken` and
   * retrieves this model with `sequelize.model(name)`.
   */
  readonly name: string & (D extends object ? unknown : never);
}

export type SequelizeBaseRepositoryConfig<D extends object = object> =
  SequelizeRepositoryConfig<D> & {
    readonly type: ORMType.Sequelize;
  };

/** Model types for Sequelize ORM */
export type SequelizeRepositoryModel<D extends object = object> = ModelStatic<Model<D>>;
