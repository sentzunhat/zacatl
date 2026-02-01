import i18n from "i18n";
import path from "path";

import { AbstractArchitecture, Constructor } from "../architecture";
import { HookHandler, RouteHandler } from "./entry-points/rest";

export type ApplicationHookHandlers = Array<Constructor<HookHandler>>;
export type ApplicationRouteHandlers = Array<Constructor<RouteHandler>>;

export type ApplicationEntryPoints = {
  rest: {
    // Middleware for pre-/post-processing
    hookHandlers: ApplicationHookHandlers;
    // Endpoints (or routes) as the request targets; expect an array of class constructors
    routeHandlers: ApplicationRouteHandlers;
  };
};

export type ConfigApplication = {
  entryPoints: ApplicationEntryPoints;
  autoRegister?: boolean; // Auto-register on construction (default: false)
};

export class Application extends AbstractArchitecture {
  private config: ConfigApplication;

  public hookHandlers: HookHandler[] = [];
  public routeHandlers: RouteHandler[] = [];

  constructor(config: ConfigApplication) {
    super();

    i18n.configure({
      locales: ["en", "fr"],
      objectNotation: true,
      directory: path.join(process.cwd(), "src/locales"),
    });

    this.config = config;

    // Auto-register if enabled (useful without Service)
    if (config.autoRegister) {
      this.registerRest();
    }
  }

  /**
   * Register and store dependencies for REST entry points
   */
  private registerRest(): void {
    this.registerAndStoreDependencies(
      this.config.entryPoints.rest.hookHandlers,
      this.hookHandlers,
    );

    this.registerAndStoreDependencies(
      this.config.entryPoints.rest.routeHandlers,
      this.routeHandlers,
    );
  }

  public start(): void {
    // Register if not already done
    if (!this.config.autoRegister) {
      this.registerRest();
    }
  }
}
