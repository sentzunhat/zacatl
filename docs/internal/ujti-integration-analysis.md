# Zacatl Integration Analysis for Ujti v2

**Date**: January 26, 2026
**Purpose**: Identify integration opportunities between Zacatl framework and Ujti v2 CLI
**Status**: Analysis Complete

---

## Executive Summary

Ujti v2 is currently a **CLI-first application** built with Bun/TypeScript for infrastructure automation (mesh networking, Kubernetes, GitOps). Zacatl is a **microservice framework** with layers architecture, DI, and HTTP adapters.

**Key Finding**: Limited direct integration opportunities exist today, but **significant cross-pollination potential** for improvements to both projects.

---

## Current State

### Ujti v2 Architecture

```
ujti/v2/toold/
├── cli/               # CLI binary (Bun compiled)
│   ├── config/        # YAML config loader
│   ├── providers/     # Mesh provider abstraction
│   └── state/         # Deployment state persistence
├── shared/            # Shared utilities (machine info)
└── ui/                # Neutralino desktop app
```

**Key Characteristics**:

- **Runtime**: Bun (not compatible with Node.js by default) - compiles to native binary
- **No HTTP server**: Pure CLI orchestrator
- **No persistence layer**: File-based state (JSON)
- **No DI**: Direct imports, simple function composition
- **Logging**: Console.log with emoji formatting
- **Config**: Custom YAML loader (not node-config)
- **Validation**: None (planned for future)

### Zacatl Framework

```
@sentzunhat/zacatl/
├── micro-service/architecture/   # AbstractArchitecture, DI helpers
├── logs/                          # Pino structured logging
├── error/                         # CustomError hierarchy
├── configuration/                 # node-config wrapper
├── platform/                      # Express/Fastify adapters
└── infrastructure/                # Mongoose/Sequelize repos
```

**Key Characteristics**:

- **Runtime**: Node.js 22+ (not fully compatible with Bun compilation)
- **HTTP-first**: Express/Fastify platform adapters
- **Database-centric**: Mongoose/Sequelize ORM layers
- **DI via tsyringe**: Decorator-based injection
- **Structured logging**: Pino with correlation IDs
- **Config**: node-config with JSON files

---

## Integration Scenarios

### ❌ Scenario 1: Direct Framework Integration (Not Viable)

**Idea**: Subclass `AbstractArchitecture` in Ujti CLI

**Blockers**:

1. **Runtime incompatibility**: Zacatl requires Node.js, Ujti compiles with Bun
2. **Architecture mismatch**: Zacatl expects HTTP server + DB, Ujti is CLI-only
3. **Dependency weight**: Adding tsyringe, node-config, pino to CLI increases binary size
4. **No HTTP layer**: Ujti doesn't need Express/Fastify adapters
5. **No persistence**: Ujti uses JSON files, not Mongoose/Sequelize

**Verdict**: ❌ Not a good fit

---

### ✅ Scenario 2: API Gateway for Ujti (Future Enhancement)

**Idea**: Build a separate **Ujti API Server** using Zacatl to expose CLI operations via HTTP

**Architecture**:

```
ujti-api-server/           (NEW - uses Zacatl)
├── src/
│   ├── application/
│   │   └── commands/
│   │       ├── DeployInfrastructureHandler.ts
│   │       ├── GetClusterStatusHandler.ts
│   │       └── GenerateClientAuthHandler.ts
│   ├── domain/
│   │   ├── models/        # UjtiConfig, DeploymentState
│   │   └── services/      # OrchestrationService
│   ├── infrastructure/
│   │   ├── cli/           # Executes ujti CLI binary
│   │   ├── repos/         # StateRepository (file-based)
│   │   └── ssh/           # SSHExecutor adapter
│   └── platform/
│       └── http/          # Fastify routes + zod validation
```

**Use Cases**:

- Web dashboard to trigger/monitor deployments
- CI/CD integration (GitHub Actions → API → Ujti)
- Multi-tenant management (separate deployments per team)
- Webhook support (notify on deployment completion)

**Benefits**:

- Zacatl provides: HTTP routing, validation, structured logging, error handling
- Ujti stays CLI-focused, API wraps it
- Separation of concerns

**Implementation**:

