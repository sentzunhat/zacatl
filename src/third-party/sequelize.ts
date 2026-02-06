/**
 * Sequelize ORM exports
 *
 * @example Minimal bundle (tree-shakeable)
 * import { Sequelize, DataTypes } from "@sentzunhat/zacatl/third-party/sequelize";
 *
 * @example Convenience (from main package)
 * import { Sequelize, DataTypes } from "@sentzunhat/zacatl";
 */

export { Sequelize, Model as SequelizeModel, DataTypes, Op } from "sequelize";

// Type-only exports
export type { ModelStatic, Options as SequelizeOptions } from "sequelize";
