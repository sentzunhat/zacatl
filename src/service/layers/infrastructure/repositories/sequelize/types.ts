import type {
  ModelStatic,
  SequelizeModel as Model,
} from "../../../../../third-party/sequelize";
import { ORMType } from "../mongoose/types";

export type LeanDocument<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SequelizeRepositoryConfig<D extends object = object> = {
  readonly type?: ORMType.Sequelize;
  readonly model: SequelizeRepositoryModel<D>;
};

export type SequelizeBaseRepositoryConfig<D extends object = object> =
  SequelizeRepositoryConfig<D> & {
    readonly type: ORMType.Sequelize;
  };

/** Model types for Sequelize ORM */
export type SequelizeRepositoryModel<D extends object = object> = ModelStatic<
  Model<D>
>;
