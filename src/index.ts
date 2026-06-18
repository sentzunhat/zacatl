/**
 * Root package entrypoint.
 *
 * Keep this file intentionally small. Directory-level generated barrels are
 * deprecated, but the package root remains a stable public API for consumers
 * that import from `@sentzunhat/zacatl`.
 */

export * from './configuration/index.js';
export * from './dependency-injection/index.js';
export * from './error/index.js';
export * from './localization/index.js';
export * from './logs/index.js';
export * from './service/index.js';
export * from './utils/index.js';

// Third-party dependencies are exported via specific subpaths for clarity.
// Examples: @sentzunhat/zacatl/third-party/zod, @sentzunhat/zacatl/third-party/uuid
// See package.json exports field for the complete list.
