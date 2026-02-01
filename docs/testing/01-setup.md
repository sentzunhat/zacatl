# Testing Setup

Zacatl uses **Vitest** for testing - fast, TypeScript-first, and compatible with Jest syntax.

## Verify Installation

Already installed? Verify with:

```bash
npm test --version
```

## Install Vitest

If not installed:

```bash
npm install --save-dev vitest @vitest/ui
```

## Configuration

Zacatl includes a `vitest.config.ts` (or configure in `vite.config.ts`):

```typescript
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "build/",
        "test/",
        "**/*.test.ts",
        "**/*.spec.ts",
      ],
    },
  },
});
```

## Add npm Scripts

In `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Create Test Directory

```bash
mkdir -p test/unit/{services,handlers,repositories}
mkdir -p test/integration
mkdir -p test/fixtures
```

## Running Tests

```bash
npm test                     # Run all tests once
npm run test:watch          # Watch mode (re-run on changes)
npm run test:coverage       # With coverage report
npm run test:ui             # Visual UI interface
```

## Run Specific Tests

```bash
npm test -- test/unit/services           # Run specific directory
npm test -- --grep "UserService"         # Run tests matching pattern
npm test -- user-service.test.ts         # Run specific file
```

## Verify Setup

Create `test/unit/sample.test.ts`:

```typescript
import { describe, it, expect } from "vitest";

describe("Sample Test", () => {
  it("should work", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run it:

```bash
npm test
```

You should see:

```
✓ test/unit/sample.test.ts (1)
  ✓ Sample Test (1)
    ✓ should work

Test Files  1 passed (1)
     Tests  1 passed (1)
```

---

**Next**: [Basic Tests →](./02-basic-tests.md)
