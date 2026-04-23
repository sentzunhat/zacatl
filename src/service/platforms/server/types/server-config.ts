export enum ServerVendor {
  FASTIFY = 'FASTIFY',
  EXPRESS = 'EXPRESS',
}

export interface HttpServerConfig {
  type: ServerType;
  vendor: ServerVendor;
  instance: unknown;
  apiPrefix?: string;
  gateway?: GatewayService;
}

export interface PageServerConfig {
  devServerUrl?: string | undefined;
  staticDir?: string | undefined;
  /** Enable SPA fallback (serve index.html for non-API, non-asset routes). Defaults to true when staticDir is set. */
  spaFallback?: boolean | undefined;
  /** Base path for API routes excluded from SPA fallback. Defaults to '/api'. */
  apiPrefix?: string | undefined;
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
