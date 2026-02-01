import type { Model } from "sequelize";
import type {
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMAdapter,
} from "../repositories/types";

/** Lazy-loads MongooseAdapter when needed */
export async function loadMongooseAdapter<D, I, O>(
  config: MongooseRepositoryConfig<D>,
): Promise<ORMAdapter<D, I, O>> {
  try {
    const adapters = await import("./adapters/mongoose-adapter");
    return new adapters.MongooseAdapter<D, I, O>(config);
  } catch (error: any) {
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.code === "MODULE_NOT_FOUND"
    ) {
      throw new Error(
        "Mongoose is not installed. Install it with: npm install mongoose",
      );
    }
    throw error;
  }
}

/** Lazy-loads SequelizeAdapter when needed */
export async function loadSequelizeAdapter<D extends Model, I, O>(
  config: SequelizeRepositoryConfig<D>,
): Promise<ORMAdapter<D, I, O>> {
  try {
    const adapters = await import("./adapters/sequelize-adapter");
    return new adapters.SequelizeAdapter<D, I, O>(config);
  } catch (error: any) {
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.code === "MODULE_NOT_FOUND"
    ) {
      throw new Error(
        "Sequelize is not installed. Install it with: npm install sequelize",
      );
    }
    throw error;
  }
}
