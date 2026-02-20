import { InternalServerError } from "@zacatl/error";

import type { ConfigDesktop } from "./types";
import type { IpcApplicationEntryPoints } from "../../layers/application/types";

/**
 * Desktop platform stub for ServiceType.DESKTOP execution.
 *
 * @param config - Desktop window and platform configuration.
 * @returns Calling start throws InternalServerError; stop is a no-op.
 *
 * @example
 * const desktop = new Desktop({ window: { title: "App" }, platform: "neutralino" });
 */
export class Desktop {
  private window: ConfigDesktop["window"];
  private platform: ConfigDesktop["platform"];

  constructor(config: ConfigDesktop) {
    this.window = config.window;
    this.platform = config.platform;
  }

  public async registerEntrypoints(_entryPoints: IpcApplicationEntryPoints): Promise<void> {
    throw new InternalServerError({
      message: `Desktop IPC entrypoint registration for '${this.window.title}' is not yet implemented`,
      reason:
        "ServiceType.DESKTOP IPC handler registration and event routing are not implemented. " +
        "This feature is planned for v0.1.0. Use ServiceType.SERVER for HTTP-based services.",
      component: "Desktop",
      operation: "registerEntrypoints",
      metadata: {
        platform: this.platform,
        window: { title: this.window.title },
      },
    });
  }

  public async start(_input?: unknown): Promise<void> {
    throw new InternalServerError({
      message: `Desktop platform '${this.window.title}' (${this.platform}) is not yet implemented`,
      reason:
        "ServiceType.DESKTOP is declared but window initialization and IPC handler registration are not implemented. " +
        "This feature is planned for v0.1.0. Use ServiceType.SERVER for HTTP-based services.",
      component: "Desktop",
      operation: "start",
      metadata: {
        platform: this.platform,
        window: {
          title: this.window.title,
          width: this.window.width,
          height: this.window.height,
        },
      },
    });
  }

  public async stop(): Promise<void> {}
}
