import { readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const dependencyBlocks = ['dependencies', 'devDependencies', 'optionalDependencies'];
const forbidden = ['sequelize', 'sqlite3'];
const findings = [];

for (const block of dependencyBlocks) {
  const dependencies = packageJson[block] ?? {};

  for (const name of forbidden) {
    if (Object.hasOwn(dependencies, name)) {
      findings.push(`${block}.${name}`);
    }
  }
}

if (findings.length > 0) {
  console.error(`Unexpected SQL ORM dependencies declared: ${findings.join(', ')}`);
  process.exit(1);
}

console.log('No sequelize or sqlite3 dependencies declared by this example.');
