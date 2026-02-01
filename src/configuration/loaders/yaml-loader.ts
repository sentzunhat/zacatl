import { readFileSync } from "fs";
import { resolve } from "path";
import { load } from "js-yaml";
import type { ConfigLoader, ConfigFormat } from "../types";

/**
 * YAML configuration file loader
 * Supports both .yaml and .yml extensions
 */
export class YAMLLoader<T = unknown> implements ConfigLoader<T> {
  readonly extensions: readonly ConfigFormat[] = ["yaml", "yml"] as const;

  load(filePath: string): T {
    const resolvedPath = resolve(filePath);
    const content = readFileSync(resolvedPath, "utf-8");
    return this.parse(content);
  }

  parse(content: string): T {
    const result = load(content);
    if (result === null || result === undefined) {
      throw new Error("YAML file is empty or invalid");
    }
    return result as T;
  }
}

/**
 * Factory function to create a YAML loader instance
 */
export const createYAMLLoader = <T = unknown>(): YAMLLoader<T> =>
  new YAMLLoader<T>();
