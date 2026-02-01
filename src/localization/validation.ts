import { z } from "zod";

/**
 * Zod schema for validating i18n configuration.
 * Ensures all required language files and namespaces are present.
 */
export const I18nConfigSchema = z.object({
  defaultLanguage: z.string().default("en").describe("Default language code"),
  fallbackLanguage: z.string().default("en").describe("Fallback language code"),
  supportedLanguages: z
    .array(z.string())
    .default(["en"])
    .describe("List of supported language codes"),
  defaultNamespace: z
    .string()
    .default("translation")
    .describe("Default translation namespace"),
});

/**
 * Validate a configuration object against the I18n schema.
 * Throws ZodError if validation fails.
 */
export const validateI18nConfig = (
  config: unknown,
): ReturnType<typeof I18nConfigSchema.parse> => {
  return I18nConfigSchema.parse(config);
};

/**
 * Safe version of validateI18nConfig.
 * Returns { success: true, data } or { success: false, errors }.
 */
export const safeValidateI18nConfig = (
  config: unknown,
):
  | { success: true; data: z.infer<typeof I18nConfigSchema> }
  | { success: false; errors: z.ZodError } => {
  const result = I18nConfigSchema.safeParse(config);
  return result.success
    ? { success: true, data: result.data }
    : { success: false, errors: result.error };
};
