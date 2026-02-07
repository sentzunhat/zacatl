import fastifyStatic from "@fastify/static";
import { Express } from "express";
import express from "express";
import { FastifyInstance } from "fastify";

import { type PageServerPort, type StaticConfig } from "./port";

/**
 * FastifyPageAdapter - Implements PageServerPort for Fastify framework
 * Handles static files and SPA fallback routing
 */
export class FastifyPageAdapter implements PageServerPort {
  constructor(private server: FastifyInstance) {}

  registerStaticFiles(config: StaticConfig): void {
    this.server.register(fastifyStatic, {
      root: config.root,
      ...(config.prefix ? { prefix: config.prefix } : {}),
    });
  }

  registerSpaFallback(apiPrefix: string, staticDir: string): void {
    this.server.setNotFoundHandler(async (request, reply) => {
      if (request.raw.url?.startsWith(apiPrefix)) {
        reply.status(404).send({
          code: 404,
          error: "Not Found",
          message: `Route ${request.method}:${request.url} not found`,
        });
      } else {
        reply.sendFile("index.html", staticDir);
      }
    });
  }

  async register(): Promise<void> {
    // Custom registration logic if needed
  }
}

/**
 * ExpressPageAdapter - Implements PageServerPort for Express framework
 * Handles static files and SPA fallback routing
 */
export class ExpressPageAdapter implements PageServerPort {
  constructor(private server: Express) {}

  registerStaticFiles(config: StaticConfig): void {
    this.server.use(config.prefix || "/", express.static(config.root));
  }

  registerSpaFallback(apiPrefix: string, staticDir: string): void {
    this.server.use((req, res, _next) => {
      if (req.path.startsWith(apiPrefix)) {
        res.status(404).json({
          code: 404,
          error: "Not Found",
          message: `Route ${req.method}:${req.path} not found`,
        });
      } else {
        res.sendFile("index.html", { root: staticDir });
      }
    });
  }

  async register(): Promise<void> {
    // Custom registration logic if needed
  }
}
