import type { Model } from "sequelize";
import type {
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMAdapter,
} from "../repositories/types";

/**
 * Loads MongooseAdapter dynamically - only when needed
 * Throws helpful error if mongoose is not installed
 */
export function loadMongooseAdapter<D, I, O>(
  config: MongooseRepositoryConfig<D>,
): ORMAdapter<D, I, O> {
  try {
    // Dynamic import - only loads when Mongoose is actually used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adapters =
      require("./adapters/mongoose-adapter") as typeof import("./adapters/mongoose-adapter");
    return new adapters.MongooseAdapter<D, I, O>(config);
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "Mongoose is not installed. Install it with: npm install mongoose",
      );
    }
    throw error;
  }
}

/**
 * Loads SequelizeAdapter dynamically - only when needed
 * Throws helpful error if sequelize is not installed
 */
export function loadSequelizeAdapter<D extends Model, I, O>(
  config: SequelizeRepositoryConfig<D>,
): ORMAdapter<D, I, O> {
  try {
    // Dynamic import - only loads when Sequelize is actually used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const adapters =
      require("./adapters/sequelize-adapter") as typeof import("./adapters/sequelize-adapter");
    return new adapters.SequelizeAdapter<D, I, O>(config);
  } catch (error: any) {
    if (error.code === "MODULE_NOT_FOUND") {
      throw new Error(
        "Sequelize is not installed. Install it with: npm install sequelize",
      );
    }
    throw error;
  }
}
