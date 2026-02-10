import type { Constructor } from "../../types";
import type { HookHandler, RouteHandler } from "../entry-points/rest";

export type ApplicationRestHooks = Array<Constructor<HookHandler>>;
export type ApplicationRestRoutes = Array<
  Constructor<RouteHandler<any, any, any, any, any>>
>;

export type RestApplicationEntryPoints = {
  /** Middleware for pre-/post-processing (hooks) */
  hooks?: ApplicationRestHooks;
  /** Endpoints/routes as request targets */
  routes: ApplicationRestRoutes;
};

export type ApplicationCliCommands = Array<Constructor<unknown>>;

export type CliApplicationEntryPoints = {
  commands: ApplicationCliCommands;
};

export type ApplicationIpcHandlers = Array<Constructor<unknown>>;

export type IpcApplicationEntryPoints = {
  handlers: ApplicationIpcHandlers;
};

/**
 * Entry points configuration for different service contexts
 *
 * Supports:
 * - CLI: Command-line interface with commands
 * - REST: HTTP server with hooks and routes
 * - IPC: Desktop app with IPC handlers
 *
 * At least one entry point type must be provided based on the service type.
 */
export type ApplicationEntryPoints = {
  /** REST API entry points (for ServiceType.SERVER) */
  rest?: RestApplicationEntryPoints;

  /** CLI commands entry points (for ServiceType.CLI) */
  cli?: CliApplicationEntryPoints;

  /** IPC handlers entry points (for ServiceType.DESKTOP) */
  ipc?: IpcApplicationEntryPoints;
};

export type ConfigApplication = {
  entryPoints: ApplicationEntryPoints;
};
