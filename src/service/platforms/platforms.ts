import { CLI } from "./cli";
import { Desktop } from "./desktop";
import { Server } from "./server/server";
import type { ConfigPlatforms } from "./types";
import type { ApplicationEntryPoints } from "../layers/application/types";

/**
 * Platforms - Wraps server, cli, or desktop instances
 * Stores config and delegates to platform instances
 * Service orchestrates the platforms
 */
export class Platforms {
  private readonly server?: Server;
  private readonly cli?: CLI;
  private readonly desktop?: Desktop;

  constructor(config: ConfigPlatforms) {
    const { server, cli, desktop } = config;

    if (server) {
      this.server = new Server(server);
    }

    if (cli) {
      this.cli = new CLI(cli);
    }

    if (desktop) {
      this.desktop = new Desktop(desktop);
    }
  }

  public async registerEntrypoints(entryPoints: ApplicationEntryPoints): Promise<void> {
    if (this.server && entryPoints.rest) {
      await this.server.registerEntrypoints(entryPoints.rest);
    }

    if (this.cli && entryPoints.cli) {
      await this.cli.registerEntrypoints(entryPoints.cli);
    }

    if (this.desktop && entryPoints.ipc) {
      await this.desktop.registerEntrypoints(entryPoints.ipc);
    }
  }

  public async start(options?: { port?: number }): Promise<void> {
    if (this.server) {
      await this.server.start(options);
    }

    if (this.cli) {
      await this.cli.start();
    }

    if (this.desktop) {
      await this.desktop.start();
    }
  }
}
