import { describe, it, expect } from "vitest";
import {
  configureI18nNode,
  loadCatalog,
  resolveBuiltInLocalesDir,
  mergeCatalogs,
} from "../../src/localization";

describe("i18n-node", () => {
  describe("loadCatalog", () => {
    it("should load translations from filesystem", () => {
      const catalog = loadCatalog({
        localesDir: `${process.cwd()}/src/localization/locales`,
        supportedLocales: ["en"],
      });

      expect(catalog["en"] as any).toBeDefined();
      expect((catalog["en"] as any)?.["ERROR_MESSAGES"]).toBeDefined();
      expect((catalog["en"] as any)?.["SUCCESS_MESSAGES"]).toBeDefined();
    });

    it("should skip non-existent languages", () => {
      const catalog = loadCatalog({
        localesDir: `${process.cwd()}/src/localization/locales`,
        supportedLocales: ["xx"],
      });

      expect(catalog["xx"] as any).toBeUndefined();
    });

    it("should load multiple locales", () => {
      const catalog = loadCatalog({
        localesDir: `${process.cwd()}/src/localization/locales`,
        supportedLocales: ["en", "es"],
      });

      expect(catalog["en"] as any).toBeDefined();
      expect(catalog["es"] as any).toBeDefined();
    });
  });

  describe("resolveBuiltInLocalesDir", () => {
    it("should find built-in locales directory", () => {
      const dir = resolveBuiltInLocalesDir();
      expect(dir).toBeDefined();
      expect(dir).toContain("locales");
    });
  });

  describe("mergeCatalogs", () => {
    it("should merge catalogs with override", () => {
      const base = {
        en: { greeting: "Hello", farewell: "Goodbye" },
      };

      const additions = [
        {
          en: { greeting: "Hi" },
        },
      ];

      const merged = mergeCatalogs({
        base,
        additions,
        overrideBuiltIn: true,
      });

      expect((merged["en"] as any)?.["greeting"]).toBe("Hi");
      expect((merged["en"] as any)?.["farewell"]).toBe("Goodbye");
    });

    it("should merge catalogs without override", () => {
      const base = {
        en: { greeting: "Hello", farewell: "Goodbye" },
      };

      const additions = [
        {
          en: { greeting: "Hi" },
        },
      ];

      const merged = mergeCatalogs({
        base,
        additions,
        overrideBuiltIn: false,
      });

      expect((merged["en"] as any)?.["greeting"]).toBe("Hello");
      expect((merged["en"] as any)?.["farewell"]).toBe("Goodbye");
    });

    it("should merge multiple additions", () => {
      const base = {
        en: { a: "1" },
      };

      const additions = [{ en: { b: "2" } }, { en: { c: "3" } }];

      const merged = mergeCatalogs({
        base,
        additions,
        overrideBuiltIn: true,
      });

      expect((merged["en"] as any)?.["a"]).toBe("1");
      expect((merged["en"] as any)?.["b"]).toBe("2");
      expect((merged["en"] as any)?.["c"]).toBe("3");
    });

    it("should handle nested objects", () => {
      const base = {
        en: {
          messages: {
            greeting: "Hello",
            farewell: "Goodbye",
          },
        },
      };

      const additions = [
        {
          en: {
            messages: {
              greeting: "Hi",
            },
          },
        },
      ];

      const merged = mergeCatalogs({
        base,
        additions,
        overrideBuiltIn: true,
      });

      expect(((merged["en"] as any)?.["messages"] as any).greeting).toBe("Hi");
      expect(((merged["en"] as any)?.["messages"] as any).farewell).toBe(
        "Goodbye",
      );
    });
  });

  describe("configureI18nNode", () => {
    it("should configure with defaults", () => {
      const i18n = configureI18nNode();
      expect(i18n).toBeDefined();
    });

    it("should configure with custom locales", () => {
      const i18n = configureI18nNode({
        locales: {
          default: "es",
          supported: ["en", "es"],
        },
      });
      expect(i18n).toBeDefined();
    });

    it("should merge built-in and custom catalogs", () => {
      const i18n = configureI18nNode({
        locales: {
          default: "en",
          supported: ["en"],
        },
        overrideBuiltIn: true,
      });
      expect(i18n).toBeDefined();
    });
  });
});
