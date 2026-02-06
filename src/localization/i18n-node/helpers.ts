/**
 * Helper utilities for i18n-node integration.
 * @module localization/i18n-node/helpers
 */

import fs from "fs";

import { BadRequestError } from "../../error/index";

/**
 * Type guard: check if value is a plain object.
 */
export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
};

/**
 * Deep merge two objects recursively.
 * Nested objects are merged; primitive values are overwritten.
 */
export const deepMerge = (
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = out[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      out[key] = deepMerge(baseValue, overrideValue);
      continue;
    }

    out[key] = overrideValue;
  }

  return out;
};

/**
 * Read and parse a JSON file.
 * Throws if the file content is not a plain object.
 */
export const readJsonFile = (filePath: string): Record<string, unknown> => {
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(content);

  if (!isPlainObject(parsed)) {
    throw new BadRequestError({
      message: `Invalid locale JSON shape in ${filePath}`,
      reason: "Locale file must contain a plain JSON object",
      component: "I18nNode",
      operation: "readJsonFile",
      metadata: { filePath },
    });
  }

  return parsed;
};

/**
 * Find the first existing directory from a list of candidates.
 * Returns null if none exist.
 */
export const findExistingDir = (candidates: string[]): string | null => {
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      // Ignore errors and try next candidate
    }
  }

  return null;
};
