import type { ConfigDesktop } from "./types";

/**
 * Desktop Platform implementation
 * Handles desktop application execution context (e.g., Electron, Neutralino)
 */
export class Desktop {
  private window: ConfigDesktop["window"];
  private platform: ConfigDesktop["platform"];

  constructor(config: ConfigDesktop) {
    this.window = config.window;
    this.platform = config.platform;
  }

  public async start(_input?: unknown): Promise<void> {
    // TODO [@deadline: 2026-03-15]: Implement Desktop window initialization and IPC handler registration
    // Should: Detect platform (Electron/Neutralino), create window, resolve IPC handlers from DI
    console.log(
      `Starting Desktop platform (${this.platform}): ${this.window.title}`,
    );
    console.log(`Window size: ${this.window.width}x${this.window.height}`);
  }

  public async stop(): Promise<void> {}
}
