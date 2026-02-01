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

// Optional ORM exports for convenience (also available via subpath imports)
export * from "./orm/mongoose.js";
export * from "./orm/sequelize.js";
