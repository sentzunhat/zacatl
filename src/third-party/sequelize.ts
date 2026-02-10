/**
 * Sequelize ORM exports
 *
 * @example Minimal bundle (tree-shakeable)
 * import { Sequelize, DataTypes } from "@zacatl/third-party/sequelize";
 *
 * @example Convenience (from main package)
 * import { Sequelize, DataTypes } from "@zacatl";
 */

export { Sequelize, Model as SequelizeModel, DataTypes, Op } from "sequelize";

// Type-only exports
export type { ModelStatic, Options as SequelizeOptions } from "sequelize";
