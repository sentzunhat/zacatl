#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const HOOKS_DIR = '.git/hooks';
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, 'pre-commit');

const hook = `#!/bin/bash

# Regenerate barrel files and stage any updates automatically
npm run barrels:generate --silent
BAREL_CHANGES=$(git diff --name-only -- 'src/**/index.ts')
if [ -n "\${BAREL_CHANGES}" ]; then
    git add \${BAREL_CHANGES}
fi

# Prevent committing compiled files from src folder (excluding deletions)
COMPILED_FILES=$(git diff --cached --name-only --diff-filter=AM | grep -E 'src/.*\\.(js|d\\.ts|js\\.map|d\\.ts\\.map)$' | grep -vE '\\.(mjs|cjs)$' || true)

if [ -n "\${COMPILED_FILES}" ]; then
    echo "❌ ERROR: Compiled files detected in src folder!"
    echo ""
    echo "The following files should not be committed:"
    echo "\${COMPILED_FILES}"
    echo ""
    echo "These files are automatically generated and should be ignored."
    echo "Run 'npm run clean:src' to remove them, then stage only the .ts files."
    echo ""
    exit 1
fi

exit 0
`;

const main = (): void => {
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
  fs.writeFileSync(PRE_COMMIT_HOOK, hook, { mode: 0o755 });

  // eslint-disable-next-line no-console
  console.log('✅ Git pre-commit hook installed successfully!');
  // eslint-disable-next-line no-console
  console.log('   The hook will prevent accidental commits of compiled files from src folder.');
  // eslint-disable-next-line no-console
  console.log('');
  // eslint-disable-next-line no-console
  console.log('To uninstall, run: rm', PRE_COMMIT_HOOK);
};

main();
