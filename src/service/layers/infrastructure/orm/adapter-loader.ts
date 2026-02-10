import { MongooseAdapter } from "./mongoose-adapter";
import { SequelizeAdapter } from "./sequelize-adapter";
import type {
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMPort,
} from "../repositories/types";

/**
 * Creates a Mongoose adapter
 * @param config Mongoose repository configuration
 * @returns ORMPort implementation for Mongoose
 */
export function createMongooseAdapter<D, I, O>(
  config: MongooseRepositoryConfig<D>,
): ORMPort<D, I, O> {
  return new MongooseAdapter<D, I, O>(config);
}

/**
 * Creates a Sequelize adapter
 * @param config Sequelize repository configuration
 * @returns ORMPort implementation for Sequelize
 */
export function createSequelizeAdapter<D, I, O>(
  config: SequelizeRepositoryConfig<object>,
): ORMPort<D, I, O> {
  return new SequelizeAdapter<D, I, O>(config);
}
