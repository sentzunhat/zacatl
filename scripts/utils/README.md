# Scripts Utilities

Standalone utility modules for build scripts that cannot import from `src/` during the build process.

## Why Separate Utilities?

Scripts compile **before** src during the build pipeline:

- `npm run build:scripts:esm` → builds scripts/
- `npm run build:src:esm` → builds src/

This means scripts cannot depend on src code, so we maintain simplified standalone versions of common utilities here.

## Available Utilities

### `measureTime`

Standalone version of `src/utils/measure-execution-time`. Measures and logs execution time using `console.log`.

**Usage:**

```typescript
import { measureTime } from '../utils/index.js';

await measureTime({
  name: 'build-step',
  fn: async () => {
    await compileAssets();
  },
});
// Output: [build-step] Started
//         [build-step] Completed in 1234.56ms
```

### `command-runner`

Standalone version of `src/utils/command-runner`. Executes shell commands with timeouts and output limits.

**Features:**

- Single command execution via `runCommand()`
- Batch parallel execution via `executeCommands()`
- Policy-based configuration (timeout, output limits, concurrency)
- Structured result objects with timing and exit codes

**Usage:**

```typescript
import { executeCommands, applyPolicyDefaults } from '../utils/index.js';

const policy = applyPolicyDefaults({
  timeoutMs: 30000,
  maxConcurrency: 4,
  inheritEnv: true,
});

const results = await executeCommands(
  [
    { cmd: 'npm', args: ['run', 'build'] },
    { cmd: 'npm', args: ['test'] },
  ],
  policy,
);
```

## Alignment with Production Code

These utilities mirror functionality from `src/utils/` but are:

- **Simplified** - no validation/policy enforcement (scripts are developer-controlled)
- **Self-contained** - no dependencies on src modules
- **Consistent** - same interface and behavior as src versions
- **Documented** - JSDoc comments explain purpose and usage

For production code, always use equivalents from `src/utils/`.
