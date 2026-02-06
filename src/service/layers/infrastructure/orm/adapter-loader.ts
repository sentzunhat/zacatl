import { InternalServerError } from "@zacatl/error";

import type { SequelizeModel as Model } from "../../../../third-party/sequelize";
import type {
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMPort,
} from "../repositories/types";

/** Lazy-loads MongooseAdapter when needed */
export async function loadMongooseAdapter<D, I, O>(
  config: MongooseRepositoryConfig<D>,
): Promise<ORMPort<D, I, O>> {
  try {
    const adapters = await import("./adapters/mongoose-adapter");
    return new adapters.MongooseAdapter<D, I, O>(config);
  } catch (error: any) {
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.code === "MODULE_NOT_FOUND"
    ) {
      throw new InternalServerError({
        message:
          "Mongoose is not installed. Install it with: npm install mongoose",
        reason: "Mongoose dependency is missing",
        component: "ORMAdapterLoader",
        operation: "loadMongooseAdapter",
        error,
      });
    }
    throw error;
  }
}

/** Lazy-loads SequelizeAdapter when needed */
export async function loadSequelizeAdapter<D extends Model, I, O>(
  config: SequelizeRepositoryConfig<D>,
): Promise<ORMPort<D, I, O>> {
  try {
    const adapters = await import("./adapters/sequelize-adapter");
    return new adapters.SequelizeAdapter<D, I, O>(config);
  } catch (error: any) {
    if (
      error.code === "ERR_MODULE_NOT_FOUND" ||
      error.code === "MODULE_NOT_FOUND"
    ) {
      throw new InternalServerError({
        message:
          "Sequelize is not installed. Install it with: npm install sequelize",
        reason: "Sequelize dependency is missing",
        component: "ORMAdapterLoader",
        operation: "loadSequelizeAdapter",
        error,
      });
    }
    throw error;
  }
}
