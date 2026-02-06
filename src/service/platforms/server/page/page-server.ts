import { CustomError } from "@zacatl/error";

import type { ConfigServer } from "../server";
import {
  type PageServerPort,
  type StaticConfig,
} from "../types/page-server-port";

/**
 * PageServer - Encapsulates frontend/page rendering logic
 * Uses shared adapter provided by Server class
 * Handles static files, SPA routing, and page module registration
 * Supports frameworks: React, Vue, Svelte, Angular, etc.
 */
export class PageServer {
  private readonly config: ConfigServer;
  private readonly adapter: PageServerPort;

  constructor(config: ConfigServer, adapter: PageServerPort) {
    this.config = config;
    this.adapter = adapter;
  }

  /**
   * Register static files to be served
   */
  public registerStaticFiles(config: StaticConfig): void {
    try {
      this.adapter.registerStaticFiles(config);
    } catch (error: unknown) {
      throw new CustomError({
        message: "failed to register static files",
        code: 500,
        reason: "static file registration failed",
        error: error as Error,
        metadata: { config },
      });
    }
  }

  /**
   * Register SPA fallback (e.g., for React Router, Vue Router, etc.)
   * Routes non-API requests to index.html for client-side routing
   */
  public registerSpaFallback(apiPrefix: string, staticDir: string): void {
    try {
      this.adapter.registerSpaFallback(apiPrefix, staticDir);
    } catch (error: unknown) {
      throw new CustomError({
        message: "failed to register SPA fallback",
        code: 500,
        reason: "SPA fallback registration failed",
        error: error as Error,
        metadata: { apiPrefix, staticDir },
      });
    }
  }

  /**
   * Generic register method for page module setup
   */
  public async register(server: unknown): Promise<void> {
    try {
      await this.adapter.register(server);
    } catch (error: unknown) {
      throw new CustomError({
        message: "failed to register page module",
        code: 500,
        reason: "page module registration failed",
        error: error as Error,
      });
    }
  }

  /**
   * Configure page server based on config
   * Sets up static files and SPA routing
   */
  public async configure(): Promise<void> {
    if (!this.config.page) {
      return;
    }

    const { staticDir, apiPrefix, customRegister } = this.config.page;

    if (staticDir) {
      this.registerStaticFiles({
        root: staticDir,
        ...(apiPrefix ? { prefix: apiPrefix } : {}),
      });
    }

    if (staticDir && apiPrefix) {
      this.registerSpaFallback(apiPrefix, staticDir);
    }

    if (customRegister) {
      // Allow custom registration for specific page frameworks
      await customRegister(this.adapter);
    }
  }

  /**
   * Get Page adapter for advanced configuration
   * Useful for custom page rendering, static file setup, or SPA configuration
   */
  public getAdapter(): PageServerPort {
    return this.adapter;
  }
}
