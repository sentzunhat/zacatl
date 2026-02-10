import { InternalServerError } from "@zacatl/error";
import { container } from "@zacatl/third-party";

import { HookHandler, RouteHandler } from "./entry-points/rest";
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

    // Register handlers - tsyringe auto-injects services from @injectable metadata
    if (restHooks && restHooks.length > 0) {
      for (const hook of restHooks) {
        container.registerSingleton(hook, hook);
      }
    }

    if (restRoutes && restRoutes.length > 0) {
      for (const route of restRoutes) {
        container.registerSingleton(route, route);
      }
    }

    // Verify all handlers can be resolved
    const hooks = restHooks ? resolveDependencies<HookHandler>(restHooks) : [];
    const routes = restRoutes
      ? resolveDependencies<RouteHandler>(restRoutes)
      : [];

    if (
      hooks.length !== (restHooks?.length || 0) ||
      routes.length !== (restRoutes?.length || 0)
    ) {
      throw new InternalServerError({
        message: "Failed to register all REST entry point dependencies",
        reason:
          "Not all REST hooks and routes could be resolved from DI container",
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
