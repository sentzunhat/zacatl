import { HookHandler, RouteHandler } from "../../application";

export type ProxyConfig = {
  upstream: string;
  prefix: string;
  rewritePrefix?: string;
  http2?: boolean;
};

export type StaticConfig = {
  root: string;
  prefix?: string;
};

export interface ServerAdapter {
  registerRoute(handler: RouteHandler): void;
  registerHook(handler: HookHandler): void;
  registerProxy(config: ProxyConfig): void;
  serveStatic(config: StaticConfig): void;
  registerSpaFallback(apiPrefix: string, staticDir: string): void;
  listen(port: number): Promise<void>;
  getRawServer(): any;
}
