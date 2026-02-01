import fs from "fs";
import path from "path";
import type { I18nAdapter } from "../types";

/**
 * Filesystem-based i18n adapter.
 * Loads translations from JSON files organized as: localesDir/language.json
 *
 * @example
 * const adapter = new FilesystemAdapter('./src/localization/locales');
 */
export class FilesystemAdapter implements I18nAdapter {
  private localesDir: string;

  constructor(localesDir: string) {
    this.localesDir = localesDir;
  }

  init(): void {
    if (!fs.existsSync(this.localesDir)) {
      throw new Error(`Locales directory not found: ${this.localesDir}`);
    }
  }

  loadResources(
    language: string,
    _namespace: string = "translation",
  ): Record<string, unknown> | null {
    const filePath = path.join(this.localesDir, `${language}.json`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to load translations from ${filePath}: ${errorMessage}`,
      );
    }
  }
}

/**
 * Memory-based i18n adapter.
 * Stores translations in-memory; useful for testing and embedded scenarios.
 *
 * @example
 * const adapter = new MemoryAdapter({
 *   en: { translation: { greeting: 'Hello' } }
 * });
 */
export class MemoryAdapter implements I18nAdapter {
  private resources: Record<string, Record<string, Record<string, unknown>>>;

  constructor(
    resources: Record<string, Record<string, Record<string, unknown>>> = {},
  ) {
    this.resources = resources;
  }

  loadResources(
    language: string,
    namespace: string = "translation",
  ): Record<string, unknown> | null {
    return this.resources[language]?.[namespace] ?? null;
  }

  saveResources(
    language: string,
    namespace: string,
    resources: Record<string, unknown>,
  ): void {
    if (!this.resources[language]) {
      this.resources[language] = {};
    }
    this.resources[language]![namespace] = resources;
  }

  /**
   * Get all stored resources (for testing/inspection).
   */
  getAll(): Record<string, Record<string, Record<string, unknown>>> {
    return { ...this.resources };
  }
}
