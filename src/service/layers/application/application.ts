import { resolveDependencies } from "@zacatl/dependency-injection";
import { InternalServerError } from "@zacatl/error";

import type { ConfigApplication } from "./types";
import { getContainer } from "../../../dependency-injection/container";


export class Application {
  protected config: ConfigApplication;

  constructor(config: ConfigApplication) {
    this.config = config;

    this.register();
  }

  private register(): void {
    if (this.config.entryPoints.rest != null) {
      this.registerRestEntryPoints();
    }
  }

  private registerRestEntryPoints(): void {
    const restEntryPoints = this.config.entryPoints.rest;

    if (restEntryPoints == null) {
      return;
    }

    const { hooks: restHooks, routes: restRoutes } = restEntryPoints;

    // Register handlers as singletons.
    // If a handler is decorated with @singleton() it is already registered on
    // module load, so we skip re-registration to avoid overwriting the existing
    // singleton instance. @injectable() handlers are not self-registered, so
    // the framework registers them here. Both decorators produce singletons —
    // use whichever reads better in your codebase.
    if (restHooks != null && restHooks.length > 0) {
      for (const hook of restHooks) {
        if (!getContainer().isRegistered(hook)) {
          getContainer().registerSingleton(hook, hook);
        }
      }
    }

    if (restRoutes != null && restRoutes.length > 0) {
      for (const route of restRoutes) {
        if (!getContainer().isRegistered(route)) {
          getContainer().registerSingleton(route, route);
        }
      }
    }

    // Verify all handlers can be resolved
    const hooks = restHooks != null ? resolveDependencies(restHooks) : [];
    const routes = restRoutes != null ? resolveDependencies(restRoutes) : [];

    if (
      hooks.length !== (restHooks != null ? restHooks.length : 0) ||
      routes.length !== (restRoutes != null ? restRoutes.length : 0)
    ) {
      throw new InternalServerError({
        message: "Failed to register all REST entry point dependencies",
        reason: "Not all REST hooks and routes could be resolved from DI container",
        component: "ApplicationLayer",
        operation: "register",
        metadata: {
          expectedHooks: restHooks != null ? restHooks.length : 0,
          resolvedHooks: hooks.length,
          expectedRoutes: restRoutes != null ? restRoutes.length : 0,
          resolvedRoutes: routes.length,
        },
      });
    }
  }
}
