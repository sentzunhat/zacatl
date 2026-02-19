import { MongooseAdapter } from "./mongoose-adapter";
import { SequelizeAdapter } from "./sequelize-adapter";
import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
  ORMPort,
} from "../repositories/types";

/**
 * Creates a Mongoose adapter
 * @param config Mongoose repository configuration
 * @returns ORMPort implementation for Mongoose
 */
export function createMongooseAdapter<D, I, O>(
  config: MongooseRepositoryConfig<D>,
): ORMPort<MongooseRepositoryModel<D>, I, O> {
  return new MongooseAdapter<D, I, O>(config);
}

/**
 * Creates a Sequelize adapter
 * @param config Sequelize repository configuration
 * @returns ORMPort implementation for Sequelize
 */
export function createSequelizeAdapter<D extends object, I, O>(
  config: SequelizeRepositoryConfig<D>,
): ORMPort<SequelizeRepositoryModel<D>, I, O> {
  return new SequelizeAdapter<D, I, O>(config);
}
