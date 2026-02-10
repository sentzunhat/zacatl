#!/bin/bash

# Setup Git Hooks for Clean Source Files
# This script installs a pre-commit hook to prevent accidental commits of compiled files from src folder

HOOKS_DIR=".git/hooks"
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

# Create pre-commit hook
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent committing compiled files from src folder
# These files should only exist in the build folder

# Check for compiled files in src
COMPILED_FILES=$(git diff --cached --name-only | grep -E 'src/.*\.(js|d\.ts|js\.map|d\.ts\.map)$' || true)

if [ -n "$COMPILED_FILES" ]; then
    echo "❌ ERROR: Compiled files detected in src folder!"
    echo ""
    echo "The following files should not be committed:"
    echo "$COMPILED_FILES"
    echo ""
    echo "These files are automatically generated and should be ignored."
    echo "Run 'npm run clean:src' to remove them, then stage only the .ts files."
    echo ""
    exit 1
fi

exit 0
EOF

# Make the hook executable
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ Git pre-commit hook installed successfully!"
echo "   The hook will prevent accidental commits of compiled files from src folder."
echo ""
echo "To uninstall, run: rm $PRE_COMMIT_HOOK"
