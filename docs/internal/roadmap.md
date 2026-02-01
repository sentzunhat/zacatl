# Zacatl Universal Framework - Implementation Roadmap

**Date**: January 26, 2026  
**Goal**: Transform Zacatl into a universal TypeScript framework supporting Microservices, CLIs, and Desktop apps  
**Status**: Phase 1 Focus (Foundation)

---

## Overview

This roadmap implements the "Zacatl Monorepo Architecture" with modular imports:

- `@sentzunhat/zacatl` - Core utilities (logger, errors, config, i18n)
- `@sentzunhat/zacatl/micro-service` - HTTP APIs (existing)
- `@sentzunhat/zacatl/cli` - CLI tools (deferred - develop in Ujti first)
- `@sentzunhat/zacatl/desktop` - Desktop apps (deferred - develop in Ujti first)
- `@sentzunhat/zacatl/shared` - Shared utilities (optional selective imports)

---

## Current Strategy

**Phase 1 (Foundation) - Immediate Focus:**

- Core improvements that benefit all modules (micro-service, CLI, desktop)
- Bun runtime compatibility
- Enhanced logging, config, validation, errors

**Phases 2-3 (CLI & Desktop) - Deferred:**

- CLI and Desktop already work in Ujti using Bun
- Develop and refine patterns in Ujti first
- Migrate proven implementations to Zacatl when ready
- See: `CLI_MODULE_SPEC.md` and `DESKTOP_MODULE_SPEC.md` for future migration

---

## Integration Context

This roadmap incorporates improvements identified from analyzing real-world CLI/infrastructure tool needs:

**Key Improvements (Phase 1)**:

- ✅ Bun runtime compatibility → Phase 1.1 (Complete)
- ✅ Structured logging (pluggable adapters) → Phase 1.2 (Complete)
- ✅ YAML configuration support → Phase 1.4
- ✅ Configuration validation (zod) → Phase 1.5
- ✅ Provider abstraction pattern → Phase 1.7
- ✅ Typed error handling → Phase 1.8

**Deferred to Ujti Development (Phases 2-3)**:

- CLI scaffolding patterns → Develop in Ujti first
- Desktop architecture → Develop in Ujti first
- File-based state management → Develop in Ujti first

**Shared Utilities** (`@sentzunhat/zacatl/shared`):

- Common utilities exportable via `@sentzunhat/zacatl/shared` path
- Includes: logger adapters, base errors, config validators
- Keeps the monorepo simple while enabling selective imports

---

## Phase 1: Foundation (Zacatl Core Changes)

### 1.1 Bun Runtime Compatibility (High Priority)

**Goal**: Ensure core Zacatl utilities work on Bun runtime (not just Node.js)

**Scope**: Make the framework runtime-agnostic by detecting environment and adapting behavior

**Files to Create**:

- [x] `src/runtime/detector.ts` - Runtime detection utility
- [x] `src/runtime/types.ts` - Runtime type definitions
- [x] `src/runtime/index.ts` - Exports

**Files to Modify**:

- [x] `src/index.ts` - Export runtime utilities
- [x] Test existing utilities on Bun (runtime suite passes; full suite stays on Node)

**Code Pattern**:

```typescript
// src/runtime/detector.ts
export type Runtime = "node" | "bun" | "deno" | "unknown";

export function detectRuntime(): Runtime {
  if (typeof Bun !== "undefined") return "bun";
  if (typeof Deno !== "undefined") return "deno";
  if (typeof process !== "undefined" && process.versions?.node) return "node";
  return "unknown";
}

export const currentRuntime = detectRuntime();
export const isBun = currentRuntime === "bun";
export const isNode = currentRuntime === "node";
```

**Success Criteria**:

- ✅ Runtime detection works correctly
- ✅ Core utilities work on Bun
- ✅ Tests pass on Node.js; runtime suite verified on Bun (full suite runs on Node for Mongoose support)
- ✅ No breaking changes for Node.js users
- ✅ Recommended dev runtime: Node.js LTS 22.x; Bun optional for package installs

---

### 1.2 Structured Logging Improvements (High Priority)

**Goal**: Enhance logging with runtime-specific adapters and structured output

**Scope**: Lightweight logging for Bun/CLI, full Pino for microservices

**Files to Create**:

