import { InternalServerError } from "@zacatl/error";
import { container } from "@zacatl/third-party/tsyringe";

import type { ConfigApplication } from "./types";
import { resolveDependencies } from "../../../dependency-injection/container";

export class Application {
  protected config: ConfigApplication;

  constructor(config: ConfigApplication) {
    this.config = config;

    this.register();
  }

  private register(): void {
    if (this.config.entryPoints.rest) {
      this.registerRestEntryPoints();
    }
  }

  private registerRestEntryPoints(): void {
    const restEntryPoints = this.config.entryPoints.rest;

    if (!restEntryPoints) {
      return;
    }

    const { hooks: restHooks, routes: restRoutes } = restEntryPoints;

    // Register handlers as singletons.
    // If a handler is decorated with @singleton() it is already registered on
    // module load, so we skip re-registration to avoid overwriting the existing
    // singleton instance. @injectable() handlers are not self-registered, so
    // the framework registers them here. Both decorators produce singletons —
    // use whichever reads better in your codebase.
    if (restHooks && restHooks.length > 0) {
      for (const hook of restHooks) {
        if (!container.isRegistered(hook)) {
          container.registerSingleton(hook, hook);
        }
      }
    }

    if (restRoutes && restRoutes.length > 0) {
      for (const route of restRoutes) {
        if (!container.isRegistered(route)) {
          container.registerSingleton(route, route);
        }
      }
    }

    // Verify all handlers can be resolved
    const hooks = restHooks ? resolveDependencies(restHooks) : [];
    const routes = restRoutes ? resolveDependencies(restRoutes) : [];

    if (hooks.length !== (restHooks?.length || 0) || routes.length !== (restRoutes?.length || 0)) {
      throw new InternalServerError({
        message: "Failed to register all REST entry point dependencies",
        reason: "Not all REST hooks and routes could be resolved from DI container",
        component: "ApplicationLayer",
        operation: "register",
        metadata: {
          expectedHooks: restHooks?.length || 0,
          resolvedHooks: hooks.length,
          expectedRoutes: restRoutes?.length || 0,
          resolvedRoutes: routes.length,
        },
      });
    }
  }
}