```typescript
// ujti-api-server/src/application/commands/DeployInfrastructureHandler.ts
import { injectable } from "tsyringe";
import { logger, ValidationError } from "@sentzunhat/zacatl";
import { CLIExecutor } from "../../infrastructure/cli/CLIExecutor";

@injectable()
export class DeployInfrastructureHandler {
  constructor(private cliExecutor: CLIExecutor) {}

  async execute(configPath: string): Promise<void> {
    logger.info("Starting infrastructure deployment", { configPath });

    try {
      await this.cliExecutor.run("ujti", ["up", "--config", configPath]);
      logger.info("Deployment complete");
    } catch (error) {
      logger.error("Deployment failed", { error });
      throw new ValidationError({
        message: "Deployment failed",
        reason: error.message,
      });
    }
  }
}
```

**Verdict**: ✅ Good fit for future (v2.5+)

---

### ✅ Scenario 3: Shared Patterns Library (Extract Common Utilities)

**Idea**: Create `@sentzunhat/shared` package with utilities used by both projects

**Candidates**:

| Utility                | Ujti Needs                | Zacatl Has          | Shared Package        |
| ---------------------- | ------------------------- | ------------------- | --------------------- |
| **Config validation**  | Yes (zod schemas)         | Yes (schema guards) | ✅ `ConfigValidator`  |
| **Structured logging** | Yes (replace console.log) | Yes (pino wrapper)  | ✅ `Logger`           |
| **Error hierarchy**    | Yes (typed errors)        | Yes (CustomError)   | ✅ `BaseError`        |
| **SSH executor**       | Yes (core need)           | No                  | ✅ `SSHClient`        |
| **State persistence**  | Yes (JSON files)          | No (uses ORMs)      | ✅ `FileStateStore`   |
| **Retry logic**        | Yes (network ops)         | No                  | ✅ `RetryWrapper`     |
| **Template engine**    | Yes (Mustache)            | No                  | ✅ `TemplateRenderer` |

**Package Structure**:

```
@sentzunhat/shared/
├── config/
│   └── validator.ts       # Zod-based validation
├── logging/
│   └── logger.ts          # Runtime-agnostic logger (console/pino adapters)
├── error/
│   └── base-error.ts      # Generic CustomError (no HTTP codes)
├── ssh/
│   └── client.ts          # SSH2 wrapper
├── state/
│   └── file-store.ts      # Generic file-based persistence
└── utils/
    ├── retry.ts           # Exponential backoff
    └── template.ts        # Mustache wrapper
```

**Benefits**:

- Both projects share battle-tested utilities
- Ujti improves with structured logging + validation
- Zacatl gains SSH/template utilities for infrastructure use cases
- Easier to maintain (one source of truth)

**Verdict**: ✅ High value, recommend implementing

---

## What Ujti Can Add to Zacatl

### 1. **CLI Scaffolding Module** (High Priority)

**Problem**: Zacatl has no CLI tooling for microservices that need command-line interfaces

**Solution**: Extract Ujti's CLI patterns into Zacatl

```typescript
// @sentzunhat/zacatl/cli/
├── AbstractCLI.ts         # Base class for CLI apps
├── ArgumentParser.ts      # Typed arg parsing
└── CommandRegistry.ts     # Command pattern registry
```

**Usage**:

```typescript
import { AbstractCLI, Command } from "@sentzunhat/zacatl/cli";

class MyCLI extends AbstractCLI {
  registerCommands() {
    this.register(new DeployCommand());
    this.register(new StatusCommand());
  }
}

new MyCLI().run(process.argv);
```

---

### 2. **Provider Abstraction Pattern** (Medium Priority)

**Problem**: Zacatl has hardcoded platform/persistence adapters (Express, Fastify, Mongoose, Sequelize)

**Solution**: Adopt Ujti's provider pattern for swappable implementations

**Current (Zacatl)**:

```typescript
// Tightly coupled
import { ExpressAdapter } from "./platform/express";
const server = new ExpressAdapter(config);
```

**Improved (Ujti pattern)**:

```typescript
// Provider interface
export interface HTTPProvider {
  start(port: number): void;
  registerRoutes(routes: Route[]): void;
}

// Factory
export function createHTTPProvider(name: string): HTTPProvider {
  switch (name) {
    case "express":
      return new ExpressProvider();
    case "fastify":
      return new FastifyProvider();
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

// Usage
const server = createHTTPProvider(config.get("HTTP_PROVIDER"));
```

**Benefits**:

- Easier testing (mock providers)
- Plug-and-play adapters
- Consistent interface across implementations

---

### 3. **Deployment State Management** (Low Priority)

**Problem**: Zacatl has no built-in support for long-running operations or resumable workflows

**Solution**: Add Ujti's state management pattern to Zacatl

