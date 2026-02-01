/**
 * Re-export ORM dependencies for convenience
 * These are included as dependencies (currently) for backward compatibility
 * Future versions may move them to pure peer dependencies
 */

// Mongoose exports - full re-export
export {
  default as mongoose,
  Mongoose,
  Schema,
  Model,
  Document,
  connect,
  connection,
} from "mongoose";

// Sequelize exports - full re-export
export { Sequelize, Model as SequelizeModel, DataTypes, Op } from "sequelize";

// Type-only exports for convenience
export type { Model as MongooseModel } from "mongoose";
export type { ModelStatic, Options as SequelizeOptions } from "sequelize";
