export enum ServerVendor {
  FASTIFY = 'FASTIFY',
  EXPRESS = 'EXPRESS',
}

export interface HttpServerConfig {
  type: ServerType;
  vendor: ServerVendor;
  instance: unknown;
  gateway?: GatewayService;
}

export interface ApiServerConfig {
  httpServer: HttpServerConfig;
}

export interface PageServerConfig {
  devServerUrl?: string | undefined;
  staticDir?: string | undefined;
  customRegister?: ((server: unknown) => Promise<void> | void) | undefined;
  apiPrefix?: string | undefined;
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
