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
Statements   : 79.09% (2441/3088)
Branches     : 71.77% (538/749)
Functions    : 81.35% (570/700)
Lines        : 79.14% (2437/3081)
```

**161 tests** covering all core modules.

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
