import { findDirsByName, removePath, resolveAndValidate } from './lib/safe-rm';

function parseFlags() {
  const argv = process.argv.slice(2);
  return {
    dryRun: argv.includes('--dry-run'),
    yes: argv.includes('--yes'),
    verbose: argv.includes('--verbose'),
  };
}

async function main() {
  const repoRoot = process.cwd();
  const flags = parseFlags();
  const examplesRoot = resolveAndValidate(repoRoot, 'examples');
  const candidates = await findDirsByName(examplesRoot, 'node_modules', 5);
  if (candidates.length === 0) {
    if (flags.verbose) console.log('no examples/node_modules found');
    return;
  }
  for (const dir of candidates) {
    if (flags.dryRun && flags.verbose) console.log('[dry-run] would remove', dir);
    if (!flags.dryRun) await removePath(dir, { verbose: flags.verbose });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
