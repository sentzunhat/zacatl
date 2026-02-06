import { readFileSync } from "fs";

import { BadRequestError, NotFoundError, ValidationError } from "@zacatl/error";
import type { ZodSchema } from "@zacatl/third-party";
import { isNodeError, isSyntaxError, isZodError } from "@zacatl/utils";

export function loadJSON<T = unknown>(
  filePath: string,
  schema?: ZodSchema<T>,
): T {
  try {
    const content = readFileSync(filePath, "utf-8");
    // Strip JSONC comments for .jsonc files
    const cleanContent = filePath.endsWith(".jsonc")
      ? content.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
      : content;

    const data = JSON.parse(cleanContent);

    if (schema) {
      return schema.parse(data);
    }

    return data as T;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new NotFoundError({
        message: `JSON file not found: ${filePath}`,
        component: "JSONLoader",
        operation: "loadJSON",
      });
    }

    if (isSyntaxError(error)) {
      throw new BadRequestError({
        message: `Invalid JSON in file: ${filePath}`,
        reason: error.message,
        component: "JSONLoader",
        operation: "loadJSON",
      });
    }

    if (isZodError(error)) {
      throw new ValidationError({
        message: `JSON validation failed for file: ${filePath}`,
        reason: "Data doesn't match the expected schema",
        component: "JSONLoader",
        operation: "loadJSON",
        metadata: {
          filePath,
          issues: error.issues,
        },
      });
    }

    throw error;
  }
}
