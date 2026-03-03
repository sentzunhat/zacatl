import { promises as fs } from 'fs';
import path from 'path';

const main = async (): Promise<number> => {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkgRaw = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgRaw) as { peerDependencies?: Record<string, string> };
  const peers = pkg.peerDependencies || {};

  if (Object.keys(peers).length === 0) {
    // eslint-disable-next-line no-console
    console.log('No peerDependencies declared.');
    return 0;
  }

  const failed: string[] = [];

  for (const name of Object.keys(peers)) {
    try {
      // eslint-disable-next-line no-console
      console.log('Checking', name);
      await import(name);
      // eslint-disable-next-line no-console
      console.log('OK:', name);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // eslint-disable-next-line no-console
      console.error('ERROR importing', name, msg);
      failed.push(name);
    }
  }

  if (failed.length) {
    // eslint-disable-next-line no-console
    console.error('Peer import check failed for:', failed.join(', '));
    return 2;
  }

  // eslint-disable-next-line no-console
  console.log('All peers importable.');
  return 0;
};

void main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
