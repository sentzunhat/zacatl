import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { loadConfig } from "../../../src/configuration/loader";

const TEST_DIR = __dirname;
const JSON_FILE = join(TEST_DIR, "test-config.json");
const YAML_FILE = join(TEST_DIR, "test-config.yaml");

const ConfigSchema = z.object({
  server: z.object({
    port: z.number().min(80),
    host: z.string(),
  }),
  debug: z.boolean().default(false),
});

describe("Configuration Loader", () => {
  beforeAll(() => {
    // Setup temporary config files
    writeFileSync(
      JSON_FILE,
      JSON.stringify({
        server: { port: 3000, host: "localhost" },
        debug: true,
      }),
    );
    writeFileSync(
      YAML_FILE,
      "server:\n  port: 8080\n  host: 0.0.0.0\ndebug: false",
    );
  });

  afterAll(() => {
    // Cleanup
    if (existsSync(JSON_FILE)) unlinkSync(JSON_FILE);
    if (existsSync(YAML_FILE)) unlinkSync(YAML_FILE);
  });

  it("should load and validate JSON config", () => {
    const result = loadConfig(JSON_FILE, "json", ConfigSchema);

    expect(result.format).toBe("json");
    expect(result.filePath).toBe(JSON_FILE);
    expect(result.data.server.port).toBe(3000);
    expect(result.data.server.host).toBe("localhost");
    expect(result.data.debug).toBe(true);
  });

  it("should load and validate YAML config", () => {
    const result = loadConfig(YAML_FILE, "yaml", ConfigSchema);

    expect(result.format).toBe("yaml");
    expect(result.filePath).toBe(YAML_FILE);
    expect(result.data.server.port).toBe(8080);
    expect(result.data.debug).toBe(false);
  });

  it("should throw error if config file does not exist", () => {
    expect(() => {
      loadConfig("non-existent.json", "json", ConfigSchema);
    }).toThrow(/Config file not found/);
  });

  it("should throw Zod error if config is invalid", () => {
    // Create invalid config file
    const INVALID_FILE = join(TEST_DIR, "invalid.json");
    writeFileSync(
      INVALID_FILE,
      JSON.stringify({
        server: { port: "invalid-port", host: "localhost" }, // Port should be number
      }),
    );

    try {
      expect(() => {
        loadConfig(INVALID_FILE, "json", ConfigSchema);
      }).toThrow();
    } finally {
      if (existsSync(INVALID_FILE)) unlinkSync(INVALID_FILE);
    }
  });

  it("should load without schema (type is unknown/generic)", () => {
    const result = loadConfig(JSON_FILE, "json");
    expect(result.data).toBeDefined();
    expect((result.data as any).server.port).toBe(3000);
  });
});
