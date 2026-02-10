# Coverage Reports

Track and improve test coverage.

## Generate Coverage

```bash
npm run test:coverage
```

Opens HTML report:

```bash
open coverage/lcov-report/index.html
```

## Zacatl's Coverage

```
Statements   : 61.59%
Branches     : 43.20%
Functions    : 62.85%
Lines        : 61.14%
```

**178 tests** covering all core modules.

## Coverage Goals

Aim for:

- **Statements**: 75%+
- **Branches**: 70%+
- **Functions**: 80%+
- **Lines**: 75%+

## Set Thresholds

In `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      lines: 75,
      functions: 80,
      branches: 70,
      statements: 75,
    },
  },
});
```

---

**Next**: [Best Practices →](./10-best-practices.md)