- [ ] `src/logs/adapters/console-adapter.ts` - Lightweight console logger for Bun/CLI
- [ ] `src/logs/adapters/pino-adapter.ts` - Full-featured pino wrapper (existing code)
- [ ] `src/logs/factory.ts` - Auto-select adapter based on runtime

**Files to Modify**:

- [ ] `src/logs/logger.ts` - Use factory pattern to select adapter
- [ ] `src/logs/index.ts` - Export factory and adapters

**Code Pattern**:

```typescript
// src/logs/factory.ts
import { detectRuntime } from "../runtime";

export function createLogger(config?: LogConfig): Logger {
  const runtime = detectRuntime();

  // Use lightweight console logger for Bun or when pino not available
  if (runtime === "bun" || config?.adapter === "console") {
    return new ConsoleLoggerAdapter(config);
  }

  return new PinoLoggerAdapter(config);
}
```

**Success Criteria**:

- ✅ Logs work in Node.js (pino)
- ✅ Logs work in Bun (console adapter)
- ✅ Same interface for both adapters
- ✅ JSON output available for CI/CD
- ✅ Bundle size impact < 10KB for Bun

---

### 1.3 Optional Dependency Injection

**Goal**: Make tsyringe optional for lightweight CLI/desktop apps

**Files to Create**:

- [ ] `src/micro-service/architecture/di/container.ts` - Abstract DI container
- [ ] `src/micro-service/architecture/di/tsyringe-adapter.ts` - tsyringe wrapper
- [ ] `src/micro-service/architecture/di/simple-container.ts` - Lightweight Map-based container

**Files to Modify**:

- [ ] `src/micro-service/architecture/architecture.ts` - Use abstract container
- [ ] `package.json` - Make tsyringe a peerDependency (optional)

**Code Pattern**:

```typescript
// src/micro-service/architecture/di/container.ts
export interface DIContainer {
  register<T>(token: string, impl: Constructor<T>): void;
  resolve<T>(token: string): T;
}

// Auto-select based on availability
export function createContainer(): DIContainer {
  try {
    require("tsyringe");
    return new TsyringeAdapter();
  } catch {
    return new SimpleContainer();
  }
}
```

**Success Criteria**:

- ✅ Works with tsyringe (microservices)
- ✅ Works without tsyringe (CLI/desktop)
- ✅ Same API for both

---

### 1.4 YAML Configuration Support (Medium Priority)

**Goal**: Support YAML config files (alongside JSON) for CLI tools and applications

**Files to Create**:

- [ ] `src/configuration/loaders/yaml-loader.ts` - YAML file parser
- [ ] `src/configuration/loaders/json-loader.ts` - Extract existing node-config logic
- [ ] `src/configuration/factory.ts` - Auto-detect file format

**Files to Modify**:

- [ ] `src/configuration.ts` - Support both loaders
- [ ] `package.json` - Add `js-yaml` dependency

**Code Pattern**:

```typescript
// src/configuration/factory.ts
import { existsSync } from "fs";
import { YAMLLoader } from "./loaders/yaml-loader";
import { JSONLoader } from "./loaders/json-loader";

export function loadConfig<T>(name: string): T {
  if (existsSync(`config/${name}.yaml`)) {
    return new YAMLLoader().load<T>(name);
  }
  return new JSONLoader().load<T>(name);
}
```

**Dependencies**:

- [ ] Add `js-yaml` to dependencies
- [ ] Add `@types/js-yaml` to devDependencies

**Success Criteria**:

- ✅ Can load `config/default.yaml`
- ✅ Can load `config/default.json`
- ✅ Auto-detection works
- ✅ Type safety preserved

---

### 1.5 Configuration Validation (High Priority)

**Goal**: Add zod-based configuration schema validation for type-safe config loading

**Files to Create**:

- [ ] `src/configuration/validator.ts` - Zod schema validator
- [ ] `src/configuration/types.ts` - Configuration type utilities

**Files to Modify**:

- [ ] `src/configuration.ts` - Add validation support
- [ ] `src/index.ts` - Export validation utilities

**Code Pattern**:

