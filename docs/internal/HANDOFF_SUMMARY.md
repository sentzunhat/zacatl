# Handoff Summary: Platform & Server Architecture Refactoring for v0.1.0

## How to Interpret My Intent

**Adopt a Layers-based pattern for Platform architecture:**

- **Concrete classes instead of abstract base classes** - No need for abstract Platform since each platform (Server/CLI/Desktop) has different implementations
- **Platform factory function** - Single Platform class with a function that takes ServiceType and dynamically loads the appropriate module (ServerPlatform/CLIPlatform/DesktopPlatform)
- **Each platform owns its setup** - Just like Layers class (Infrastructure/Domain/Application), each platform module handles its own initialization and dependency registration
- **Server class receives entry points** - Pass routes/hooks to Server at instantiation, not through separate registration methods
- **Functional registration inside platforms** - Platforms use functions to wire up routes/hooks/commands, following the same DI pattern as Layers

**Key insight:** "We can leave dependency registration on the function for now if it works, but we can also add it to each class later if needed" - Keep it simple, follow Layers pattern.

---

## High-Level Goal

Refactor Zacatl's platform layer from a monolithic Service class to a modular, Layers-aligned architecture where:

1. Platform is a concrete factory that detects type and loads the right platform module
2. Each platform (Server/CLI/Desktop) is a standalone class with its own initialization
3. Server class handles HTTP setup and receives entry points as constructor parameters
4. All dependency registration happens within platform classes (no abstract inheritance)
5. Service becomes a thin orchestrator that creates Platform and calls start()
6. Ready for v0.1.0 release with backward compatibility for v0.0.27 users

---

## Key Findings & Decisions So Far

### ✅ Architecture Decision Made

**ADR Status:** Accepted (stored in `docs/internal/adr-platform-server-refactoring.md`)

Decision: **Concrete Platform Class with Factory Function** (NOT abstract base class)

- Reason: Platforms have different implementations, no shared base behavior needed
- Pattern: Follows existing Layers class approach (pass config → create components → register in constructor)
- Alignment: Each platform module owns its own setup, just like Infrastructure/Domain/Application layers

### ✅ Implementation Pattern Confirmed

```typescript
// Pattern: Like Layers class
Platform {
  - createPlatform(type: ServiceType): PlatformModule
  - Each returned module (ServerPlatform/CLIPlatform/DesktopPlatform)
    handles its own initialization
}

ServerPlatform {
  - receives Server config + entry points
  - creates Server instance
  - registers routes/hooks via functions
  - implements start() lifecycle
}

Server {
  - receives routes/hooks as constructor params
  - exposes registerRoute(), registerHook() to adapters
  - manages Fastify/Express adapter
  - no registration methods, just route/hook registration
}
```

### ✅ Current Architecture (v0.0.27)

- Service: Monolithic class handling platform detection + orchestration + registration
- Server: Has `registerAllRestHandlers()`, `registerAllRoutes()` methods (imperative)
- Entry points: Passed through Service config, then to Server
- Layers: Registers dependencies in order (Infrastructure → Domain → Application)
- 183 tests passing at 79% coverage
- All functionality working

### ✅ Documentation Complete

- Standards guide reviewed (docs/standards/documentation.md)
- ADR created with full type definitions, flow diagrams, migration path
- No abstract class needed - just concrete classes

---

## Current State

### Exists & Working

- **Layers architecture**: Infrastructure/Domain/Application each register their own dependencies in constructor
- **Service class**: v0.0.27 implementation detects type, creates platforms, calls start()
- **Server class**: Has Fastify/Express adapters, database connection strategies
- **Platform base class**: Minimal abstract class exists (just `start()` and `stop()`)
- **CLI/Desktop**: Separate implementations
- **Tests**: 183 passing, good coverage

### Partial/In Progress

- ADR document: Complete with design, but not yet implemented in code
- Type definitions: Proposed in ADR, not in actual codebase
- Registration functions: Designed in ADR, not extracted

### Not Started

- Implementing concrete Platform factory function
- Creating ServerPlatform/CLIPlatform/DesktopPlatform classes
- Extracting registration functions
- Refactoring Server to receive entry points in constructor
- Updating Service to use new Platform factory
- Updating 183 tests
- Updating 3 example projects

---

## Gaps, Unknowns & Open Questions

### Design Clarity (Now Resolved)

- ✅ Abstract vs Concrete classes: **Concrete Platform class with factory function**
- ✅ Dependency registration: **On each platform class, like Layers**
- ✅ Entry points: **Passed to Server/Platform constructors**
- ✅ Registration pattern: **Functional composition inside platform classes**

