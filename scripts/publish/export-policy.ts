/**
 * Shared export policy for sync-local-exports and publish packaging.
 *
 * - Top-level module index files remain exported (package entrances).
 * - Leaf module files are always exported.
 * - Root and nested index barrels are omitted; consumers use explicit subpaths.
 */

export const shouldExportBuildArtifact = (relPath: string): boolean => {
  const normalized = relPath.replace(/\\/g, '/');
  const parts = normalized.split('/');
  const fileName = parts[parts.length - 1] ?? '';
  const isIndex = fileName.startsWith('index.');

  if (!isIndex) {
    return true;
  }

  // Top-level module entrances: configuration/index.js, service/index.js, ...
  if (parts.length === 2) {
    return true;
  }

  return false;
};