```typescript
// src/configuration/validator.ts
import { z } from "zod";
import { ValidationError } from "../error";

export function validateConfig<T>(data: unknown, schema: z.ZodSchema<T>): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError({
      message: "Configuration validation failed",
      reason: result.error.message,
      metadata: { errors: result.error.errors },
    });
  }
  return result.data;
}

// Usage
const ConfigSchema = z.object({
  SERVICE_NAME: z.string(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]),
  PORT: z.number().min(1).max(65535),
});

const config = validateConfig(rawConfig, ConfigSchema);
```

**Dependencies**:

- [ ] `zod` already in dependencies

**Success Criteria**:

- ✅ Can validate config against schema
- ✅ Throws typed ValidationError on failure
- ✅ Type inference works
- ✅ Clear error messages

---

### 1.6 Internationalization (i18n) Support (Medium Priority)

**Goal**: Add multi-language support for error messages and logs

**Files to Create**:

- [ ] `src/i18n/index.ts` - i18n wrapper
- [ ] `src/i18n/types.ts` - Translation types
- [ ] `src/locales/en.json` - English translations
- [ ] `src/locales/es.json` - Spanish translations (example)

**Files to Modify**:

- [ ] `src/index.ts` - Export i18n utilities
- [ ] `src/error/custom.ts` - Support translated error messages

**Code Pattern**:

```typescript
// src/i18n/index.ts
import i18n from "i18n";

i18n.configure({
  locales: ["en", "es", "fr"],
  directory: __dirname + "/../locales",
  defaultLocale: "en",
});

export { i18n };
export const t = i18n.__;
```

**Dependencies**:

- [ ] Add `i18n` to dependencies (already exists)
- [ ] Add `@types/i18n` to devDependencies (already exists)

**Success Criteria**:

- ✅ Can translate error messages
- ✅ Can set locale via config
- ✅ Supports template variables

---

### 1.7 Provider Abstraction Pattern (Medium Priority)

**Goal**: Add swappable provider pattern for HTTP servers, databases, and external services

**Ujti Pattern**: Ujti uses provider abstraction for mesh networks (Headscale/Netbird/Tailscale)

**Files to Create**:

- [ ] `src/micro-service/platform/http-provider.ts` - HTTP provider interface
- [ ] `src/micro-service/platform/provider-factory.ts` - Provider factory
- [ ] `src/micro-service/infrastructure/persistence-provider.ts` - Database provider interface
- [ ] `src/micro-service/infrastructure/provider-factory.ts` - Persistence factory

**Files to Modify**:

- [ ] `src/micro-service/architecture/architecture.ts` - Use provider factories
- [ ] Update Express/Fastify adapters to implement interface
- [ ] Update Mongoose/Sequelize adapters to implement interface

**Code Pattern**:

```typescript
// src/micro-service/platform/http-provider.ts
export interface HTTPProvider {
  start(port: number): Promise<void>;
  stop(): Promise<void>;
  registerRoutes(routes: Route[]): void;
  use(middleware: Middleware): void;
}

// src/micro-service/platform/provider-factory.ts
export function createHTTPProvider(
  type: "express" | "fastify",
  config: HTTPConfig,
): HTTPProvider {
  switch (type) {
    case "express":
      return new ExpressProvider(config);
    case "fastify":
      return new FastifyProvider(config);
    default:
      throw new Error(`Unknown HTTP provider: ${type}`);
  }
}

// Usage
const server = createHTTPProvider(
  getConfigOrThrow("HTTP_PROVIDER"),
  httpConfig,
);
```

**Benefits**:

- ✅ Easier testing (mock providers)
- ✅ Plug-and-play adapters
- ✅ Consistent interface across implementations
- ✅ Same pattern as Ujti's mesh providers

**Success Criteria**:

- ✅ Can swap HTTP providers via config
- ✅ Can swap DB providers via config
- ✅ Same API regardless of provider
- ✅ Easy to add new providers

---

### 1.8 Typed Error Handling Improvements (High Priority)

**Goal**: Enhance CustomError with correlation IDs and structured metadata for better traceability

**Files to Modify**:

- [ ] `src/error/custom.ts` - Add correlation ID support
- [ ] `src/error/index.ts` - Export error utilities

**Code Pattern**:

```typescript
// Enhanced CustomError
export class CustomError extends Error {
  constructor(params: {
    message: string;
    code?: string;
    reason?: string;
    metadata?: Record<string, unknown>;
    correlationId?: string; // NEW
  }) {
    super(params.message);
    this.correlationId = params.correlationId ?? generateCorrelationId();
  }

  toJSON() {
    return {
      id: this.id,
      code: this.code,
      message: this.message,
      reason: this.reason,
      metadata: this.metadata,
      correlationId: this.correlationId,
      timestamp: this.time,
    };
  }
}
```

