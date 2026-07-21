import type { ApiPrefixes } from '../types/server-config';

export interface StaticConfig {
  root: string;
  prefix?: string;
  /** Cache-Control for served assets. index.html always gets `no-cache`. */
  cache?: { maxAge?: number | string; immutable?: boolean };
}

export type { PageServerConfig } from '../types/server-config';
export type { ApiPrefixes } from '../types/server-config';

/**
 * PageServerPort - Hexagonal Architecture port for frontend/page server
 * Handles page rendering, static files, SPAs (React, Vue, Svelte, Angular, etc.)
 */
export interface PageServerPort {
  registerStaticFiles(config: StaticConfig): void;
  registerSpaFallback(prefixes: ApiPrefixes, staticDir: string): void;
  register(): Promise<void>;
}
