import { describe, it, expect } from "vitest";
import {
  detectRuntime,
  isNode,
  getRuntimeType,
  getRuntimeVersion,
} from "../../../src/runtime/detector";
import type { RuntimeType } from "../../../src/runtime/types";

describe("Runtime Detection", () => {
  describe("detectRuntime", () => {
    it("should detect the current runtime correctly", () => {
      const result = detectRuntime();

      expect(result).toBeDefined();
      expect(result.type).toBe("node");
      expect(result.version).toBeDefined();
      expect(result.version).toMatch(/^\d+\.\d+\.\d+/);

      // Verify the correct runtime flag is set (always Node.js in main package)
      expect(result.isNode).toBe(true);
      expect(result.isBun).toBe(false);
    });

    it("should return all required properties", () => {
      const result = detectRuntime();

      expect(result).toHaveProperty("type");
      expect(result).toHaveProperty("version");
      expect(result).toHaveProperty("isBun");
      expect(result).toHaveProperty("isNode");
    });
  });

  describe("isNode", () => {
    it("should correctly identify Node.js runtime", () => {
      expect(isNode()).toBe(true);
    });
  });

  describe("getRuntimeType", () => {
    it("should return the current runtime type", () => {
      expect(getRuntimeType()).toBe("node");
    });

    it("should return a valid RuntimeType", () => {
      const validTypes: RuntimeType[] = ["node", "bun", "unknown"];
      const type = getRuntimeType();

      expect(validTypes).toContain(type);
    });
  });

  describe("getRuntimeVersion", () => {
    it("should return a version string for the current runtime", () => {
      const version = getRuntimeVersion();

      expect(version).toBeDefined();
      expect(typeof version).toBe("string");
      expect(version).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe("Runtime detection edge cases", () => {
    it("should handle runtime detection consistently across multiple calls", () => {
      const result1 = detectRuntime();
      const result2 = detectRuntime();

      expect(result1.type).toBe(result2.type);
      expect(result1.version).toBe(result2.version);
      expect(result1.isNode).toBe(result2.isNode);
    });

    it("should maintain consistency between helper functions and detectRuntime", () => {
      const runtime = detectRuntime();

      expect(isNode()).toBe(runtime.isNode);
      expect(getRuntimeType()).toBe(runtime.type);
      expect(getRuntimeVersion()).toBe(runtime.version);
    });
  });
});
