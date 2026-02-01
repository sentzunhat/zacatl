/**
 * Example: FileSystem Provider Implementation
 *
 * Handles reading and writing configuration files (YAML, JSON, CSV)
 * Useful for CLI applications that manage config files
 *
 * Installation: npm install js-yaml
 *
 * @example
 * ```typescript
 * const fsProvider = new FileSystemProvider();
 * const config = await fsProvider.readYAML('~/.config/app/config.yaml');
 * await fsProvider.writeJSON('~/.config/app/state.json', state);
 * ```
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { CustomError } from "../../error";

export interface FileSystemProviderConfig {
  encoding?: BufferEncoding;
}

/**
 * Expand ~/ to home directory path
 */
const expandUserPath = (filePath: string): string => {
  if (filePath.startsWith("~/")) {
    return filePath.replace("~", homedir());
  }
  return filePath;
};

/**
 * FileSystem provider for configuration management
 * Supports YAML, JSON, and plain text files
 */
export class FileSystemProvider {
  private encoding: BufferEncoding;

  constructor(config: FileSystemProviderConfig = {}) {
    this.encoding = config.encoding || "utf-8";
  }

  /**
   * Read YAML file
   */
  readYAML = (filePath: string): Record<string, unknown> => {
    const path = expandUserPath(filePath);

    try {
      if (!existsSync(path)) {
        throw new CustomError({
          message: `File not found: ${filePath}`,
          code: 404,
          reason: "file does not exist",
        });
      }

      const yaml = require("js-yaml"); // Lazy load
      const content = readFileSync(path, this.encoding);
      return yaml.load(content) as Record<string, unknown>;
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to read YAML file: ${filePath}`,
        code: 500,
        reason: "file read error",
        error: error as Error,
        metadata: { filePath },
      });
    }
  };

  /**
   * Read JSON file
   */
  readJSON = (filePath: string): unknown => {
    const path = expandUserPath(filePath);

    try {
      if (!existsSync(path)) {
        throw new CustomError({
          message: `File not found: ${filePath}`,
          code: 404,
          reason: "file does not exist",
        });
      }

      const content = readFileSync(path, this.encoding);
      return JSON.parse(content);
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to read JSON file: ${filePath}`,
        code: 500,
        reason: "file read error",
        error: error as Error,
        metadata: { filePath },
      });
    }
  };

  /**
   * Read plain text file
   */
  readText = (filePath: string): string => {
    const path = expandUserPath(filePath);

    try {
      if (!existsSync(path)) {
        throw new CustomError({
          message: `File not found: ${filePath}`,
          code: 404,
          reason: "file does not exist",
        });
      }

      return readFileSync(path, this.encoding);
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to read text file: ${filePath}`,
        code: 500,
        reason: "file read error",
        error: error as Error,
        metadata: { filePath },
      });
    }
  };

  /**
   * Write YAML file
   */
  writeYAML = (filePath: string, data: Record<string, unknown>): void => {
    const path = expandUserPath(filePath);

    try {
      const yaml = require("js-yaml"); // Lazy load
      const content = yaml.dump(data);
      writeFileSync(path, content, this.encoding);
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to write YAML file: ${filePath}`,
        code: 500,
        reason: "file write error",
        error: error as Error,
        metadata: { filePath },
      });
    }
  };

  /**
   * Write JSON file
   */
  writeJSON = (filePath: string, data: unknown, pretty = true): void => {
    const path = expandUserPath(filePath);

    try {
      const content = pretty
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      writeFileSync(path, content, this.encoding);
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to write JSON file: ${filePath}`,
        code: 500,
        reason: "file write error",
        error: error as Error,
        metadata: { filePath },
      });
    }
  };

  /**
   * Write plain text file
   */
  writeText = (filePath: string, content: string): void => {
    const path = expandUserPath(filePath);

    try {
      writeFileSync(path, content, this.encoding);
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to write text file: ${filePath}`,
        code: 500,
        reason: "file write error",
        error: error as Error,
        metadata: { filePath },
      });
    }
  };

  /**
   * Check if file exists
   */
  exists(filePath: string): boolean {
    const path = expandUserPath(filePath);
    return existsSync(path);
  }
}