**Success Criteria**:

- ✅ Errors include correlation IDs
- ✅ Easy to trace multi-step operations
- ✅ JSON serialization for logging
- ✅ Backward compatible

---

## Phase 2: CLI Module (Deferred - Develop in Ujti)

**Status**: ⏸️ **DEFERRED** - CLI patterns are being developed and refined in Ujti first

**Rationale**:

- Ujti already has a working CLI built with Bun
- Better to iterate and perfect the patterns there
- When ready, migrate the proven architecture to `@sentzunhat/zacatl/cli`
- See `docs/internal/CLI_MODULE_SPEC.md` for migration guide

**What to develop in Ujti**:

- CLI architecture base class
- Command pattern and registry
- Argument parsing
- File state management for CLI apps
- Help text generation

**When to migrate to Zacatl**:

- After Phase 1 is complete
- When CLI patterns in Ujti are stable and proven
- When ready to offer CLI module to other projects

---

### 2.1 CLI Architecture Base Class (Future)

**Goal**: Create base class for CLI applications using modern patterns

**Inspiration**: Command-based architecture with argument parsing and help text generation

**Files to Create**:

- [ ] `src/cli/architecture/cli-architecture.ts` - Base class for CLI apps
- [ ] `src/cli/architecture/index.ts` - Exports
- [ ] `src/cli/commands/command.ts` - Command interface
- [ ] `src/cli/commands/command-registry.ts` - Command registration
- [ ] `src/cli/commands/index.ts` - Exports
- [ ] `src/cli/parser/args-parser.ts` - Argument parser
- [ ] `src/cli/parser/index.ts` - Exports
- [ ] `src/cli/index.ts` - Main exports

**Code Pattern**:

```typescript
// src/cli/architecture/cli-architecture.ts
import { AbstractArchitecture } from "../../micro-service/architecture/architecture";

export abstract class CLIArchitecture extends AbstractArchitecture {
  protected commands: Map<string, Command> = new Map();

  protected registerCommand(command: Command): void {
    this.commands.set(command.name, command);
  }

  async start(): Promise<void> {
    const [, , commandName, ...args] = process.argv;
    const command = this.commands.get(commandName);

    if (!command) {
      this.printHelp();
      process.exit(1);
    }

    await command.execute(args);
  }

  abstract registerCommands(): void;
  abstract printHelp(): void;
}
```

**Success Criteria**:

- ✅ Can extend CLIArchitecture
- ✅ Can register commands
- ✅ Argument parsing works
- ✅ Help text generation
- ✅ Works on Node.js and Bun

---

### 2.2 Command Pattern Implementation

**Goal**: Implement command registry pattern for self-contained commands

**Files to Create**:

- [ ] `src/cli/commands/command.ts` - Command interface
- [ ] `examples/cli/hello-command.ts` - Example command

**Code Pattern**:

```typescript
// src/cli/commands/command.ts
export interface Command {
  name: string;
  description: string;
  execute(args: string[]): Promise<void>;
}

// examples/cli/hello-command.ts
export class HelloCommand implements Command {
  name = "hello";
  description = "Say hello";

  async execute(args: string[]): Promise<void> {
    logger.info(`Hello, ${args[0] || "World"}!`);
  }
}
```

**Success Criteria**:

- ✅ Commands are self-contained
- ✅ Easy to test
- ✅ Clean interface

---

### 2.3 CLI Example Application

**Files to Create**:

- [ ] `examples/cli/index.ts` - Full CLI example
- [ ] `examples/cli/commands/` - Example commands
- [ ] `examples/cli/package.json` - CLI-specific config
- [ ] `examples/cli/README.md` - Documentation

**Code Pattern**:

```typescript
// examples/cli/index.ts
import { CLIArchitecture } from "@sentzunhat/zacatl/cli";
import { HelloCommand } from "./commands/hello";

class MyCLI extends CLIArchitecture {
  registerCommands() {
    this.registerCommand(new HelloCommand());
  }

  printHelp() {
    console.log("Available commands:", Array.from(this.commands.keys()));
  }
}

new MyCLI().start();
```

