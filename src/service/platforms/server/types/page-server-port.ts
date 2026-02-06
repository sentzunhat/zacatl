export type StaticConfig = {
  root: string;
  prefix?: string;
};

export type PageServerConfig = {
  devServerUrl?: string;
  staticDir?: string;
  customRegister?: (server: unknown) => Promise<void> | void;
  apiPrefix?: string;
};

/**
 * PageServerPort - Hexagonal Architecture port for frontend/page server
 * Handles page rendering, static files, SPAs (React, Vue, Svelte, Angular, etc.)
 */
export interface PageServerPort {
  registerStaticFiles(config: StaticConfig): void;
  registerSpaFallback(apiPrefix: string, staticDir: string): void;
  register(server: unknown): Promise<void>;
}
