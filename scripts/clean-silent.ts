#!/usr/bin/env -S node
import { spawnSync } from 'child_process';

function runQuiet(command: string, args: string[] = []) {
  try {
    // use shell to allow npm script names
    spawnSync([command, ...args].join(' '), { stdio: 'ignore', shell: true });
  } catch (_) {
    // ignore errors
  }
}

(async () => {
  // Run main clean steps quietly
  runQuiet('npm run clean:examples');
  runQuiet('npm run clean:build');
  runQuiet('npm run clean:gitignored:allow-node');

  // Remove top-level node_modules and publish quickly
  // Remove top-level node_modules and publish quickly using shell rm for robustness
  try {
    spawnSync('rm -rf node_modules publish', { shell: true, stdio: 'ignore' });
  } catch (_) {
    // ignore
  }

  // Synchronously remove nested node_modules (excluding top-level) — quiet but may take time
  try {
    const findCmd = `find . -name 'node_modules' -type d -prune -not -path './node_modules' -print0 | xargs -0 rm -rf`;
    spawnSync(findCmd, { shell: true, stdio: 'ignore' });
  } catch (_) {
    // ignore
  }

  // Single completion message
  console.log('Cleanup complete');
})();