**Success Criteria**:

- ✅ Example runs on Node.js
- ✅ Example runs on Bun
- ✅ Documentation is clear
- ✅ Shows DI integration

---

### 2.4 File State Store for CLIs

**Goal**: Add generic file-based state persistence for CLI applications

**Use Case**: CLIs that need to remember state between runs (deployment status, configuration cache, last used settings, etc.)

**Files to Create**:

- [ ] `src/cli/state/file-state-store.ts` - Generic file persistence
- [ ] `src/cli/state/index.ts` - Exports
- [ ] `test/unit/cli/state/file-state-store.test.ts` - Unit tests

**Files to Modify**:

- [ ] `src/cli/index.ts` - Export FileStateStore

**Code Pattern**:

```typescript
// src/cli/state/file-state-store.ts
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
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
}

// Usage in CLI
interface MyCliState {
  lastCommand: string;
  timestamp: number;
  settings: Record<string, unknown>;
}

const stateStore = new FileStateStore<MyCliState>(".my-cli-state.json");
const state = stateStore.load() ?? {
  lastCommand: "",
  timestamp: 0,
  settings: {},
};
```

**Success Criteria**:

- ✅ Can save/load JSON state
- ✅ Type-safe generics
- ✅ Handles missing files gracefully
- ✅ Auto-creates directories
- ✅ Delete operation works
- ✅ Test coverage > 80%
- ✅ Works on Node.js and Bun

---

## Phase 3: Desktop Module (Deferred - Develop in Ujti)

**Status**: ⏸️ **DEFERRED** - Desktop app patterns are being developed in Ujti UI first

**Rationale**:

- Ujti already has a desktop app built with Neutralino
- Better to iterate and perfect the patterns there
- When ready, migrate the proven architecture to `@sentzunhat/zacatl/desktop`
- See `docs/internal/DESKTOP_MODULE_SPEC.md` for migration guide

**What to develop in Ujti**:

- Desktop architecture base class
- Neutralino adapter (window management, IPC)
- Desktop app lifecycle management
- State synchronization patterns

**When to migrate to Zacatl**:

- After Phase 1 is complete
- When desktop patterns in Ujti are stable and proven
- When ready to offer desktop module to other projects

---

### 3.1 Desktop Architecture Base Class (Future)

**Files to Create**:

- [ ] `src/desktop/architecture/desktop-architecture.ts` - Base class
- [ ] `src/desktop/architecture/index.ts` - Exports
- [ ] `src/desktop/window/window-manager.ts` - Window lifecycle
- [ ] `src/desktop/ipc/ipc-handler.ts` - IPC communication
- [ ] `src/desktop/index.ts` - Main exports

**Code Pattern**:

```typescript
// src/desktop/architecture/desktop-architecture.ts
import { AbstractArchitecture } from "../../micro-service/architecture/architecture";

export abstract class DesktopArchitecture extends AbstractArchitecture {
  protected windowManager: WindowManager;
  protected ipcHandler: IPCHandler;

  async start(): Promise<void> {
    await this.windowManager.createMainWindow();
    this.ipcHandler.registerHandlers();
    // Application logic
  }

  abstract registerIPCHandlers(): void;
}
```

**Success Criteria**:

- ✅ Window lifecycle managed
- ✅ IPC communication works
- ✅ Works with Neutralino

---

### 3.2 Neutralino Adapter

**Files to Create**:

- [ ] `src/desktop/neutralino/window.ts` - Neutralino window wrapper
- [ ] `src/desktop/neutralino/ipc.ts` - Neutralino IPC wrapper
- [ ] `src/desktop/neutralino/bundler.ts` - Build helper
- [ ] `src/desktop/neutralino/index.ts` - Exports

**Code Pattern**:

```typescript
// src/desktop/neutralino/window.ts
export class NeutralinoWindow {
  async create(options: WindowOptions): Promise<void> {
    await Neutralino.window.create(options);
  }

  async setTitle(title: string): Promise<void> {
    await Neutralino.window.setTitle(title);
  }
}
```

**Dependencies**:

- [ ] Add `@neutralinojs/lib` to dependencies

**Success Criteria**:

- ✅ Can create windows
- ✅ IPC events work
- ✅ Bundler generates config

---

### 3.3 Desktop Example Application

**Files to Create**:

