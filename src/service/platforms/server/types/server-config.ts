import type { InjectionToken } from '../../../../third-party/dependency-injection/tsyringe';
import type { PageServerPort } from '../page/port';

export enum ServerVendor {
  FASTIFY = 'FASTIFY',
  EXPRESS = 'EXPRESS',
}

/** Named API route prefixes. `api` is the required base; add more keys to exclude additional path groups from SPA routing. */
export interface ApiPrefixes {
  api: string;
  [key: string]: string;
}

export interface HttpServerConfig {
  type: ServerType;
  vendor: ServerVendor;
  instance: unknown;
  prefixes?: ApiPrefixes;
  /** Bind address used by Service.start(). Defaults to 0.0.0.0 for container reachability. */
  host?: string;
  gateway?: GatewayService;
}

/** Tools available while registering custom page handlers for one Server. */
export interface PageRegistrationContext {
  adapter: PageServerPort;
  rawServer: unknown;
  /** Match a URL against this Server's configured API route prefix. */
  isApiRequest(url: string): boolean;
  /** Resolve a dependency from this Server's handler scope. */
  resolve<T>(token: InjectionToken<T>): T;
}

export interface PageServerConfig {
  devServerUrl?: string | undefined;
  staticDir?: string | undefined;
  /** Enable SPA fallback (serve index.html for non-API, non-asset routes). Defaults to true when staticDir is set. */
  spaFallback?: boolean | undefined;
  /** Named prefixes excluded from SPA fallback. Defaults to the Server's route prefixes, then `{ api: '/api' }`. */
  prefixes?: ApiPrefixes | undefined;
  /**
   * Cache-Control for static assets — the CDN-friendly pattern for
   * content-hashed bundles (Vite/webpack emit hashed filenames, so long
   * immutable caching is safe). index.html is always served with
   * `no-cache` so deploys propagate immediately; a CDN in front simply
   * respects these origin headers. `maxAge`/`immutable` are passed
   * verbatim to express.static / @fastify/static.
   *
   * @example { maxAge: '1y', immutable: true }
   */
  cache?: { maxAge?: number | string; immutable?: boolean } | undefined;
  /** Register custom page handlers with the native server and Service-scoped resolver. */
  customRegister?: ((context: PageRegistrationContext) => Promise<void> | void) | undefined;
}

export enum ServerType {
  SERVER = 'SERVER',
  GATEWAY = 'GATEWAY',
}

interface ProxyGateway {
  upstream: string;
  prefix?: string;
}

type ProxiesGateway = Array<ProxyGateway>;

interface GatewayService {
  proxies: ProxiesGateway;
}
