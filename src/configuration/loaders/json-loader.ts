import { readFileSync } from "fs";
import { resolve } from "path";
import type { ConfigLoader, ConfigFormat } from "../types";

/**
 * JSON configuration file loader
 * Supports standard JSON files with comments stripped
 */
export class JSONLoader<T = unknown> implements ConfigLoader<T> {
  readonly extensions: readonly ConfigFormat[] = ["json"] as const;

  load(filePath: string): T {
    const resolvedPath = resolve(filePath);
    const content = readFileSync(resolvedPath, "utf-8");
    return this.parse(content);
  }

  parse(content: string): T {
    // Remove comments (// and /* */) for JSONC support
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove /* */ comments
      .replace(/\/\/.*/g, ""); // Remove // comments

    return JSON.parse(cleanContent) as T;
  }
}

/**
 * Factory function to create a JSON loader instance
 */
export const createJSONLoader = <T = unknown>(): JSONLoader<T> =>
  new JSONLoader<T>();