### Implementation Details Still Unknown

1. **Platform factory function signature:**
   - `createPlatform(type: ServiceType, config: ConfigPlatforms): PlatformModule`?
   - Returns ServerPlatform | CLIPlatform | DesktopPlatform?

2. **Server constructor signature:**
   - `Server(config: HttpServerConfig, entryPoints?: RestApplicationEntryPoints)`?
   - Or separate parameters: `Server(config, routes, hooks)`?

3. **Entry point registration inside Platform:**
   - Does ServerPlatform call `registerRestRoutes()` and `registerRestHooks()` in constructor?
   - Or in a `setup()` method that Platform.start() calls?

4. **CLI/Desktop platforms:**
   - Same pattern as Server (pass handlers to constructor)?
   - Different registration approach?

5. **Service → Platform transition:**
   - Keep Service for backward compat?
   - Or make Platform the primary public API?

---

## Risks & Friction Points

### Technical Risks

- **Large refactor**: Touches core Service, Server, all adapters, Platforms
- **Test coverage**: 183 tests need updating; coverage could drop
- **Breaking changes**: Users relying on current Server API will need migration
- **Complexity**: More files (Platform + 3 platform modules + registration functions)

### Scope/Effort Risks

- **Implementation timeline**: 4-5 weeks for full refactoring + tests + examples + docs
- **Example projects**: All 3 (kojin, mictlan, tekit) need updating
- **Test rewrite**: Significant effort to update mock structure
- **Documentation**: Migration guide + updated API docs needed

### Architecture Risks

- **Over-engineering**: Might add unnecessary abstraction with registration functions
- **Inconsistency**: CLI/Desktop might have different patterns than Server if not careful
- **Type safety**: Loosely typed entry points could cause runtime errors

---

## Where We Can Go Next (Aligned to My Intent)

### Priority 1: Implement Platform Factory & Classes (Week 1)

**Goal:** Create concrete Platform class with factory function and platform modules

Steps:

1. [ ] Create `src/service/platforms/platform.ts` with factory function
   - `function createPlatform(type: ServiceType, config: ConfigPlatforms): PlatformModule`
   - Returns appropriate platform based on type
2. [ ] Create `src/service/platforms/server/server-platform.ts`
   - Extends no one (concrete class)
   - Constructor receives: `{ name, server: HttpServerConfig, databases, page, entryPoints }`
   - Creates Server instance internally
   - Implements `initialize()` and `start()` lifecycle
3. [ ] Create `src/service/platforms/cli/cli-platform.ts`
   - Concrete class for CLI
   - Receives commands in constructor
   - Implements `start()` lifecycle
4. [ ] Create `src/service/platforms/desktop/desktop-platform.ts`
   - Concrete class for Desktop
   - Receives IPC handlers in constructor
   - Implements `start()` lifecycle

**Acceptance criteria:**

- All 3 platform modules created
- Factory function loads correct module
- Types match ADR spec
- Compiles with no errors

### Priority 2: Refactor Server Class (Week 1-2)

**Goal:** Remove registration methods, receive entry points in constructor

Steps:

1. [ ] Update Server constructor signature
   - Add `entryPoints?: RestApplicationEntryPoints` parameter
   - Move route/hook registration to constructor
2. [ ] Remove these methods from Server:
   - `registerHandlers()`
   - `registerAllHooks()`
   - `registerAllRoutes()`
   - `registerAllRestHandlers()`
3. [ ] Extract registration into functions:
   - `registerRestRoutes(routes, server)`
   - `registerRestHooks(hooks, server)`
   - `registerAllRestHandlers(entryPoints, server)`
4. [ ] ServerPlatform calls these functions in constructor
5. [ ] All adapter.registerRoute/registerHook calls still work

**Acceptance criteria:**

- Server no longer has registration methods
- Entry points wired up in ServerPlatform constructor
- No behavioral changes to actual route/hook registration

### Priority 3: Update Service Class (Week 2)

**Goal:** Simplify Service to use Platform factory

Steps:

1. [ ] Remove platform-specific logic from Service
2. [ ] Service.constructor() calls `createPlatform(type, config)`
3. [ ] Service.start() delegates to platform.start()
4. [ ] Keep Service for backward compat OR make it just call createPlatform

**Acceptance criteria:**

- Service is now 30 lines (constructor + start)
- Works with existing examples
- Backward compatible

### Priority 4: Update Tests (Week 2-3)

**Goal:** Update 183 tests for new architecture

Steps:

