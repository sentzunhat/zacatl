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
  gateway?: GatewayService;
}

export interface PageServerConfig {
  devServerUrl?: string | undefined;
  staticDir?: string | undefined;
  /** Enable SPA fallback (serve index.html for non-API, non-asset routes). Defaults to true when staticDir is set. */
  spaFallback?: boolean | undefined;
  /** Named API prefixes excluded from SPA fallback. Defaults to `{ api: '/api' }`. Add more keys for additional API groups. */
  prefixes?: ApiPrefixes | undefined;
  customRegister?: ((server: unknown) => Promise<void> | void) | undefined;
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
