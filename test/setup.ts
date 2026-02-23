import "@zacatl/third-party/reflect-metadata"; // required by tsyringe (use project shim)
import * as diagnostics from "diagnostics_channel";
import { createRequire } from "module";

// Node 24 changed diagnostics_channel API; libraries like fastify/pino call
// `tracingChannel` which may not exist or may be non-callable in some
// environments. Provide a robust fallback for both ESM and CommonJS views
// so tests don't crash when libraries call `diagnostics.tracingChannel()`.
const fallback = () => ({
  publish: () => {},
  subscribe: () => ({ unsubscribe: () => {} }),
});

function ensureTracingChannelOn(obj: any) {
  if (!obj) return;
  try {
    if (typeof obj.tracingChannel === "function") return;

    // If property exists but is not a function, attempt to replace it.
    // Prefer direct assignment (works in most environments).
    obj.tracingChannel = () => fallback();
    if (typeof obj.tracingChannel === "function") return;
  } catch (err) {
    // Assignment may fail for non-writable/non-configurable properties.
  }

  // Try to define the property via defineProperty (if allowed).
  try {
    Object.defineProperty(obj, "tracingChannel", {
      value: () => fallback(),
      writable: true,
      configurable: true,
      enumerable: false,
    });
    return;
  } catch (err) {
    // If all attempts fail, we cannot make it callable — tests will try to
    // proceed but some libraries may still call it. Best effort only.
  }
}

// Patch ESM namespace view
ensureTracingChannelOn(diagnostics as any);

// Also patch CommonJS view used by some libraries (pino/fastify may use require())
try {
  const requireC = createRequire(import.meta.url);
  const diagC = requireC("diagnostics_channel");
  ensureTracingChannelOn(diagC);
} catch (err) {
  // If require/import fails for any reason, ignore — we've already tried ESM.
}
