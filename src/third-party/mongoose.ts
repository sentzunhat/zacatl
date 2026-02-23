/**
 * Mongoose ORM exports
 *
 * @example Minimal bundle (tree-shakeable)
 * import { mongoose, Schema } from "@zacatl/third-party/mongoose";
 */

import mongooseDefault from 'mongoose';

export { default as mongoose, Mongoose, Schema, Model, Document, connect } from 'mongoose';

// Re-export connection from the default export
export const connection = mongooseDefault.connection;

// Type-only exports
export type { Model as MongooseModel, Default__v, Require_id, ObjectId, IfAny } from 'mongoose';
