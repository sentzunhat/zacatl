/**
 * Sequelize ORM exports
 *
 * @example Minimal bundle (tree-shakeable)
 * import { Sequelize, DataTypes } from "@zacatl/third-party/sequelize";
 */

export {
  Sequelize,
  Model as SequelizeModel,
  DataTypes,
  Op,
  type InferAttributes,
  type InferCreationAttributes,
  type Options as SequelizeOptions,
  type ModelStatic,
} from "sequelize";
