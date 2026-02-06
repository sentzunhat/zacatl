/**
 * UUID Generation Library
 *
 * Re-exports for the UUID library.
 * Provides universally unique identifier generation.
 *
 * @module third-party/uuid
 */

export {
  v4 as uuidv4,
  v4,
  v6,
  v7,
  NIL,
  version,
  validate,
  stringify,
  parse,
} from "uuid";
