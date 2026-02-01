# Zacatl Release - Publish Checklist

Use this checklist for any release.

## What's Done

### ✅ Version Update

- Update version in `package.json`
- Ensure changelog/release notes updated
- Regenerate build artifacts if needed

### ✅ Quality Verification

- **Tests**: All passing
- **Coverage**: Meets target
- **Build**: Success
- **Linting**: 0 errors
- **Type Check**: 0 errors

### ✅ Documentation Complete

- **README.md** - npm-ready overview
- **Docs** - Updated and accurate
- **Release notes** - Summary of changes
- **API Reference** - Core modules
- **Examples** - Real-world scenarios
- **Installation Guide** - Step-by-step setup
- **Testing Guide** - Patterns and strategies

### ✅ npm Scripts Verified

```bash
npm test              # All tests passing
npm run build         # TypeScript compilation successful
npm run lint          # ESLint clean
npm run test:coverage # Coverage report
npm run publish:latest # Ready to execute (if configured)
```

### ✅ Git Committed

- All changes staged and committed
- Clean working tree

## Release Checklist

- ✅ Version bumped
- ✅ All tests passing
- ✅ Build successful
- ✅ Linting passed
- ✅ Type checking passed
- ✅ Documentation complete
- ✅ Release notes created
- ✅ No breaking changes (or documented)
- ✅ Git committed
- ✅ Ready for npm publish

## Next Steps to Publish

### Option 1: Full Automated Publish

```bash
npm run publish:latest
```

### Option 2: Manual Steps

```bash
npm install                    # Ensure dependencies
npm test                       # Run tests
npm run test:coverage          # Generate coverage
npm run lint                   # Lint check
npm run build                  # Build TypeScript
npm publish --access public    # Publish to npm
```

## Post-Release Tasks

1. **GitHub Release**
   - Create release tag (e.g., `vX.Y.Z`)
   - Add release notes

2. **Announcements**
   - Update project website
   - Notify user community

3. **Monitoring**
   - Monitor npm package page
   - Watch for issues

## Documentation Links (Post-Release)

- 📖 [Full Documentation](https://github.com/sentzunhat/zacatl/tree/main/docs)
- 🚀 [Quick Start](https://github.com/sentzunhat/zacatl/blob/main/docs/getting-started/QUICKSTART_5MIN.md)
- 📚 [API Reference](https://github.com/sentzunhat/zacatl/tree/main/docs/api-reference)
- 💻 [Examples](https://github.com/sentzunhat/zacatl/tree/main/docs/examples)
- 🧪 [Testing](https://github.com/sentzunhat/zacatl/tree/main/docs/testing)

---

**Release Date**: YYYY-MM-DD  
**Status**: ✅ APPROVED FOR RELEASE  
**Next Action**: Publish to npm