- [ ] `examples/desktop/index.ts` - Main process
- [ ] `examples/desktop/ui/index.html` - UI
- [ ] `examples/desktop/neutralino.config.json` - Neutralino config
- [ ] `examples/desktop/README.md` - Documentation

**Success Criteria**:

- ✅ Example app runs
- ✅ Window shows
- ✅ IPC communication works
- ✅ Documentation is clear

---

## Phase 4: Package Configuration

### 4.1 Update package.json

**Changes**:

```json
{
  "exports": {
    ".": "./build/index.js",
    "./micro-service": "./build/micro-service/index.js",
    "./cli": "./build/cli/index.js",
    "./desktop": "./build/desktop/index.js",
    "./logs": "./build/logs/index.js",
    "./error": "./build/error/index.js",
    "./configuration": "./build/configuration.js",
    "./utils": "./build/utils/index.js"
  },
  "peerDependencies": {
    "tsyringe": "^4.10.0",
    "reflect-metadata": "^0.2.2"
  },
  "peerDependenciesMeta": {
    "tsyringe": {
      "optional": true
    },
    "reflect-metadata": {
      "optional": true
    }
  },
  "dependencies": {
    "js-yaml": "^4.1.0"
  }
}
```

**Files to Modify**:

- [ ] `package.json` - Add exports, peerDependencies

**Success Criteria**:

- ✅ Path imports work
- ✅ Tree-shaking works
- ✅ Optional deps handled

---

### 4.2 Update TypeScript Configuration

**Changes**:

```json
{
  "compilerOptions": {
    "paths": {
      "@zacatl/micro-service": ["./src/micro-service/index.ts"],
      "@zacatl/cli": ["./src/cli/index.ts"],
      "@zacatl/desktop": ["./src/desktop/index.ts"],
      "@zacatl/*": ["./src/*"]
    }
  }
}
```

**Files to Modify**:

- [ ] `tsconfig.json` - Add path mappings

**Success Criteria**:

- ✅ Type checking works
- ✅ IDE autocomplete works

---

## Phase 5: Documentation & Examples

### 5.1 Update README

**Sections to Add**:

- [ ] Overview of modules (micro-service, CLI, desktop)
- [ ] Installation instructions per module
- [ ] Quick start for each module
- [ ] Links to examples

**Files to Modify**:

- [ ] `README.md` - Complete rewrite for universal framework

---

### 5.2 Create Module-Specific Guides

**Files to Create**:

- [ ] `docs/guides/MICROSERVICE_GUIDE.md` - HTTP API guide
- [ ] `docs/guides/CLI_GUIDE.md` - CLI tool guide
- [ ] `docs/guides/DESKTOP_GUIDE.md` - Desktop app guide
- [ ] `docs/guides/MIGRATION_FROM_V0.md` - Upgrade guide

**Success Criteria**:

- ✅ Each guide has working examples
- ✅ Migration path is clear
- ✅ Common patterns documented

---

### 5.3 Update Agent Integration Spec

**Files to Modify**:

- [ ] `docs/AGENT_INTEGRATION_SPEC.md` - Add CLI and desktop sections
- [ ] `docs/AGENT_PROMPT_TEMPLATE.md` - Add templates for CLI/desktop

**Success Criteria**:

- ✅ Agents can scaffold CLI projects
- ✅ Agents can scaffold desktop projects
- ✅ Prompt templates updated

---

## Phase 6: Testing & Validation

### 6.1 CLI Module Tests

**Files to Create**:

- [ ] `test/unit/cli/architecture/cli-architecture.test.ts`
- [ ] `test/unit/cli/commands/command-registry.test.ts`
- [ ] `test/unit/cli/parser/args-parser.test.ts`
- [ ] `test/integration/cli/cli-app.test.ts`

**Success Criteria**:

- ✅ Unit test coverage > 80%
- ✅ Integration tests pass
- ✅ Tests run on Node.js and Bun

---

### 6.2 Desktop Module Tests

**Files to Create**:

- [ ] `test/unit/desktop/architecture/desktop-architecture.test.ts`
- [ ] `test/unit/desktop/neutralino/window.test.ts`
- [ ] `test/unit/desktop/neutralino/ipc.test.ts`

**Success Criteria**:

- ✅ Unit test coverage > 70%
- ✅ Mocks Neutralino APIs

---

