import '@zacatl/third-party/reflect-metadata'; // required by tsyringe (use project shim)
import * as diagnostics from 'diagnostics_channel';
import { createRequire } from 'module';

// Node 24 changed diagnostics_channel API; libraries like fastify/pino call
// `tracingChannel` which may not exist or may be non-callable in some
// environments. Provide a robust fallback for both ESM and CommonJS views
// so tests don't crash when libraries call `diagnostics.tracingChannel()`.
const fallback = (): {
  publish: () => void;
  subscribe: () => { unsubscribe: () => void };
} => ({
  publish: (): void => {},
  subscribe: (): { unsubscribe: () => void } => ({ unsubscribe: (): void => {} }),
});

const ensureTracingChannelOn = (obj: unknown): void => {
  if (!obj || typeof obj !== 'object') return;
  const target = obj as Record<string, unknown>;
  try {
    if (typeof target['tracingChannel'] === 'function') return;

    // If property exists but is not a function, attempt to replace it.
    // Prefer direct assignment (works in most environments).
    target['tracingChannel'] = (): {
      publish: () => void;
      subscribe: () => { unsubscribe: () => void };
    } => fallback();
    if (typeof target['tracingChannel'] === 'function') return;
  } catch {
    // Assignment may fail for non-writable/non-configurable properties.
  }

  // Try to define the property via defineProperty (if allowed).
  try {
    Object.defineProperty(target, 'tracingChannel', {
      value: (): {
        publish: () => void;
        subscribe: () => { unsubscribe: () => void };
      } => fallback(),
      writable: true,
      configurable: true,
      enumerable: false,
    });
    return;
  } catch {
    // If all attempts fail, we cannot make it callable — tests will try to
    // proceed but some libraries may still call it. Best effort only.
  }
};

// Patch ESM namespace view
ensureTracingChannelOn(diagnostics);

// Also patch CommonJS view used by some libraries (pino/fastify may use require())
try {
  const requireC = createRequire(import.meta.url);
  const diagC = requireC('diagnostics_channel');
  ensureTracingChannelOn(diagC);
} catch {
  // If require/import fails for any reason, ignore — we've already tried ESM.
}
