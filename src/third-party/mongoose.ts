/**
 * Mongoose ORM exports
 *
 * @example Minimal bundle (tree-shakeable)
 * import { mongoose, Schema } from "@sentzunhat/zacatl/third-party/mongoose";
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
export type {
  Model as MongooseModel,
  Default__v,
  Require_id,
  ObjectId,
  IfAny,
} from "mongoose";
