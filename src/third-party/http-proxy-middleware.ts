/**
 * http-proxy-middleware re-exports
 *
 * Used for API gateway and proxy functionality in Express/Fastify servers.
 */

export {
  createProxyMiddleware,
  type RequestHandler as ProxyRequestHandler,
} from "http-proxy-middleware";
