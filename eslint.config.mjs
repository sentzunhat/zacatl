import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname, resolvePluginsRelativeTo: __dirname });

// Load per-area configs (src/test/scripts). They export arrays suitable for
// concatenation into the final flat config. Missing optional configs are
// ignored so this file stays robust.
const loaded = [];

const srcDefault = (await import('./eslint.src.config.mjs')).default || [];
const testDefault = (await import('./eslint.test.config.mjs')).default || [];
let scriptsDefault = [];
try {
  scriptsDefault = (await import('./scripts/eslint.config.mjs')).default || [];
} catch (e) {
  scriptsDefault = [];
}

// Helper: normalize a possibly-mis-shaped entry. If an object has numeric
// numeric keys ('0','1',...) it was likely an array accidentally merged into
// an object (happened previously). Extract numeric entries and keep any
// remaining non-numeric properties as a separate config object.
function normalizeEntry(item) {
  if (!item || typeof item !== 'object') return [item];
  const keys = Object.keys(item);
  const numericKeys = keys.filter((k) => /^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b));
  if (numericKeys.length === 0) return [item];
  const extracted = numericKeys.map((k) => item[k]);
  const rest = {};
  for (const k of keys) {
    if (!/^\d+$/.test(k)) rest[k] = item[k];
  }
  const result = [];
  for (const e of extracted) result.push(e);
  if (Object.keys(rest).length) result.push(rest);
  return result;
}

// Compose and normalize
const composed = [...compat.config({}), ...srcDefault, ...testDefault, ...scriptsDefault];
const normalized = [];
for (const entry of composed) {
  if (Array.isArray(entry)) {
    for (const e of entry) normalized.push(e);
    continue;
  }
  // normalize any array-like objects
  const parts = normalizeEntry(entry);
  for (const p of parts) normalized.push(p);
}

export default normalized;