```typescript
// @sentzunhat/zacatl/workflow/
├── StateMachine.ts        # Generic FSM
├── StateStore.ts          # Persistence interface
└── WorkflowExecutor.ts    # Resumable execution
```

**Use Case**: Database migrations, multi-step deployments, batch jobs

---

### 4. **File-Based Configuration** (Medium Priority)

**Problem**: Zacatl only supports `node-config` (JSON/env), no YAML support

**Solution**: Add Ujti's YAML config loader

```typescript
// @sentzunhat/zacatl/configuration/
├── json-loader.ts         # Existing
├── yaml-loader.ts         # NEW (from Ujti)
└── loader-factory.ts      # Auto-detect format
```

---

## What Zacatl Can Add to Ujti

### 1. **Structured Logging** (High Priority - Immediate Benefit)

**Current (Ujti)**:

```typescript
console.log("☁️  [GATEWAY] Mesh Control Plane Setup");
console.error("⚠️  Failed to load state file:", error);
```

**Improved (Zacatl pattern)**:

```typescript
import { logger } from "@sentzunhat/shared";

logger.info("Mesh control plane setup", {
  stage: "gateway",
  provider: config.gateway.provider,
});

logger.error("State file load failed", {
  error: error.message,
  filePath: STATE_FILE_PATH,
});
```

**Benefits**:

- Machine-readable logs (JSON for CI/CD)
- Correlation IDs for multi-step operations
- Log levels (debug/info/warn/error)
- Structured metadata for debugging

---

### 2. **Typed Error Handling** (High Priority - Immediate Benefit)

**Current (Ujti)**:

```typescript
throw new Error("Gateway verification failed");
```

**Improved (Zacatl pattern)**:

```typescript
import { ValidationError, InfrastructureError } from "@sentzunhat/shared";

throw new ValidationError({
  message: "Gateway verification failed",
  reason: "Headscale API unreachable",
  metadata: {
    gatewayAddress: config.gateway.address,
    provider: config.gateway.provider,
  },
});
```

**Benefits**:

- Typed error hierarchy
- Consistent error metadata
- Easier to handle/report errors in API wrapper

---

### 3. **Configuration Validation** (High Priority - Future Enhancement)

**Current (Ujti)**:

```typescript
// No validation - assumes config is correct
const config = loadConfig();
```

**Improved (Zacatl pattern + zod)**:

```typescript
import { z } from "zod";
import { getConfigOrThrow } from "@sentzunhat/shared";

const UjtiConfigSchema = z.object({
  version: z.string(),
  gateway: z.object({
    location: z.string(),
    port: z.number().min(1).max(65535),
    provider: z.enum(["headscale", "netbird", "nebula", "innernet"]),
  }),
  nodes: z.array(
    z.object({
      name: z.string(),
      role: z.enum(["control-plane", "worker", "gpu-worker"]),
    }),
  ),
});

const config = getConfigOrThrow<UjtiConfig>("ujti", UjtiConfigSchema);
```

---

### 4. **Dependency Injection** (Low Priority - Overkill for CLI)

**Assessment**: Ujti doesn't need DI for current scope (CLI orchestrator)

- DI adds complexity without clear benefit
- Simple function composition works well
- Consider only if API server is built

---

## Recommended Action Plan

### Phase 1: Extract Shared Utilities (Immediate - 1-2 weeks)

1. ✅ Create `@sentzunhat/shared` monorepo package
2. ✅ Extract from Zacatl:
   - Base error classes (no HTTP codes)
   - Logger wrapper (runtime-agnostic)
   - Config validator (zod helpers)
3. ✅ Extract from Ujti:
   - SSH client wrapper
   - File state store
   - Template renderer
   - Retry utilities
4. ✅ Update both projects to use shared package

**Success Metrics**:

- Both projects import from `@sentzunhat/shared`
- Zero code duplication
- Ujti gains structured logging + typed errors
- Zacatl gains SSH + template utilities

---

### Phase 2: Improve Ujti with Zacatl Patterns (Short-term - 2-3 weeks)

1. ✅ Replace `console.log` with structured logger
2. ✅ Add typed error hierarchy
3. ✅ Implement config validation (zod schemas)
4. ✅ Add correlation IDs to deployment workflows

**Success Metrics**:

- All logs are JSON-structured
- All errors extend `BaseError`
- Invalid config files fail fast with clear messages
- Deployment logs are traceable end-to-end

---

### Phase 3: Improve Zacatl with Ujti Patterns (Medium-term - 3-4 weeks)

