#!/usr/bin/env -S node
import { runQuiet } from './common';
import { resolveAndValidate, removePath } from './lib/safe-rm';

(async () => {
  // Run main clean steps quietly. Avoid removing `node_modules` for now —
  // this makes `npm run clean` safe to run while developing the publish flow.
  runQuiet('npm run clean:examples');
  runQuiet('npm run clean:build');
  // Clean gitignored files but do not force-remove node_modules
  runQuiet('npm run clean:gitignored');

  // Remove publish folder only (keep node_modules intact)
  try {
    const repoRoot = process.cwd();
    const publish = resolveAndValidate(repoRoot, 'publish');
    await removePath(publish, { verbose: false });
  } catch (_) {
    // ignore
  }

  // Single completion message
  console.log('Cleanup complete');
})();
