/**
 * Mongoose ORM exports
 *
 * @example Minimal bundle (tree-shakeable)
 * import { mongoose, Schema } from "@sentzunhat/zacatl/orm/mongoose";
 *
 * @example Convenience (from main package)
 * import { mongoose, Schema } from "@sentzunhat/zacatl";
 */

export {
  default as mongoose,
  Mongoose,
  Schema,
  Model,
  Document,
  connect,
  connection,
} from "mongoose";

// Type-only exports
export type { Model as MongooseModel } from "mongoose";
