import { promises as fs } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

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
      console.log('No peerDependencies to install.');
      return 0;
    }

    console.log('Installing peers:', pkgs);
    execSync(`npm install --no-audit --no-fund -s ${pkgs}`, {
      stdio: 'inherit',
    });

    return 0;
  } catch (err: unknown) {
    console.error('Failed to install peers:', err);
    return 1;
  }
};

void main()
  .then((code) => process.exit(code))
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });
