# Command Runner

Structured, shell-free command execution with policy-driven security controls.

## Overview

The command runner executes OS commands via `child_process.spawn` with `shell: false`.
All arguments are kept separate from the command binary, eliminating shell injection risk.
It is the canonical execution primitive for local CLI tools, AI agent tool calls, and
future remote worker orchestration.

## Import

```typescript
import {
  runCommand,
  executeCommands,
  validateCommandSpec,
  CommandSpecSchema,
  RunnerPolicySchema,
} from '@sentzunhat/zacatl';
```

## Types

### CommandSpec

Describes a single command to execute. No string concatenation — `cmd` and `args` are always separate.

```typescript
const spec: CommandSpec = {
  cmd: 'npm',
  args: ['run', 'build'],
  cwd: '/path/to/project', // optional
  env: { NODE_ENV: 'production' }, // optional; overrides or extends process.env
};
```

### RunnerPolicy

Controls security and resource limits. All fields are optional; safe defaults apply automatically.

```typescript
const policy: Partial<RunnerPolicy> = {
  timeoutMs: 30_000, // per-command hard timeout (default 30 s)
  maxOutputBytes: 1_048_576, // combined stdout+stderr cap (default 1 MB)
  maxConcurrency: 4, // parallel command limit in a batch (default 4)
  allowlist: ['npm', 'node'], // only these binaries are permitted
  denyPatterns: ['--upload-pack'], // regex strings; any matching arg is rejected
  cwdPrefix: '/safe/dir', // all cwd values must start here
  inheritEnv: true, // inherit parent process.env (default false)
};
```

### CommandResult

Returned by `runCommand` and `executeCommands`. The promise always resolves; validation failures reject.

```typescript
const result: CommandResult = {
  cmd: 'npm',
  args: ['run', 'build'],
  exitCode: 0, // null when the binary could not be found (ENOENT)
  stdout: '...',
  stderr: '',
  timedOut: false,
  durationMs: 1423,
};
```

## API

### runCommand

Executes a single command. Applies schema and policy validation, enforces timeout, and caps output.

```typescript
import { runCommand, RunnerPolicySchema } from '@sentzunhat/zacatl';

const policy = RunnerPolicySchema.parse({ inheritEnv: true });
const result = await runCommand({ cmd: 'node', args: ['--version'] }, policy);

console.log(result.stdout); // v24.x.x
console.log(result.exitCode); // 0
```

### executeCommands

Runs a batch of commands in parallel, bounded by `maxConcurrency`. Results are returned in the same order as the input array.

```typescript
import { executeCommands } from '@sentzunhat/zacatl';

const results = await executeCommands(
  [
    { cmd: 'npm', args: ['run', 'type:check'] },
    { cmd: 'npm', args: ['run', 'lint:silent'] },
    { cmd: 'npm', args: ['test'] },
  ],
  { maxConcurrency: 3, inheritEnv: true, timeoutMs: 120_000 },
);

for (const result of results) {
  if (result.exitCode !== 0) {
    console.error(`${result.cmd} ${result.args.join(' ')} failed`, result.stderr);
  }
}
```

### validateCommandSpec

Validates a `CommandSpec` against a `RunnerPolicy` before execution. Useful when pre-screening
commands at an API boundary.

```typescript
import { validateCommandSpec, RunnerPolicySchema } from '@sentzunhat/zacatl';

const policy = RunnerPolicySchema.parse({ allowlist: ['npm', 'node'] });

validateCommandSpec({ cmd: 'npm', args: ['run', 'build'] }, policy); // ok
validateCommandSpec({ cmd: 'rm', args: ['-rf', '/'] }, policy); // throws ValidationError
```

## Security

| Threat                   | Mitigation                                                               |
| ------------------------ | ------------------------------------------------------------------------ |
| Shell injection          | `shell: false` — args are never concatenated or shell-parsed             |
| Metacharacters           | Arguments containing `;`, `&`, `\|`, `` ` ``, `$`, `<`, `>` are rejected |
| Untrusted binaries       | Optional `allowlist` of permitted `cmd` values                           |
| Malicious arguments      | Optional `denyPatterns` (regex list) applied per argument                |
| Unsafe working directory | Optional `cwdPrefix` restricts the `cwd` search space                    |
| Resource exhaustion      | `timeoutMs`, `maxOutputBytes`, `maxConcurrency`                          |
| Runaway processes        | SIGTERM → SIGKILL fallback after a 2-second grace period                 |

## Parallel Execution Script

A demonstration script is available at `scripts/dev/parallel-execution.ts`:

```bash
npx tsx scripts/dev/parallel-execution.ts
```

It runs six safe commands concurrently (maxConcurrency: 3) and prints a structured timing table.

## Related

- Architecture Decision Record: `docs/roadmap/` (command-runner ADR)
- Error types: [error/README.md](../error/README.md)
