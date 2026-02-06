export enum ServerVendor {
  FASTIFY = "FASTIFY",
  EXPRESS = "EXPRESS",
}

export type HttpServerConfig = {
  type: ApiServerType;
  vendor: ServerVendor;
  instance: unknown;
  gateway?: GatewayService;
};

export type ApiServerConfig = {
  httpServer: HttpServerConfig;
};

export type PageServerConfig = {
  devServerUrl?: string | undefined;
  staticDir?: string | undefined;
  customRegister?: ((server: unknown) => Promise<void> | void) | undefined;
  apiPrefix?: string | undefined;
};

export enum ApiServerType {
  SERVER = "SERVER",
  GATEWAY = "GATEWAY",
}
/**
 * Type alias for ApiServerType - represents the type of server (API or Gateway)
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ServerType = ApiServerType;

type ProxyGateway = {
  upstream: string;
  prefix?: string;
};

type ProxiesGateway = Array<ProxyGateway>;

type GatewayService = { proxies: ProxiesGateway };
