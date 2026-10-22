/**
 * Shared export policy for sync-local-exports and publish packaging.
 *
 * - Top-level module index files remain exported (package entrances).
 * - Leaf module files are always exported.
 * - Root and nested index barrels are omitted; consumers use explicit subpaths.
 * - The DI container implementation is not exported; its explicit public
 *   entry is discovered from third-party/dependency-injection.js.
 * - The shareable ESLint config index is a deliberate nested package entry.
 */

const retiredArtifacts = new Set([
  'configuration.js',
  'dependency-injection.js',
  'localization.js',
  'third-party/eslint.js',
  'third-party/dependency-injection/container.js',
]);
const retiredDirectoryPrefixes = ['configuration/', 'dependency-injection/', 'eslint/', 'localization/'];

export const shouldExportBuildArtifact = (relPath: string): boolean => {
  const normalized = relPath.replace(/\\/g, '/');
  if (
    retiredArtifacts.has(normalized)
    || retiredDirectoryPrefixes.some((prefix) => normalized.startsWith(prefix))
  ) {
    return false;
  }

  if (normalized === 'third-party/eslint/index.mjs') return true;

  const parts = normalized.split('/');
  const fileName = parts[parts.length - 1] ?? '';
  const isIndex = fileName.startsWith('index.');

  if (!isIndex) {
    return true;
  }

  // Top-level module entrances: service/index.js, ...
  if (parts.length === 2) {
    return true;
  }

  return false;
};
