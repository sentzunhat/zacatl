import { resolveAndValidate, removePath } from './lib/safe-rm';

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
  const target = resolveAndValidate(repoRoot, 'node_modules');
  if (flags.dryRun) {
    if (flags.verbose) console.log('[dry-run] would remove', target);
    return;
  }
  await removePath(target, { verbose: flags.verbose });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
