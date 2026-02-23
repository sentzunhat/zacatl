import { resolveDependencies } from "@zacatl/dependency-injection";
import { InternalServerError } from "@zacatl/error";

import type { ConfigInfrastructure, InfrastructureUnknownRepository } from "./types";
import { getContainer } from "../../../dependency-injection/container";


export type { ConfigInfrastructure };

/**
 * Infrastructure layer bootstrapper
 *
 * Responsible for registering infrastructure-level components (repositories)
 * in the DI container and performing basic lifecycle hooks.
 */
export class Infrastructure {
  protected config: ConfigInfrastructure;

  constructor(config: ConfigInfrastructure) {
    this.config = config;

    this.register();
  }

  private register(): void {
    if (this.config.repositories && this.config.repositories.length > 0) {
      this.registerRepositories();
    }
  }

  private registerRepositories(): void {
    if (!this.config.repositories) {
      return;
    }

    // Register repositories - tsyringe auto-injects from @injectable metadata
    for (const repository of this.config.repositories) {
      getContainer().registerSingleton(repository, repository);
    }

    const resolvedRepositories = resolveDependencies<InfrastructureUnknownRepository>(
      this.config.repositories,
    );

    if (resolvedRepositories.length !== this.config.repositories.length) {
      throw new InternalServerError({
        message: "Failed to register all infrastructure repository dependencies",
        reason: "Not all repositories could be resolved from DI container",
        component: "InfrastructureLayer",
        operation: "register",
        metadata: {
          expected: this.config.repositories.length,
          resolved: resolvedRepositories.length,
        },
      });
    }
  }

  /**
   * Start the infrastructure layer. No-op by default; provided for consumers
   * that require explicit lifecycle start hooks.
   */
  public start(): void {}
}
