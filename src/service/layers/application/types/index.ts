import type { Constructor } from "../../types";
import type { HookHandler, RouteHandler } from "../entry-points/rest";

export type ApplicationRestHooks = Array<Constructor<HookHandler>>;
export type ApplicationRestRoutes = Array<
  Constructor<RouteHandler<unknown, unknown, unknown, unknown, unknown>>
>;

export interface RestApplicationEntryPoints {
  /** Middleware for pre-/post-processing (hooks) */
  hooks?: ApplicationRestHooks;
  /** Endpoints/routes as request targets */
  routes: ApplicationRestRoutes;
}

export type ApplicationCliCommands = Array<Constructor<unknown>>;

export interface CliApplicationEntryPoints {
  commands: ApplicationCliCommands;
}

export type ApplicationIpcHandlers = Array<Constructor<unknown>>;

export interface IpcApplicationEntryPoints {
  handlers: ApplicationIpcHandlers;
}

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
export interface ApplicationEntryPoints {
  /** REST API entry points (for ServiceType.SERVER) */
  rest?: RestApplicationEntryPoints;

  /** CLI commands entry points (for ServiceType.CLI) */
  cli?: CliApplicationEntryPoints;

  /** IPC handlers entry points (for ServiceType.DESKTOP) */
  ipc?: IpcApplicationEntryPoints;
}

export interface ConfigApplication {
  entryPoints: ApplicationEntryPoints;
}
