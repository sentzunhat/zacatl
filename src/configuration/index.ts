/**
 * Simple JSON and YAML configuration loader with Zod schema validation
 *
 * @example
 * // Load JSON file
 * import { loadJSON, serverSchema } from '@zacatl/configuration';
 * const config = loadJSON('./config.json', serverSchema);
 *
 * @example
 * // Load YAML file
 * import { loadYML, databaseSchema } from '@zacatl/configuration';
 * const config = loadYML('./config.yml', databaseSchema);
 */

// ============================================================================
// Simple loaders - just load JSON or YAML with optional schema
// ============================================================================
export { loadJSON } from './json';
export { loadYML, loadYAML } from './yml';
