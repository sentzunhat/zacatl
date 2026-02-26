import { findFilesWithExtensions, removePath, resolveAndValidate } from './lib/safe-rm';

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
  const targetDir = resolveAndValidate(repoRoot, 'src');
  const exts = ['.js', '.d.ts', '.js.map', '.d.ts.map'];
  const files = await findFilesWithExtensions(targetDir, exts, 20);
  if (files.length === 0) {
    if (flags.verbose) console.log('no generated files found in src');
    return;
  }
  for (const f of files) {
    if (flags.dryRun && flags.verbose) console.log('[dry-run] would remove', f);
    if (!flags.dryRun) await removePath(f, { verbose: flags.verbose });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