1. [ ] Create test fixtures for Platform modules
2. [ ] Update Server tests (remove registration method tests)
3. [ ] Add Platform factory tests
4. [ ] Add ServerPlatform/CLIPlatform/DesktopPlatform tests
5. [ ] Add registration function tests
6. [ ] Maintain ≥79% coverage

**Acceptance criteria:**

- All 183+ tests passing
- Coverage ≥79%
- New tests for Platform classes added

### Priority 5: Update Examples & Docs (Week 3-4)

**Goal:** Migrate example projects, create migration guide

Steps:

1. [ ] Update kojin (Server platform example)
2. [ ] Update mictlan (CLI platform example)
3. [ ] Update tekit (Desktop platform example)
4. [ ] Create migration guide: `docs/migration/v0.0.27-to-v0.1.0.md`
5. [ ] Update `docs/guides/service-adapter-pattern.md`
6. [ ] Update README with new patterns

**Acceptance criteria:**

- All examples run and tests pass
- Migration guide covers all breaking changes
- Users can see old vs new code

### Priority 6: Release v0.1.0 (Week 4)

**Goal:** Publish refactored framework

Steps:

1. [ ] Update version to 0.1.0
2. [ ] Update changelog with architecture changes
3. [ ] Final test run (all 183+ tests)
4. [ ] Final build check
5. [ ] Publish to npm
6. [ ] Create GitHub release with notes

**Acceptance criteria:**

- Version 0.1.0 published
- All tests passing in CI/CD
- Release notes document breaking changes

---

## Context the Next AI Must Assume

### Don't Re-explain

- Why Platform/Server refactoring is needed (see ADR for rationale)
- Current architecture (Service → Platforms, Layers pattern, 183 tests)
- Documentation standards (docs/standards/documentation.md)
- DI system (tsyringe with decorator metadata)
- v0.0.27 features (Bun support, Fastify/Express adapters, multi-ORM)

### Mindset to Resume In

- **Concrete implementation mode**: Create actual classes, not more design docs
- **Layers-aligned patterns**: Follow how Layers class works (config → register in constructor)
- **No abstract classes**: Use concrete platform classes
- **Functional registration**: Extract pure functions for route/hook registration
- **Backward aware**: Ensure examples still work with some migration path
- **Test-driven**: Update tests as code changes
- **Documentation during**: Update docs as architecture changes

### Key Technical Details to Remember

- **Framework**: v0.0.27 → 0.1.0 (major refactor)
- **Build**: TypeScript strict mode, Vite config, npm build
- **Tests**: Vitest with 183 tests at 79% coverage
- **Platforms**: Server (Fastify/Express), CLI, Desktop
- **Adapters**: FastifyAdapter, ExpressAdapter for Server
- **DI**: tsyringe with `container.registerSingleton()` pattern
- **Layers**: Infrastructure (repos) → Domain (services) → Application (handlers)
- **Entry points**: REST { routes, hooks }, CLI { commands }, IPC { handlers }

### Files to Touch (in order)

1. `src/service/platforms/platform.ts` - Create factory function
2. `src/service/platforms/server/server-platform.ts` - Create ServerPlatform
3. `src/service/platforms/server/server/server.ts` - Refactor (remove registration methods)
4. `src/service/platforms/server/server-registration.ts` - Create registration functions
5. `src/service/platforms/cli/cli-platform.ts` - Create CLIPlatform
6. `src/service/platforms/desktop/desktop-platform.ts` - Create DesktopPlatform
7. `src/service/service.ts` - Simplify to orchestrator
8. `src/service/platforms/index.ts` - Update exports
9. `test/**` - Update all tests
10. `apps/*/` - Update examples

### Expected Outcome

Refactored Zacatl v0.1.0 with:

- ✅ Concrete Platform factory function (no abstract base)
- ✅ ServerPlatform/CLIPlatform/DesktopPlatform classes
- ✅ Server class receives entry points in constructor
- ✅ Functional registration (registerRestRoutes, registerRestHooks)
- ✅ Service as thin orchestrator
- ✅ All 183+ tests passing (≥79% coverage)
- ✅ Examples refactored
- ✅ Migration guide (v0.0.27 → v0.1.0)
- ✅ Published to npm

---

## ADR Document Location

**File:** `docs/internal/adr-platform-server-refactoring.md`

Contains: Full design spec, type definitions, flow diagrams, implementation plan, migration path, security considerations.

**Use it as:** Reference during implementation, not something to change.

---

**Next Session Start:** Implement Priority 1 - Platform factory function and concrete platform classes
