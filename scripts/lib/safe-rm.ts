import fs from 'fs/promises';
import path from 'path';

export function resolveAndValidate(repoRoot: string, target: string): string {
  const resolved = path.resolve(repoRoot, target);
  const rel = path.relative(repoRoot, resolved);
  if (rel.startsWith('..') || (path.isAbsolute(rel) && rel === '')) {
    throw new Error(`Refusing to operate on path outside repository root: ${resolved}`);
  }
  return resolved;
}

export async function removePath(
  targetAbs: string,
  opts: { dryRun?: boolean; verbose?: boolean } = {},
) {
  const { dryRun = false, verbose = false } = opts;
  if (dryRun) {
    if (verbose) console.log('[dry-run] would remove:', targetAbs);
    return;
  }
  try {
    await fs.rm(targetAbs, { recursive: true, force: true });
    if (verbose) console.log('removed:', targetAbs);
  } catch (err) {
    console.error('failed to remove', targetAbs, err);
    throw err;
  }
}

async function walkDirs(
  root: string,
  maxDepth: number,
  cb: (dir: string) => Promise<void>,
  _depth = 0,
) {
  if (_depth > maxDepth) return;
  let entries: string[];
  try {
    entries = await fs.readdir(root);
  } catch (err) {
    return;
  }
  await cb(root);
  await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(root, entry);
      try {
        const st = await fs.stat(full);
        if (st.isDirectory()) {
          await walkDirs(full, maxDepth, cb, _depth + 1);
        }
      } catch (_err) {
        return;
      }
    }),
  );
}

export async function findDirsByName(root: string, name: string, maxDepth = 5): Promise<string[]> {
  const results: string[] = [];
  await walkDirs(root, maxDepth, async (dir) => {
    const base = path.basename(dir);
    if (base === name) results.push(dir);
  });
  return results;
}

export async function findFilesWithExtensions(
  root: string,
  extensions: string[],
  maxDepth = 10,
): Promise<string[]> {
  const results: string[] = [];
  async function walk(dir: string, depth: number) {
    if (depth > maxDepth) return;
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch (_err) {
      return;
    }
    await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry);
        try {
          const st = await fs.stat(full);
          if (st.isDirectory()) {
            await walk(full, depth + 1);
          } else if (st.isFile()) {
            for (const ext of extensions) {
              if (full.endsWith(ext)) {
                results.push(full);
                break;
              }
            }
          }
        } catch (_err) {
          return;
        }
      }),
    );
  }
  await walk(root, 0);
  return results;
}
