# CLI Module Migration Spec

**Purpose**: Guide for migrating CLI patterns from Ujti to `@sentzunhat/zacatl/cli`
**Status**: Specification for future migration
**Date**: January 26, 2026

---

## Overview

This spec describes how to migrate the proven CLI architecture from Ujti (where it's being developed and refined) into Zacatl as a reusable module.

**Current State**: CLI patterns are being developed in Ujti repository
**Future State**: `@sentzunhat/zacatl/cli` module available for any project

---

## Prerequisites

Before migrating CLI module to Zacatl:

- ✅ Phase 1 (Foundation) complete in Zacatl
- ✅ Bun runtime compatibility working
- ✅ Structured logging adapters ready
- ✅ CLI patterns proven and stable in Ujti
- ✅ File state management tested in production

---

## Folder Structure to Create

```
@sentzunhat/zacatl/
├── src/
│   ├── cli/                          # NEW - CLI module
│   │   ├── architecture/
│   │   │   ├── cli-architecture.ts   # Base class for CLI apps
│   │   │   └── index.ts
│   │   ├── commands/
│   │   │   ├── command.ts            # Command interface
│   │   │   ├── command-registry.ts   # Command registration
│   │   │   └── index.ts
│   │   ├── parser/
│   │   │   ├── args-parser.ts        # Argument parsing
│   │   │   ├── types.ts              # Parser types
│   │   │   └── index.ts
│   │   ├── state/
│   │   │   ├── file-state-store.ts   # File-based state
│   │   │   └── index.ts
│   │   └── index.ts                  # Main CLI exports
├── test/
│   ├── unit/cli/
│   └── integration/cli/
└── examples/
    └── cli/                          # Example CLI application
```

---

## Migration Steps

### Step 1: Extract Core Patterns from Ujti

Review Ujti CLI implementation and extract:

**From Ujti's CLI Architecture**:

- Base class pattern (how commands are registered)
- Command execution flow
- Argument parsing strategy
- Help text generation
- Error handling approach

**Key Files to Review in Ujti**:

- `ujti/v2/toold/cli/src/index.ts` - Entry point pattern
- Command implementations (up, down, status, etc.)
- State management approach
- Config loading pattern

### Step 2: Create CLI Architecture Base Class

```typescript
// src/cli/architecture/cli-architecture.ts
import { logger } from "../../logs";

export abstract class CLIArchitecture {
  protected commands: Map<string, Command> = new Map();

  protected registerCommand(command: Command): void {
    this.commands.set(command.name, command);

    // Register aliases if any
    if (command.aliases) {
      command.aliases.forEach((alias) => {
        this.commands.set(alias, command);
      });
    }
  }

  async start(argv: string[] = process.argv): Promise<void> {
    const [, , commandName, ...args] = argv;

    if (!commandName || commandName === "help" || commandName === "--help") {
      this.printHelp();
      return;
    }

    const command = this.commands.get(commandName);

    if (!command) {
      logger.error(`Unknown command: ${commandName}`);
      this.printHelp();
      process.exit(1);
    }

    try {
      await command.execute(args);
    } catch (error) {
      logger.error("Command execution failed", { error, command: commandName });
      process.exit(1);
    }
  }

  abstract registerCommands(): void;

  printHelp(): void {
    console.log("Available commands:");
    const uniqueCommands = new Set<Command>();
    this.commands.forEach((cmd) => uniqueCommands.add(cmd));

    uniqueCommands.forEach((cmd) => {
      const aliases = cmd.aliases ? ` (${cmd.aliases.join(", ")})` : "";
      console.log(`  ${cmd.name}${aliases} - ${cmd.description}`);
    });
  }
}
```

### Step 3: Create Command Interface

```typescript
// src/cli/commands/command.ts
export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  usage?: string;
  execute(args: string[]): Promise<void>;
}
```

### Step 4: Create Argument Parser

```typescript
// src/cli/parser/args-parser.ts
export interface ParsedArgs {
  positional: string[];
  flags: Record<string, boolean>;
  options: Record<string, string>;
}

export function parseArgs(args: string[]): ParsedArgs {
  const result: ParsedArgs = {
    positional: [],
    flags: {},
    options: {},
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];

      if (!nextArg || nextArg.startsWith("-")) {
        result.flags[key] = true;
      } else {
        result.options[key] = nextArg;
        i++;
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      result.flags[key] = true;
    } else {
      result.positional.push(arg);
    }
  }

  return result;
}
```

### Step 5: Create File State Store

```typescript
// src/cli/state/file-state-store.ts
import {
  existsSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  unlinkSync,
} from "fs";
import { dirname } from "path";

export class FileStateStore<T> {
  constructor(private filePath: string) {}

  load(): T | null {
    if (!existsSync(this.filePath)) return null;
    const content = readFileSync(this.filePath, "utf8");
    return JSON.parse(content) as T;
  }

  save(state: T): void {
    const dir = dirname(this.filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.filePath, JSON.stringify(state, null, 2), "utf8");
  }

  delete(): void {
    if (existsSync(this.filePath)) {
      unlinkSync(this.filePath);
    }
  }

  exists(): boolean {
    return existsSync(this.filePath);
  }
}
```

### Step 6: Create Main Exports

```typescript
// src/cli/index.ts
export * from "./architecture";
export * from "./commands";
export * from "./parser";
export * from "./state";
```

### Step 7: Update Package Exports

```json
// package.json
{
  "exports": {
    ".": "./build/index.js",
    "./cli": "./build/cli/index.js",
    "./micro-service": "./build/micro-service/index.js"
    // ... other exports
  }
}
```

### Step 8: Create Example

```typescript
// examples/cli/index.ts
import { CLIArchitecture, Command } from "@sentzunhat/zacatl/cli";
import { logger } from "@sentzunhat/zacatl";

class GreetCommand implements Command {
  name = "greet";
  description = "Greet someone";
  aliases = ["hello", "hi"];

  async execute(args: string[]): Promise<void> {
    const name = args[0] || "World";
    logger.info(`Hello, ${name}!`);
  }
}

class MyCLI extends CLIArchitecture {
  registerCommands(): void {
    this.registerCommand(new GreetCommand());
  }
}

new MyCLI().start();
```

### Step 9: Testing

Create comprehensive tests:

```typescript
// test/unit/cli/architecture/cli-architecture.test.ts
import { describe, it, expect } from "vitest";
import { CLIArchitecture } from "@sentzunhat/zacatl/cli";

describe("CLIArchitecture", () => {
  it("should register commands", () => {
    // Test implementation
  });

  it("should execute commands", async () => {
    // Test implementation
  });

  it("should handle unknown commands", async () => {
    // Test implementation
  });
});
```

### Step 10: Documentation

Update documentation:

- Add CLI module section to main README
- Create `docs/guides/CLI_GUIDE.md`
- Update examples
- Update AGENT_INTEGRATION_SPEC.md

---

## Differences from Ujti Implementation

Document any changes made during migration:

| Aspect               | Ujti Approach             | Zacatl Approach                     |
| -------------------- | ------------------------- | ----------------------------------- |
| Logger               | Console.log with emoji    | Structured logging adapters         |
| Runtime              | Bun only                  | Node.js + Bun compatible            |
| State Management     | Custom JSON file handling | Generic FileStateStore              |
| Error Handling       | Basic Error throws        | Typed CustomError hierarchy         |
| Config Loading       | Custom YAML loader        | Unified config system (JSON + YAML) |
| Dependency Injection | None                      | Optional (AbstractArchitecture)     |

---

## Success Criteria

- ✅ CLI module works on Node.js and Bun
- ✅ All Ujti CLI patterns successfully migrated
- ✅ Example CLI application runs
- ✅ Tests coverage > 80%
- ✅ Documentation complete
- ✅ No breaking changes to existing Zacatl users
- ✅ Can import via `@sentzunhat/zacatl/cli`

---

## Timeline Estimate

- **Step 1-2**: Extract and adapt architecture (2 days)
- **Step 3-5**: Implement utilities (2 days)
- **Step 6-7**: Integration with Zacatl (1 day)
- **Step 8-9**: Examples and tests (2 days)
- **Step 10**: Documentation (1 day)

**Total**: ~8 days (1.5 weeks)

---

## Notes

- Keep CLI module lightweight and independent
- Ensure tree-shaking works (unused features don't bloat bundles)
- Maintain backward compatibility with AbstractArchitecture
- Consider adding CLI-specific error types
- Document migration path for Ujti users

---

**When to execute this migration**: After Phase 1 is complete and CLI patterns in Ujti are proven stable.
