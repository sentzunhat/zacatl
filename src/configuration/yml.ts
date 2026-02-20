import { readFileSync } from "fs";

import { BadRequestError, NotFoundError, ValidationError } from "@zacatl/error";
import type { ZodType } from "@zacatl/third-party";
import { isNodeError, isZodError } from "@zacatl/utils";
import { load } from "js-yaml";

export const loadYML = <T = unknown>(filePath: string, schema?: ZodType<T>): T => {
  try {
    const content = readFileSync(filePath, "utf-8");
    const data = load(content);

    if (schema) {
      return schema.parse(data);
    }

    return data as T;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      throw new NotFoundError({
        message: `YAML file not found: ${filePath}`,
        component: "YAMLLoader",
        operation: "loadYML",
      });
    }

    if (error instanceof Error && error.message.includes("YAML")) {
      throw new BadRequestError({
        message: `Invalid YAML in file: ${filePath}`,
        reason: error.message,
        component: "YAMLLoader",
        operation: "loadYML",
      });
    }

    if (isZodError(error)) {
      throw new ValidationError({
        message: `YAML validation failed for file: ${filePath}`,
        reason: "Data doesn't match the expected schema",
        component: "YAMLLoader",
        operation: "loadYML",
        metadata: {
          filePath,
          issues: error.issues,
        },
      });
    }

    throw error;
  }
};

export const loadYAML = loadYML;
