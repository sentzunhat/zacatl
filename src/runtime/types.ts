/**
 * Supported JavaScript runtimes
 */
export type RuntimeType = "node" | "bun" | "unknown";

/**
 * Runtime detection result
 */
export interface RuntimeInfo {
  /** The detected runtime type */
  type: RuntimeType;
  /** Runtime version string (if available) */
  version?: string;
  /** Whether the runtime is Bun */
  isBun: boolean;
  /** Whether the runtime is Node.js */
  isNode: boolean;
}
