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

// Re-export infrastructure with ORM types
export * from "./service/architecture/infrastructure";

// Re-export server types for convenience
export {
  ServerType,
  ServerVendor,
  DatabaseVendor,
  HandlersType,
} from "./service/architecture/platform/server/server";
export type { ConfigServer } from "./service/architecture/platform/server/server";

// Re-export commonly used third-party packages
export { container } from "tsyringe";
export type { DependencyContainer } from "tsyringe";

// Re-export Zod for validation
export { z } from "zod";
export type { ZodSchema, ZodType, ZodError } from "zod";

// Re-export ORMs (included as dependencies)
export * from "./orm-exports";

// Note: TypeScript utility types (Partial, Required, Readonly, etc.)
// are globally available and don't need re-export
