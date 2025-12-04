import { FastifyInstance } from "fastify";
import fastifyStatic from "@fastify/static";
import proxy from "@fastify/http-proxy";
import path from "path";
import fs from "fs";

export type PageModuleConfig = {
  /**
   * The URL of the development server (e.g., http://localhost:5173).
   * If provided, requests will be proxied to this URL.
   */
  devServerUrl?: string;
  /**
   * The directory containing the static build files (e.g., dist, build).
   * Required for production mode.
   */
  staticDir?: string;
  /**
   * The prefix for API routes. Requests starting with this prefix will NOT be handled by the page module.
   * Defaults to "/api".
   */
  apiPrefix?: string;
  /**
   * A custom registration function for advanced setups (e.g. Vite Middleware Mode).
   * If provided, this takes precedence over devServerUrl and staticDir.
   */
  customRegister?: (server: FastifyInstance) => Promise<void> | void;
};

export class PageModule {
  private config: PageModuleConfig;

  constructor(config: PageModuleConfig) {
    this.config = config;
  }

  public async register(server: FastifyInstance): Promise<void> {
    const {
      devServerUrl,
      staticDir,
      apiPrefix = "/api",
      customRegister,
    } = this.config;

    if (customRegister) {
      await customRegister(server);
      return;
    }

    if (devServerUrl) {
      // Development mode: Proxy to dev server
      await server.register(proxy, {
        upstream: devServerUrl,
        prefix: "/",
        http2: false,
        replyOptions: {
          onError: (reply, error) => {
            server.log.error(error);
            reply.send(error);
          },
        },
      });
      // server.log.info(`PageModule: Proxying to dev server at ${devServerUrl}`);
    } else if (staticDir) {
      // Production mode: Serve static files
      const absoluteStaticDir = path.resolve(process.cwd(), staticDir);

      if (!fs.existsSync(absoluteStaticDir)) {
        throw new Error(
          `PageModule: Static directory not found at ${absoluteStaticDir}`
        );
      }

      await server.register(fastifyStatic, {
        root: absoluteStaticDir,
        prefix: "/",
        wildcard: false, // Disable wildcard to handle SPA routing manually if needed
      });

      // SPA Fallback: Serve index.html for non-API routes that don't match a static file
      server.setNotFoundHandler(async (request, reply) => {
        if (request.raw.url?.startsWith(apiPrefix)) {
          // It's an API request, return 404 JSON
          reply.status(404).send({
            message: "Route not found",
            error: "Not Found",
            statusCode: 404,
          });
        } else {
          // It's a page request, serve index.html
          reply.sendFile("index.html");
        }
      });

      // server.log.info(`PageModule: Serving static files from ${absoluteStaticDir}`);
    } else {
      // No config provided, do nothing or warn
      // server.log.warn("PageModule: No devServerUrl or staticDir provided. Page module is inactive.");
    }
  }
}
