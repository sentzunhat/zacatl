import type { RuntimeInfo, RuntimeType } from "./types";

/**
 * Detects the current JavaScript runtime environment
 * @returns Runtime information including type and version
 */
export const detectRuntime = (): RuntimeInfo => {
  let type: RuntimeType = "unknown";
  let version: string | undefined = undefined;

  // Check for Node.js
  if (typeof process !== "undefined" && process.versions?.node) {
    type = "node";
    version = process.versions.node;
  }

  const result: RuntimeInfo = {
    type,
    isBun: false,
    isNode: type === "node",
  };

  if (version !== undefined) {
    result.version = version;
  }

  return result;
};

/**
 * Check if the current runtime is Node.js
 * @returns true if running on Node.js
 */
export const isNode = (): boolean =>
  typeof process !== "undefined" && !!process.versions?.node;

/**
 * Get the current runtime type
 * @returns The detected runtime type
 */
export const getRuntimeType = (): RuntimeType => detectRuntime().type;

/**
 * Get the current runtime version
 * @returns The runtime version string or undefined
 */
export const getRuntimeVersion = (): string | undefined =>
  detectRuntime().version;
