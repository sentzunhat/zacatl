import { describe, it, expect } from "vitest";
import { YAMLLoader } from "../../../src/configuration/loaders/yaml-loader";
import { JSONLoader } from "../../../src/configuration/loaders/json-loader";

describe("Loaders", () => {
  describe("JSONLoader", () => {
    const loader = new JSONLoader();

    it("should parse valid JSON string", () => {
      const content = '{"name": "test", "val": 123}';
      const result = loader.parse(content);
      expect(result).toEqual({ name: "test", val: 123 });
    });

    it("should strip comments from JSON (JSONC support)", () => {
      const content = `
        {
          // This is a comment
          "name": "test", /* another comment */
          "val": 123
        }
      `;
      const result = loader.parse(content);
      expect(result).toEqual({ name: "test", val: 123 });
    });
  });

  describe("YAMLLoader", () => {
    const loader = new YAMLLoader();

    it("should parse valid YAML string", () => {
      const content = `
name: test
nested:
  val: 123
list:
  - a
  - b
`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = loader.parse(content) as any;
      expect(result.name).toBe("test");
      expect(result.nested.val).toBe(123);
      expect(result.list).toEqual(["a", "b"]);
    });

    it("should throw on empty/invalid input", () => {
      // js-yaml might return undefined for empty string or null, our loader throws
      expect(() => loader.parse("")).toThrow();
    });
  });
});
