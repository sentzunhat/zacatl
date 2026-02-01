import type { ZodSchema } from "zod";
import type { LoadedConfig } from "./types";

/**
 * Validate configuration data against a Zod schema
 * @param data - Raw configuration data
 * @param schema - Zod schema to validate against
 * @returns Validated and typed configuration
 */
export const validateConfig = <T>(data: unknown, schema: ZodSchema<T>): T => {
  return schema.parse(data);
};

/**
 * Validate loaded configuration with a Zod schema
 * Returns validated data with preserved metadata
 */
export const validateLoadedConfig = <T>(
  loaded: LoadedConfig<unknown>,
  schema: ZodSchema<T>,
): LoadedConfig<T> => {
  const validatedData = validateConfig(loaded.data, schema);

  return {
    data: validatedData,
    filePath: loaded.filePath,
    format: loaded.format,
  };
};

/**
 * Safe validation that returns success/error result
 */
export const safeValidateConfig = <T>(
  data: unknown,
  schema: ZodSchema<T>,
):
  | { success: true; data: T }
  | { success: false; error: { issues: unknown[] } } => {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return {
    success: false,
    error: { issues: result.error.issues },
  };
};
