import { InternalServerError } from "@zacatl/error";

import type { ConfigCLI } from "./types";
import type { CliApplicationEntryPoints } from "../../layers/application/types";

/**
 * CLI platform stub for ServiceType.CLI execution.
 *
 * @param config - CLI name/version configuration.
 * @returns Calling start throws InternalServerError; stop is a no-op.
 *
 * @example
 * const cli = new CLI({ name: "my-cli", version: "0.1.0" });
 */
export class CLI {
  private readonly name: string;
  private readonly version: string;

  constructor(config: ConfigCLI) {
    this.name = config.name;
    this.version = config.version;
  }

  public async registerEntrypoints(_entryPoints: CliApplicationEntryPoints): Promise<void> {
    throw new InternalServerError({
      message: `CLI entrypoint registration for '${this.name}' is not yet implemented`,
      reason:
        "ServiceType.CLI command registration and routing are not implemented. " +
        "This feature is planned for v0.1.0. Use ServiceType.SERVER for HTTP-based services.",
      component: "CLI",
      operation: "registerEntrypoints",
      metadata: { name: this.name, version: this.version },
    });
  }

  public async start(_input?: unknown): Promise<void> {
    throw new InternalServerError({
      message: `CLI platform '${this.name}' is not yet implemented`,
      reason:
        "ServiceType.CLI is declared but CLI command routing and argument parsing are not implemented. " +
        "This feature is planned for v0.1.0. Use ServiceType.SERVER for HTTP-based services.",
      component: "CLI",
      operation: "start",
      metadata: { name: this.name, version: this.version },
    });
  }

  public async stop(): Promise<void> {}
}
