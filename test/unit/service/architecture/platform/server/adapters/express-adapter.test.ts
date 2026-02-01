import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExpressAdapter } from "../../../../../../../src/service/architecture/platform/server/adapters/express-adapter";
import { RouteHandler } from "../../../../../../../src/service/architecture/application";
import { z } from "zod";

// Mock http-proxy-middleware
vi.mock("http-proxy-middleware", () => ({
  createProxyMiddleware: vi.fn().mockReturnValue("proxy-middleware"),
}));

import { createProxyMiddleware } from "http-proxy-middleware";

describe("ExpressAdapter", () => {
  let adapter: ExpressAdapter;
  let mockServer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      use: vi.fn(),
      all: vi.fn(),
    };
    adapter = new ExpressAdapter(mockServer);
  });

  describe("registerRoute", () => {
    it("should register a route with the correct method and url", () => {
      const handler: RouteHandler = {
        method: "GET",
        url: "/test",
        handler: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.get).toHaveBeenCalledWith(
        "/test",
        expect.any(Function),
      );
    });

    it("should handle request validation", async () => {
      const handler: RouteHandler = {
        method: "POST",
        url: "/validate",
        schema: {
          body: z.object({ name: z.string() }),
        },
        execute: vi.fn().mockResolvedValue({ success: true }),
      } as any;

      adapter.registerRoute(handler);

      // Get the callback registered with express
      const callback = mockServer.post.mock.calls[0][1];

      const req = {
        body: { name: "Valid" },
        query: {},
        params: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        send: vi.fn(),
        headersSent: false,
      };
      const next = vi.fn();

      await callback(req, res, next);

      expect(handler.execute).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it("should handle validation errors", async () => {
      const handler: RouteHandler = {
        method: "POST",
        url: "/validate",
        schema: {
          body: z.object({ name: z.string() }),
        },
        execute: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      const callback = mockServer.post.mock.calls[0][1];

      const req = {
        body: { name: 123 }, // Invalid type
        query: {},
        params: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };
      const next = vi.fn();

      await callback(req, res, next);

      expect(handler.execute).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("registerHook", () => {
    it("should register middleware for hooks", () => {
      const handler: any = {
        name: "onRequest",
        execute: vi.fn(),
      };
      adapter.registerHook(handler);
      expect(mockServer.use).toHaveBeenCalled();
    });
  });

  describe("registerProxy", () => {
    it("should apply proxy middleware", () => {
      const config = {
        upstream: "http://upstream",
        prefix: "/api",
        rewritePrefix: "/remote",
      };

      adapter.registerProxy(config);

      expect(createProxyMiddleware).toHaveBeenCalledWith({
        target: "http://upstream",
        changeOrigin: true,
        pathRewrite: expect.any(Object),
      });
      expect(mockServer.use).toHaveBeenCalledWith("/api", "proxy-middleware");
    });
  });

  describe("serveStatic", () => {
    it("should serve static files", () => {
      const config = { root: "./public", prefix: "/static" };
      adapter.serveStatic(config);
      expect(mockServer.use).toHaveBeenCalledWith(
        "/static",
        expect.any(Function),
      );
    });
  });
});
