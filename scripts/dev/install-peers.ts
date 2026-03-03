import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

const main = async (): Promise<number> => {
  try {
    const pkgPath = path.resolve(process.cwd(), 'package.json');
    const pkgRaw = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgRaw) as { peerDependencies?: Record<string, string> };
    const peers = pkg.peerDependencies || {};

    const pkgs = Object.keys(peers)
      .map((k) => `${k}@${peers[k]}`)
      .join(' ');

    if (!pkgs) {
      // eslint-disable-next-line no-console
      console.log('No peerDependencies to install.');
      return 0;
    }

    // eslint-disable-next-line no-console
    console.log('Installing peers:', pkgs);
    execSync(`npm install --no-audit --no-fund -s ${pkgs}`, {
      stdio: 'inherit',
    });

    return 0;
  } catch (err: unknown) {
    // eslint-disable-next-line no-console
    console.error('Failed to install peers:', err);
    return 1;
  }
};

void main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
