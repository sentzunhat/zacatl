#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const HOOKS_DIR = '.git/hooks';
const PRE_COMMIT_HOOK = path.join(HOOKS_DIR, 'pre-commit');

const hook = `#!/bin/bash

# Pre-commit hook to prevent committing compiled files from src folder
COMPILED_FILES=$(git diff --cached --name-only | grep -E 'src/.*\.(js|d\.ts|js\.map|d\.ts\.map)$' || true)

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

fs.mkdirSync(HOOKS_DIR, { recursive: true });
fs.writeFileSync(PRE_COMMIT_HOOK, hook, { mode: 0o755 });

console.log('✅ Git pre-commit hook installed successfully!');
console.log('   The hook will prevent accidental commits of compiled files from src folder.');
console.log('');
console.log('To uninstall, run: rm', PRE_COMMIT_HOOK);
