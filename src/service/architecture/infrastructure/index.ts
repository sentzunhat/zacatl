export * from "./repositories";
export * from "./infrastructure";

// Re-export Mongoose for user convenience
// Users can import directly from @sentzunhat/zacatl instead of installing mongoose
export {
  Schema,
  Model,
  Types,
  connect,
  connection,
  createConnection,
} from "mongoose";

export type {
  Document,
  SchemaDefinition,
  SchemaOptions,
  SchemaTypeOptions,
  Connection,
  Mongoose,
  ObjectId,
  UpdateQuery,
  QueryOptions,
  PopulateOptions,
  HydratedDocument,
  InferSchemaType,
} from "mongoose";

// Re-export Sequelize for user convenience
// Users can import directly from @sentzunhat/zacatl instead of installing sequelize
export { DataTypes, Sequelize, Model as SequelizeModelClass } from "sequelize";

export type {
  ModelStatic,
  QueryInterface,
  Transaction,
  Options as SequelizeOptions,
  ModelAttributes,
  ModelOptions,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  WhereOptions,
  Order,
  Includeable,
} from "sequelize";
