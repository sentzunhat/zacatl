export * from "./optionals";
export * from "./configuration";
export * from "./utils";
export * from "./error";
export * from "./dependency-injection";
export * from "./service";
export { Service } from "./service/service";
export type { ConfigService } from "./service/service";
export * from "./logs";
export * from "./runtime";
export * from "./localization";

export * from "./service/layers/infrastructure";

// Service architecture types
export { ServiceType } from "./service/types";
export type { ConfigCLI, ConfigDesktop } from "./service/types";

// Layer composition utilities
export type { Constructor, Provider } from "./service/layers/types";

// Application layer types
export type {
  ApplicationRestHooks,
  ApplicationRestRoutes,
  ApplicationEntryPoints,
  ConfigApplication,
} from "./service/layers/application";

// Server types
export {
  DatabaseVendor,
  ServerVendor,
  ServerType,
} from "./service/platforms/server/types";
export { HandlersType } from "./service/platforms/server/api/api-server";
export type { ConfigServer } from "./service/platforms/server/server";

export * from "./service";

export * from "./third-party";

export * from "./utils";

export * from "./optionals";
