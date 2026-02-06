# Multi-Context Architecture Cleanup & Design

**Status**: 🔨 In Progress  
**Version**: v1.0  
**Date**: February 3, 2026  
**Related**: [ADR-001](./decisions/ADR-001-service-architecture-standardization.md)

---

## Purpose

This document outlines the cleanup and reorganization of Zacatl's architecture layer to prepare for multi-context support (CLI, Desktop, Server). The goal is to improve type safety, naming consistency, and config structure **before** implementing the actual multi-context features.

---

## Current State Analysis

### Existing Type Structure

```typescript
// Application Layer (application.ts)
export type ApplicationHookHandlers = Array<Constructor<HookHandler>>;
export type ApplicationRouteHandlers = Array<Constructor<RouteHandler>>;

export type ApplicationEntryPoints = {
  rest: {
    hookHandlers: ApplicationHookHandlers;
    routeHandlers: ApplicationRouteHandlers;
  };
};

export type ConfigApplication = {
  entryPoints: ApplicationEntryPoints;
  autoRegister?: boolean;
};

// Service/Platform Layer (service.ts)
export type ConfigService = {
  architecture: {
    application?: Optional<ConfigApplication>;
    domain: ConfigDomain;
    infrastructure: ConfigInfrastructure;
    server?: Optional<ConfigServer>;
  };
};
```

### Issues Identified

1. **HTTP-Only**: `ApplicationEntryPoints` hardcoded to `rest` only
2. **Naming Inconsistency**:
   - `hookHandlers` vs potential `hooks`
   - `routeHandlers` vs potential `routes`
3. **No Service Type**: No way to distinguish CLI/Desktop/Server contexts
4. **Config Location**: Context-specific configs (server, cli, desktop) unclear placement
5. **Type Safety**: Entry points not validated against service type

---

## Design Decisions

### 1. Service Type Enum

**Decision**: Add `ServiceType` enum with three contexts

```typescript
export enum ServiceType {
  CLI = "CLI",
  DESKTOP = "DESKTOP",
  SERVER = "SERVER",
}
```

**Rationale**:

- ✅ Explicit, type-safe context declaration
- ✅ Single source of truth for supported contexts
- ✅ Easy to extend in future

### 2. Property Naming Convention

**Decision**: Use concise, clear names without redundant suffixes

| Current         | Proposed   | Reason                              |
| --------------- | ---------- | ----------------------------------- |
| `hookHandlers`  | `hooks`    | Shorter, context is clear from type |
| `routeHandlers` | `routes`   | Shorter, context is clear from type |
| `entryPoints`   | Keep as-is | Clear and descriptive               |

**Rationale**:

- The type already indicates it's an array of constructors
- `ApplicationHooks` and `ApplicationRoutes` types provide context
- Shorter names reduce verbosity in config

### 3. Entry Points Structure

**Decision**: Make `ApplicationEntryPoints` a discriminated union based on context

```typescript
// Option A: Simple optional properties (CHOSEN)
export type ApplicationEntryPoints = {
  cli?: {
    commands: Array<Constructor<Command>>;
  };
  rest?: {
    hooks: Array<Constructor<HookHandler>>;
    routes: Array<Constructor<RouteHandler>>;
  };
  ipc?: {
    handlers: Array<Constructor<IPCHandler>>;
  };
};

// Option B: Discriminated union (for future consideration)
export type ApplicationEntryPoints =
  | { type: "CLI"; commands: Array<Constructor<Command>> }
  | {
      type: "SERVER";
      hooks: Array<Constructor<HookHandler>>;
      routes: Array<Constructor<RouteHandler>>;
    }
  | { type: "DESKTOP"; ipc: Array<Constructor<IPCHandler>> };
```

**Chosen**: Option A (simple optional properties)

**Rationale**:

- ✅ Backward compatible (rest is optional)
- ✅ Validation can ensure correct properties for service type
- ✅ Less complex type gymnastics
- ✅ Easier to understand in config

### 4. Config Organization

**Decision**: Keep context-specific configs as siblings within `architecture` object

```typescript
export type ConfigService = {
  type: ServiceType; // NEW: Required type declaration
  architecture: {
    application?: Optional<ConfigApplication>; // Polymorphic based on type
    domain: ConfigDomain; // Always present
    infrastructure: ConfigInfrastructure; // Always present

    // Context-specific configs
    server?: Optional<ConfigServer>; // Only for SERVER type
    cli?: Optional<ConfigCLI>; // Only for CLI type
    desktop?: Optional<ConfigDesktop>; // Only for DESKTOP type
  };
};
```

**Rationale**:

- ✅ All architecture concerns grouped together
- ✅ Clear separation of context-specific vs universal layers
- ✅ Easy to validate: "If type=SERVER, then server config required"
- ✅ Maintains consistency with current structure

### 5. Type Definitions for New Contexts

**CLI Context**:

```typescript
export type ConfigCLI = {
  name: string; // CLI command name (e.g., "ujti")
  version: string; // CLI version
  description?: string; // Help text
};
```

**Desktop Context**:

```typescript
export type ConfigDesktop = {
  window: {
    title: string;
    width: number;
    height: number;
    resizable?: boolean;
  };
  platform: "neutralino" | "electron"; // Future: support multiple platforms
};
```

---

## Implementation Plan

### Phase 1: Type Definitions & Enums ✅

