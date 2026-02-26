import { promises as fs } from 'fs';
import path from 'path';

async function main() {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkgRaw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw) as { peerDependencies?: Record<string, string> };
  const peers = pkg.peerDependencies || {};

  if (Object.keys(peers).length === 0) {
    console.log('No peerDependencies declared.');
    return 0;
  }

  const failed: string[] = [];

  for (const name of Object.keys(peers)) {
    try {
      console.log('Checking', name);
      await import(name);
      console.log('OK:', name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('ERROR importing', name, msg);
      failed.push(name);
    }
  }

  if (failed.length) {
    console.error('Peer import check failed for:', failed.join(', '));
    return 2;
  }

  console.log('All peers importable.');
  return 0;
}

void main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