### 6.3 Runtime Compatibility Tests

**Files to Create**:

- [ ] `test/runtime/bun-compat.test.ts` - Bun runtime tests
- [ ] `test/runtime/node-compat.test.ts` - Node.js runtime tests

**Success Criteria**:

- ✅ Core utilities work on both runtimes
- ✅ Logger adapters work
- ✅ DI fallback works

---

### 6.4 Core Utilities Tests

**Files to Create**:

- [ ] `test/unit/logs/adapters.test.ts` - Logger adapter tests
- [ ] `test/unit/error/custom-error.test.ts` - Error handling tests
- [ ] `test/unit/configuration/validator.test.ts` - Config validation tests
- [ ] `test/unit/utils/file-state-store.test.ts` - State store tests

**Success Criteria**:

- ✅ Test coverage > 80%
- ✅ Works on Node.js and Bun
- ✅ No runtime-specific failures

---

### 6.5 Provider Pattern Tests

**Files to Create**:

- [ ] `test/unit/micro-service/platform/provider-factory.test.ts`
- [ ] `test/unit/micro-service/infrastructure/provider-factory.test.ts`
- [ ] `test/integration/provider-swapping.test.ts`

**Success Criteria**:

- ✅ Can swap providers via config
- ✅ Mock providers work in tests
- ✅ No breaking changes

---

## Success Metrics

### Phase 1: Foundation (Core Improvements) - **ACTIVE**

- ✅ All tests passing
- ✅ Bun runtime compatibility established
- ✅ Structured logging works on Node.js and Bun
- ✅ YAML config loading works
- ✅ Configuration validation with zod
- ✅ Provider abstraction pattern implemented
- ✅ Typed error handling enhanced
- ✅ No breaking changes for existing users

### Phase 2: CLI Module - **DEFERRED** (Develop in Ujti)

- ⏸️ Patterns refined in Ujti first
- ⏸️ Migration spec created (see `CLI_MODULE_SPEC.md`)
- ⏸️ Ready to migrate when Phase 1 complete

### Phase 3: Desktop Module - **DEFERRED** (Develop in Ujti)

- ⏸️ Patterns refined in Ujti first
- ⏸️ Migration spec created (see `DESKTOP_MODULE_SPEC.md`)
- ⏸️ Ready to migrate when Phase 1 complete

### Phase 4-5: Package & Documentation

- ✅ npm publish succeeds
- ✅ Path imports work (`@sentzunhat/zacatl/cli`, etc.)
- ✅ Tree-shaking works
- ✅ Examples easy to follow
- ✅ Migration guide clear

### Phase 6: Testing

- ✅ Test coverage > 80% across all modules
- ✅ Integration tests pass
- ✅ Runtime compatibility validated (Node.js + Bun)
- ✅ Provider pattern tests pass
- ✅ Core utilities tested

---

## Timeline Estimates

| Phase                   | Duration       | Dependencies | Priority | Status        |
| ----------------------- | -------------- | ------------ | -------- | ------------- |
| Phase 1: Foundation     | 3-4 weeks      | None         | High     | **ACTIVE**    |
| Phase 2: CLI Module     | -              | Phase 1      | -        | **DEFERRED**  |
| Phase 3: Desktop Module | -              | Phase 1      | -        | **DEFERRED**  |
| Phase 4: Package Config | 1 week         | Phase 1      | Medium   | After Phase 1 |
| Phase 5: Documentation  | 1-2 weeks      | Phase 1, 4   | Medium   | After Phase 1 |
| Phase 6: Testing        | 2-3 weeks      | Phase 1, 4   | High     | After Phase 1 |
| **Total (Immediate)**   | **7-10 weeks** | -            | -        | Phase 1 + 4-6 |

**Notes**:

- **Phases 2 & 3 deferred**: CLI and Desktop modules developed in Ujti first
- **Focus on Phase 1**: Core improvements benefit all modules
- **Parallel work**: Ujti development continues independently

---

## Priority Ordering (Revised)

### **IMMEDIATE** (Weeks 1-4) - Phase 1 Foundation

1. ✅ **Phase 1.1**: Bun Runtime Compatibility (Complete)
2. ✅ **Phase 1.2**: Structured Logging with Pluggable Adapters (Complete)
3. **Phase 1.4**: YAML Configuration Support (2-3 days)
4. **Phase 1.5**: Configuration Validation (3-4 days)
5. **Phase 1.8**: Typed Error Handling (2-3 days)

