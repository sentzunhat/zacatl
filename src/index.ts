export * from "./optionals";
export * from "./configuration";
export * from "./utils";
export * from "./error";
export * from "./dependency-injection";
export * from "./service";
export { Service } from "./service";
export type { ConfigService } from "./service";
export * from "./logs";
export * from "./runtime";
export * from "./localization";

export * from "./service/architecture/infrastructure";

export {
  ServerType,
  ServerVendor,
  DatabaseVendor,
  HandlersType,
} from "./service/architecture/platform/server/server";
export type { ConfigServer } from "./service/architecture/platform/server/server";

// Third-party integrations
export { container, singleton, inject } from "tsyringe";
export type { DependencyContainer } from "tsyringe";
export { z } from "zod";
export type { ZodSchema, ZodType, ZodError } from "zod";

// ⚠️ ORM exports REMOVED from main package to prevent eager loading
// Use dedicated subpath imports instead:
//   import { mongoose, Schema } from "@sentzunhat/zacatl/orm/mongoose"
//   import { Sequelize, DataTypes } from "@sentzunhat/zacatl/orm/sequelize"
