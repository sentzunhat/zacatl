import i18n from "i18n";
import path from "path";

import { AbstractArchitecture } from "../architecture";
import { HookHandler, RouteHandler } from "./entry-points/rest";

export type ApplicationHookHandlers = Array<new () => HookHandler>;
export type ApplicationRouteHandlers = Array<new () => RouteHandler>;

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
  }

  /**
   * Register and store dependencies for REST entry points
   */
  private registerRest(): void {
    this.registerAndStoreDependencies(
      this.config.entryPoints.rest.hookHandlers,
      this.hookHandlers
    );

    this.registerAndStoreDependencies(
      this.config.entryPoints.rest.routeHandlers,
      this.routeHandlers
    );
  }

  public start(): void {
    this.registerRest();
  }
}
