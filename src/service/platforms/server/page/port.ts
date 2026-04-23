export interface StaticConfig {
  root: string;
  prefix?: string;
}

export type { PageServerConfig } from '../types/server-config';

/**
 * PageServerPort - Hexagonal Architecture port for frontend/page server
 * Handles page rendering, static files, SPAs (React, Vue, Svelte, Angular, etc.)
 */
export interface PageServerPort {
  registerStaticFiles(config: StaticConfig): void;
  registerSpaFallback(apiPrefix: string, staticDir: string): void;
  register(server: unknown): Promise<void>;
}
