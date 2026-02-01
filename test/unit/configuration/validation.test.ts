import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  validateConfig,
  validateLoadedConfig,
  safeValidateConfig,
} from "../../../src/configuration/validation";
import type { LoadedConfig } from "../../../src/configuration/types";

describe("Configuration Validation", () => {
  const TestSchema = z.object({
    port: z.number().min(1000).max(65535),
    host: z.string(),
    debug: z.boolean().optional(),
  });

  type TestConfig = z.infer<typeof TestSchema>;

  describe("validateConfig", () => {
    it("should validate valid config data", () => {
      const data = {
        port: 3000,
        host: "localhost",
        debug: true,
      };

      const result = validateConfig(data, TestSchema);

      expect(result).toEqual(data);
      expect(result.port).toBe(3000);
    });

    it("should throw on invalid data", () => {
      const data = {
        port: 99999, // exceeds max
        host: "localhost",
      };

      expect(() => validateConfig(data, TestSchema)).toThrow();
    });

    it("should throw on missing required fields", () => {
      const data = {
        port: 3000,
        // missing host
      };

      expect(() => validateConfig(data, TestSchema)).toThrow();
    });

    it("should coerce types when schema allows", () => {
      const CoerceSchema = z.object({
        port: z.coerce.number(),
        enabled: z.coerce.boolean(),
      });

      const data = {
        port: "3000",
        enabled: "true",
      };

      const result = validateConfig(data, CoerceSchema);

      expect(result.port).toBe(3000);
      expect(result.enabled).toBe(true);
    });

    it("should provide type inference", () => {
      const data = { port: 8080, host: "0.0.0.0", debug: false };
      const result = validateConfig(data, TestSchema);

      // Type check - should not error
      const port: number = result.port;
      const host: string = result.host;
      const debug: boolean | undefined = result.debug;

      expect(port).toBe(8080);
      expect(host).toBe("0.0.0.0");
      expect(debug).toBe(false);
    });
  });

  describe("validateLoadedConfig", () => {
    it("should validate loaded config and preserve metadata", () => {
      const loaded: LoadedConfig<unknown> = {
        data: { port: 3000, host: "localhost" },
        filePath: "/path/to/config.json",
        format: "json",
      };

      const result = validateLoadedConfig(loaded, TestSchema);

      expect(result.data).toEqual({ port: 3000, host: "localhost" });
      expect(result.filePath).toBe("/path/to/config.json");
      expect(result.format).toBe("json");
    });

    it("should throw on invalid loaded config", () => {
      const loaded: LoadedConfig<unknown> = {
        data: { port: "invalid" },
        filePath: "/path/to/config.yaml",
        format: "yaml",
      };

      expect(() => validateLoadedConfig(loaded, TestSchema)).toThrow();
    });

    it("should maintain type safety with validated data", () => {
      const loaded: LoadedConfig<unknown> = {
        data: { port: 8080, host: "api.example.com", debug: true },
        filePath: "/etc/app/config.yaml",
        format: "yaml",
      };

      const result = validateLoadedConfig(loaded, TestSchema);

      // Type assertions should work
      const config: TestConfig = result.data;
      expect(config.port).toBe(8080);
      expect(config.host).toBe("api.example.com");
      expect(config.debug).toBe(true);
    });
  });

  describe("safeValidateConfig", () => {
    it("should return success for valid data", () => {
      const data = { port: 3000, host: "localhost" };
      const result = safeValidateConfig(data, TestSchema);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.port).toBe(3000);
        expect(result.data.host).toBe("localhost");
      }
    });

    it("should return error for invalid data", () => {
      const data = { port: 100, host: "localhost" }; // port too low
      const result = safeValidateConfig(data, TestSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeDefined();
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it("should return error with issue details", () => {
      const data = { port: "not-a-number" };
      const result = safeValidateConfig(data, TestSchema);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toBeInstanceOf(Array);
      }
    });

    it("should provide type narrowing", () => {
      const data = { port: 4000, host: "example.com", debug: false };
      const result = safeValidateConfig(data, TestSchema);

      if (result.success) {
        // Should have typed data
        const port: number = result.data.port;
        const host: string = result.data.host;
        expect(port).toBe(4000);
        expect(host).toBe("example.com");
      } else {
        // Should have error
        const issues = result.error.issues;
        expect(issues).toBeDefined();
      }
    });
  });

  describe("complex schema validation", () => {
    it("should handle nested objects", () => {
      const NestedSchema = z.object({
        server: z.object({
          port: z.number(),
          host: z.string(),
        }),
        database: z.object({
          url: z.string().url(),
          poolSize: z.number().default(10),
        }),
      });

      const data = {
        server: { port: 3000, host: "localhost" },
        database: { url: "mongodb://localhost:27017" },
      };

      const result = validateConfig(data, NestedSchema);

      expect(result.server.port).toBe(3000);
      expect(result.database.poolSize).toBe(10); // default applied
    });

    it("should handle arrays", () => {
      const ArraySchema = z.object({
        allowedHosts: z.array(z.string()),
        ports: z.array(z.number().min(1000)),
      });

      const data = {
        allowedHosts: ["localhost", "127.0.0.1"],
        ports: [3000, 8080],
      };

      const result = validateConfig(data, ArraySchema);

      expect(result.allowedHosts).toHaveLength(2);
      expect(result.ports).toEqual([3000, 8080]);
    });

    it("should handle unions and enums", () => {
      const UnionSchema = z.object({
        logLevel: z.enum(["debug", "info", "warn", "error"]),
        mode: z.union([z.literal("development"), z.literal("production")]),
      });

      const data = {
        logLevel: "info",
        mode: "production",
      };

      const result = validateConfig(data, UnionSchema);

      expect(result.logLevel).toBe("info");
      expect(result.mode).toBe("production");
    });

    it("should apply transformations", () => {
      const TransformSchema = z.object({
        apiKey: z.string().transform((val) => val.toUpperCase()),
        maxRetries: z.number().transform((val) => Math.max(1, val)),
      });

      const data = {
        apiKey: "abc123",
        maxRetries: 0,
      };

      const result = validateConfig(data, TransformSchema);

      expect(result.apiKey).toBe("ABC123");
      expect(result.maxRetries).toBe(1);
    });
  });
});