**Files to modify**:

- [x] Create `src/service/architecture/types.ts` - ServiceType enum
- [x] Update `src/service/architecture/application/application.ts` - Entry points
- [x] Update `src/service/architecture/platform/service.ts` - ConfigService

**Changes**:

1. Add `ServiceType` enum
2. Add `ConfigCLI` and `ConfigDesktop` types
3. Update `ApplicationEntryPoints` with optional cli/rest/ipc
4. Add `type` field to `ConfigService`

### Phase 2: Property Renaming 🔄

**Files to modify**:

- [ ] `src/service/architecture/application/application.ts`
- [ ] `src/service/architecture/platform/service.ts`
- [ ] All test files that reference old names

**Changes**:

1. Rename `hookHandlers` → `hooks`
2. Rename `routeHandlers` → `routes`
3. Update type names: `ApplicationHookHandlers` → `ApplicationHooks`
4. Update type names: `ApplicationRouteHandlers` → `ApplicationRoutes`

### Phase 3: Validation Logic 🔄

**Files to modify**:

- [ ] `src/service/architecture/platform/service.ts`

**Changes**:

1. Add constructor validation:
   - If `type=SERVER`, require `architecture.server` and `application.entryPoints.rest`
   - If `type=CLI`, require `architecture.cli` and `application.entryPoints.cli`
   - If `type=DESKTOP`, require `architecture.desktop` and `application.entryPoints.ipc`
2. Add helpful error messages for misconfigurations

### Phase 4: Documentation Updates 🔄

**Files to modify**:

- [ ] `docs/architecture/framework-overview.md`
- [ ] `docs/guides/service-architecture.md`
- [ ] `docs/examples/*.md`
- [ ] `README.md`

**Changes**:

1. Document new `ServiceType` enum
2. Update config examples with `type` field
3. Add multi-context examples (future)
4. Update migration guide

### Phase 5: Testing & Validation ⏳

**Tasks**:

- [ ] Run existing test suite (should pass)
- [ ] Add tests for new type validation
- [ ] Add tests for CLI/Desktop configs (placeholders)
- [ ] Verify backward compatibility

---

## Backward Compatibility Strategy

### Default Behavior

**If `type` is not specified**: Default to `ServiceType.SERVER`

```typescript
constructor(config: ConfigService) {
  // Provide backward compatibility
  const serviceType = config.type ?? ServiceType.SERVER;

  // ... rest of constructor
}
```

### Migration Path

**Before (v0.0.20)**:

```typescript
const service = new Service({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          hookHandlers: [AuthHook],
          routeHandlers: [UserRoute],
        },
      },
    },
    domain: { providers: [UserProvider] },
    infrastructure: { repositories: [UserRepository] },
    server: { vendor: ServerVendor.FASTIFY },
  },
});
```

**After (v0.1.0)** - With explicit type:

```typescript
const service = new Service({
  type: ServiceType.SERVER, // NEW: Explicit type
  architecture: {
    application: {
      entryPoints: {
        rest: {
          // Still works!
          hooks: [AuthHook], // RENAMED
          routes: [UserRoute], // RENAMED
        },
      },
    },
    domain: { providers: [UserProvider] },
    infrastructure: { repositories: [UserRepository] },
    server: { vendor: ServerVendor.FASTIFY },
  },
});
```

**After (v0.1.0)** - CLI example:

```typescript
const service = new Service({
  type: ServiceType.CLI, // NEW: CLI context
  architecture: {
    application: {
      entryPoints: {
        cli: {
          // NEW: CLI entry points
          commands: [DeployCommand, StatusCommand],
        },
      },
    },
    domain: { providers: [DeploymentProvider] },
    infrastructure: { repositories: [ConfigRepository] },
    cli: {
      // NEW: CLI-specific config
      name: "ujti",
      version: "2.0.0",
      description: "Infrastructure automation CLI",
    },
  },
});
```

---

## Risk Mitigation

### Breaking Changes

**Risk**: Renaming properties breaks existing code

**Mitigation**:

1. Keep old property names working with deprecation warnings (future)
2. Provide clear migration guide
3. Bump to minor version (0.1.0) to signal non-patch changes
4. Default `type` to SERVER for backward compat

### Type Safety

**Risk**: Polymorphic entry points harder to type

**Mitigation**:

1. Runtime validation in constructor
2. Clear error messages
3. Zod schemas for validation (future)

### Test Coverage

**Risk**: Changes break existing tests

**Mitigation**:

1. Run full test suite after each change
2. Fix tests incrementally
3. Maintain 79%+ coverage
4. Add new tests for multi-context validation

---

## Success Criteria

- [x] ServiceType enum defined
- [ ] ConfigCLI and ConfigDesktop types created
- [ ] ApplicationEntryPoints supports cli/rest/ipc
- [ ] Property names consistent and clear
- [ ] All 161 tests passing
- [ ] Documentation updated
- [ ] Backward compatible (type defaults to SERVER)
- [ ] Clear migration path documented

---

## Next Steps

1. ✅ Create this design document
2. 🔄 Implement Phase 1: Type definitions
3. ⏳ Implement Phase 2: Property renaming
4. ⏳ Implement Phase 3: Validation logic
5. ⏳ Implement Phase 4: Documentation
6. ⏳ Implement Phase 5: Testing

**Ready to proceed with Phase 1 implementation.**
