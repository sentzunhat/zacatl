import { describe, it, expect, vi, beforeEach } from "vitest";
import { z } from "zod";
import {
  getLoader,
  loadConfig,
  loadConfigFromPaths,
} from "../../../src/configuration/loader";
import { YAMLLoader } from "../../../src/configuration/loaders/yaml-loader";
import { JSONLoader } from "../../../src/configuration/loaders/json-loader";
import * as fs from "fs";

vi.mock("fs", () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
}));

describe("Configuration Loaders (Explicit Format)", () => {
  describe("getLoader", () => {
    it("should return JSONLoader for json format", () => {
      const loader = getLoader("json");
      expect(loader).toBeInstanceOf(JSONLoader);
    });

    it("should return YAMLLoader for yaml format", () => {
      const loader = getLoader("yaml");
      expect(loader).toBeInstanceOf(YAMLLoader);
    });
  });

  describe("loadConfig", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should throw if file not found", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      expect(() => loadConfig("missing.json", "json")).toThrow(
        "Config file not found",
      );
    });

    it("should load json with explicit format", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('{"key": "value"}');

      const result = loadConfig<{ key: string }>("config.json", "json");

      expect(result.data).toEqual({ key: "value" });
      expect(result.format).toBe("json");
    });

    it("should validate data when schema is provided", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('{"port": 3000}');

      const schema = z.object({ port: z.number().min(1) });
      const result = loadConfig("config.json", "json", schema);

      expect(result.data).toEqual({ port: 3000 });
      expect(result.format).toBe("json");
    });

    it("should throw when schema validation fails", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('{"port": "oops"}');

      const schema = z.object({ port: z.number() });
      expect(() => loadConfig("config.json", "json", schema)).toThrow();
    });

    it("should load yaml with explicit format", () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue("key: value");

      const result = loadConfig<{ key: string }>("config.yaml", "yaml");

      expect(result.data).toEqual({ key: "value" });
      expect(result.format).toBe("yaml");
    });
  });

  describe("loadConfigFromPaths", () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it("should load from first existing path", () => {
      vi.mocked(fs.existsSync).mockImplementation(
        (path) => path === "exist.yaml",
      );
      vi.mocked(fs.readFileSync).mockReturnValue("key: value");

      const result = loadConfigFromPaths<{ key: string }>([
        { path: "missing.json", format: "json" },
        { path: "exist.yaml", format: "yaml" },
      ]);

      expect(result.data).toEqual({ key: "value" });
      expect(result.format).toBe("yaml");
      expect(result.filePath).toBe("exist.yaml");
    });

    it("should validate data when schema is provided", () => {
      vi.mocked(fs.existsSync).mockImplementation(
        (path) => path === "exist.json",
      );
      vi.mocked(fs.readFileSync).mockReturnValue(
        '{"port": 8080, "host": "localhost"}',
      );

      const schema = z.object({
        port: z.number().min(1),
        host: z.string(),
      });

      const result = loadConfigFromPaths(
        [{ path: "exist.json", format: "json" }],
        schema,
      );

      expect(result.data).toEqual({ port: 8080, host: "localhost" });
      expect(result.format).toBe("json");
    });

    it("should throw if no files exist", () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      expect(() =>
        loadConfigFromPaths([
          { path: "a.json", format: "json" },
          { path: "b.yaml", format: "yaml" },
        ]),
      ).toThrow("No config file found");
    });
  });
});