### **NEXT** (Weeks 5-6) - Remaining Phase 1

1. **Phase 1.7**: Provider Abstraction Pattern (3-4 days)
2. **Phase 1.3**: Optional DI (3-4 days)
3. **Phase 1.6**: i18n Support (2-3 days, optional)

### **THEN** (Weeks 7-10) - Package & Testing

1. **Phase 4**: Package Configuration (1 week)
2. **Phase 5**: Documentation (1-2 weeks)
3. **Phase 6**: Testing (2-3 weeks)

### **PARALLEL** - Ujti Development

- Continue developing CLI patterns in Ujti
- Continue developing Desktop patterns in Ujti
- When Phase 1 complete, migrate to Zacatl using specs

---

## Next Steps (Immediate)

1. ✅ **Roadmap complete** - Phase 1 focused, CLI/Desktop deferred to Ujti
2. 🚀 **Start Phase 1.1** - Bun Runtime Compatibility
3. 📝 **Migration specs created**:
   - See [CLI_MODULE_SPEC.md](./CLI_MODULE_SPEC.md) for future CLI migration
   - See [DESKTOP_MODULE_SPEC.md](./DESKTOP_MODULE_SPEC.md) for future Desktop migration
4. 🔄 **Parallel development** - Continue Ujti CLI/Desktop work independently

---

## Migration Guides (Future Reference)

When Phase 1 is complete and you're ready to bring CLI/Desktop from Ujti to Zacatl:

### CLI Module Migration

- **Spec**: [CLI_MODULE_SPEC.md](./CLI_MODULE_SPEC.md)
- **Timeline**: ~8 days (1.5 weeks)
- **Prerequisites**: Phase 1 complete, CLI patterns proven in Ujti
- **Output**: `@sentzunhat/zacatl/cli` module

### Desktop Module Migration

- **Spec**: [DESKTOP_MODULE_SPEC.md](./DESKTOP_MODULE_SPEC.md)
- **Timeline**: ~9 days (2 weeks)
- **Prerequisites**: Phase 1 complete, Desktop patterns proven in Ujti
- **Output**: `@sentzunhat/zacatl/desktop` module

Both specs include:

- ✅ Detailed folder structure
- ✅ Step-by-step migration instructions
- ✅ Code examples from Ujti patterns
- ✅ Testing guidelines
- ✅ Documentation requirements

---

## Questions to Resolve (Phase 1 Only)

- Which i18n library? (`i18next` vs `intl-messageformat` vs custom)
- Which YAML parser? (`js-yaml` ✅ recommended vs `yaml` package)
- Start with Phase 1.1 (Bun Compatibility) this week?

---

## Risk Mitigation

| Risk                | Impact | Mitigation                                   |
| ------------------- | ------ | -------------------------------------------- |
| Bun incompatibility | High   | Runtime detection, fallback implementations  |
| Binary size bloat   | High   | Tree-shaking, optional deps, bundle analysis |
| Breaking changes    | Medium | Semantic versioning, migration guide         |
| Complexity creep    | Medium | Keep modules independent, clear boundaries   |
| Maintenance burden  | Medium | Comprehensive tests, good documentation      |

### Week 1 Actions

1. ✅ Review and approve this roadmap
2. ✅ Create GitHub project board with phases as milestones
3. ✅ Start Phase 1.1: Runtime-Agnostic Logging
4. ✅ Set up test environment for Bun compatibility

### Questions to Resolve

- Which i18n library? (`i18next` vs `intl-messageformat` vs custom)
- Which YAML parser? (`js-yaml` ✅ recommended vs `yaml` package)
- Any concerns about the approach?
- Timeline acceptable?

---

## Risk Mitigation

### Risk: Breaking Changes for Existing Users

**Mitigation**: Maintain backward compatibility, use semantic versioning, provide migration guide

### Risk: Bundle Size Increase

**Mitigation**: Make dependencies optional, use tree-shaking, measure impact continuously

### Risk: Bun Compatibility Issues

**Mitigation**: Test early and often, use runtime detection, provide fallbacks

### Risk: Timeline Overrun

**Mitigation**: Prioritize Phase 1 features, work in parallel where possible, adjust scope if needed