1. ✅ Add CLI scaffolding module
2. ✅ Refactor platform/persistence to provider pattern
3. ✅ Add YAML config support
4. ✅ Add workflow/state management utilities

**Success Metrics**:

- Microservices can use `AbstractCLI` for CLI tools
- Swappable HTTP/DB providers via config
- Projects can use YAML config files
- Long-running operations are resumable

---

### Phase 4: Build Ujti API Server (Long-term - v2.5+)

1. ✅ Create `ujti-api-server` using Zacatl
2. ✅ Wrap CLI operations in HTTP endpoints
3. ✅ Add web dashboard
4. ✅ Support multi-tenant deployments

**Success Metrics**:

- Web UI can trigger deployments
- CI/CD pipelines use API instead of CLI
- Multiple teams can manage separate clusters

---

## Technical Debt & Risks

### Ujti v2

| Issue               | Impact                 | Recommendation                |
| ------------------- | ---------------------- | ----------------------------- |
| **No validation**   | High (runtime errors)  | Add zod schemas (Phase 2)     |
| **Console logging** | Medium (hard to debug) | Structured logger (Phase 2)   |
| **No error types**  | Medium (poor UX)       | Typed errors (Phase 2)        |
| **Bun runtime**     | Low (works fine)       | Monitor Node.js compatibility |

### Zacatl

| Issue                  | Impact                    | Recommendation             |
| ---------------------- | ------------------------- | -------------------------- |
| **No CLI support**     | Medium (limits use cases) | Add AbstractCLI (Phase 3)  |
| **Hardcoded adapters** | Low (works fine)          | Provider pattern (Phase 3) |
| **JSON-only config**   | Low (common format)       | Add YAML support (Phase 3) |
| **No workflow layer**  | Low (use queues)          | Add StateMachine (Phase 3) |

---

## Example: Shared Package Usage

### Before (Duplicated Code)

**Ujti**:

```typescript
// ujti/v2/toold/cli/src/state/index.ts
export function loadState(): DeploymentState | null {
  if (!existsSync(STATE_FILE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_FILE_PATH, "utf8"));
  } catch (error) {
    console.error("⚠️  Failed to load state file:", error);
    return null;
  }
}
```

**Zacatl** (hypothetical need):

```typescript
// zacatl/src/utils/state.ts
export function loadState<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    logger.error("State load failed", { path, error });
    return null;
  }
}
```

### After (Shared Package)

**@sentzunhat/shared**:

```typescript
// packages/shared/src/state/file-store.ts
import { existsSync, readFileSync, writeFileSync } from "fs";

export class FileStateStore<T> {
  constructor(private filePath: string) {}

  load(): T | null {
    if (!existsSync(this.filePath)) return null;
    try {
      const content = readFileSync(this.filePath, "utf8");
      return JSON.parse(content) as T;
    } catch (error) {
      throw new StateLoadError({
        message: "Failed to load state",
        metadata: { filePath: this.filePath, error },
      });
    }
  }

  save(state: T): void {
    try {
      writeFileSync(this.filePath, JSON.stringify(state, null, 2), "utf8");
    } catch (error) {
      throw new StateSaveError({
        message: "Failed to save state",
        metadata: { filePath: this.filePath, error },
      });
    }
  }
}
```

**Ujti (using shared)**:

```typescript
import { FileStateStore } from "@sentzunhat/shared/state";
import type { DeploymentState } from "./config";

const stateStore = new FileStateStore<DeploymentState>("./ujti.state");

export const loadState = () => stateStore.load();
export const saveState = (state: DeploymentState) => stateStore.save(state);
```

**Zacatl (using shared)**:

```typescript
import { FileStateStore } from "@sentzunhat/shared/state";

const migrationStore = new FileStateStore<MigrationState>("./migrations.state");
```

---

## Conclusion

**Direct Integration**: ❌ Not viable due to runtime/architecture mismatch

**Cross-Pollination**: ✅ High value through:

1. **Shared utilities package** (logging, errors, SSH, state)
2. **Pattern adoption** (Ujti → Zacatl: CLI, providers; Zacatl → Ujti: logging, errors)
3. **Future API server** (Zacatl wraps Ujti CLI for HTTP/multi-tenant use cases)

**Next Steps**:

1. Review this analysis
2. Prioritize Phase 1 (shared package)
3. Define shared package API surface
4. Begin extraction work

---

**Questions?**

- Should we prioritize API server (Phase 4) or focus on shared utilities?
- Which utilities are highest priority for extraction?
- Any concerns about Bun → Node.js migration for Ujti API?
