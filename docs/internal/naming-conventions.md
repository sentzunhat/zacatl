# Zacatl Naming Conventions & ESLint Rules

## Overview

This document details the naming patterns discovered in the Zacatl codebase and provides ESLint configuration rules to enforce consistency across the project.

## 1. Discovered Naming Patterns

### 1.1 Type Aliases

**Suffixes Used:**

- `Input` - Data structures passed into functions/handlers
- `Output` - Data returned from functions/handlers
- `Config` - Configuration objects (e.g., `ProxyConfig`, `StaticConfig`)
- `Document` - Document/model representations (Mongoose-specific)
- `Type` - Enums and literal types (e.g., `LoggerAdapterType`)

**Examples:**

```typescript
export type LoggerInput = { data?: unknown; details?: unknown } | undefined;
export type HandlerOutput<TResponse> = TResponse;
export type ProxyConfig = { upstream: string; prefix: string; ... };
export type MongooseDocument<Db> = Document<...>;
export type LoggerAdapterType = "pino" | "console";
export type ToLeanInput<D, T> = MongooseDoc<D> | LeanDocument<T> | null | undefined;
```

**Pattern Consistency:** ✅ High - Consistent use of descriptive suffixes

---

### 1.2 Interfaces

**Suffixes Used:**

- `Adapter` - Implementation interfaces for pluggable architectures
- `Service` - Service layer contracts
- `Repository` - Data access layer contracts
- `Logger`, `Handler`, `Config` - Feature-specific interfaces

**Examples:**

```typescript
export interface I18nAdapter { ... }           // Adapter pattern
export interface ServerAdapter { ... }         // Adapter pattern
export interface ORMAdapter<D, I, O> { ... }  // Generic adapter
export interface Logger { ... }                // Main logger interface
export interface LoggerAdapter { ... }         // Logger implementation interface
export interface IRepository<T> { ... }        // Repository interface (I-prefix)
```

**Naming Issues Found:**

- Mixed convention: `IRepository` uses I-prefix (Hungarian notation) while others don't
- Recommendation: Standardize on one approach (prefer no prefix for consistency with modern conventions)

---

### 1.3 Classes

**Suffixes Used:**

- `Adapter` - Concrete adapter implementations
- `Service` - Service classes
- `Repository` - Repository implementations
- `Handler` - Request/event handlers

**Examples:**

```typescript
export class FastifyAdapter implements ServerAdapter { ... }
export class ExpressAdapter implements ServerAdapter { ... }
export class MongooseAdapter<D, I, O> implements ORMAdapter<D, I, O> { ... }
export class SequelizeAdapter<D extends Model, I, O> implements ORMAdapter<D, I, O> { ... }
export class FilesystemAdapter implements I18nAdapter { ... }
export class MemoryAdapter implements I18nAdapter { ... }
export class ConsoleLoggerAdapter implements LoggerAdapter { ... }
export class PinoLoggerAdapter implements LoggerAdapter { ... }
export class Service { ... }
export class AbstractRouteHandler<...> implements RouteHandler<...> { ... }
```

**Pattern Consistency:** ✅ Very High - Adapter suffixes consistently applied

---

### 1.4 Methods & Functions

**Public Method Patterns:**

- `get<Type>()` - Retrieve typed instances (e.g., `getMongooseModel()`, `getSequelizeModel()`)
- `register<Type>()` - Register dependencies/handlers (e.g., `registerRoute()`, `registerHook()`)
- `load<Type>()` - Load/initialize resources (e.g., `loadMongooseAdapter()`)
- `create<Type>()` - Create instances (factory pattern)
- `find<Criterion>()` - Data queries (e.g., `findById()`)
- `is<Type>()` - Type guards/checks (e.g., `isMongoose()`, `isSequelize()`)
- `to<Format>()` - Type conversions (e.g., `toLean()`)
- `serve<Type>()` - Server methods (e.g., `serveStatic()`)

**Examples:**

```typescript
// Getters
public getMongooseModel(): MongooseModel<D> { ... }
public getSequelizeModel(): ModelStatic<any> { ... }

// Type guards
public isMongoose(): boolean { ... }
public isSequelize(): boolean { ... }

// Registration
public register(dependency: Constructor<T>): void { ... }
registerRoute(handler: RouteHandler): void;
registerHook(handler: HookHandler): void;

// Conversions
toLean(input: unknown): O | null;

// Server
listen(port: number): Promise<void>;
registerProxy(config: ProxyConfig): void;
serveStatic(config: StaticConfig): void;

// Handlers
execute(...): Promise<void>;
handler(...): Promise<HandlerOutput<TResponse>> | HandlerOutput<TResponse>;
```

**Private Method Patterns:**

- `ensure<State>()` - Ensure preconditions (e.g., `ensureInitialized()`)
- `load<Resource>()` - Load resources (e.g., `loadAdapter()`)
- `validate<Type>()` - Validate data (e.g., `validateConfig()`)
- `register<Type>()` - Internal registration (e.g., `registerRest()`)

**Examples:**

```typescript
private async ensureInitialized(): Promise<void> { ... }
private async loadAdapter(): Promise<void> { ... }
private validateConfig(config: ConfigService): void { ... }
private register(): void { ... }
private registerRest(): void { ... }
```

**Pattern Consistency:** ✅ Very High - Verb+Noun pattern universally applied

---

### 1.5 Generic Type Parameters

**Convention:**

- Single uppercase letters for simple types: `<T>`, `<D>`, `<I>`, `<O>`
- Prefixed lowercase for domain-specific: `<D>` (Domain/Database), `<I>` (Input), `<O>` (Output)

**Examples:**

```typescript
export interface ORMAdapter<D, I, O> { ... }      // D=Domain, I=Input, O=Output
export interface Repository<D, I, O> { ... }     // Same pattern
export type BaseRepositoryConfig<D = unknown> = ...
export class BaseRepository<D, I, O> { ... }
export type RouteSchema<TBody, TQuerystring, TParams, THeaders, TResponse> { ... }
```

**Pattern Consistency:** ✅ High - Consistent abbreviations across domain

---

### 1.6 Configuration Objects

**Pattern:**

- Suffix: `Config` or `Configuration`
- Properties: camelCase with optional readonly modifier
- Nested configs for complex structures

**Examples:**

```typescript
export type ProxyConfig = {
  upstream: string;
  prefix: string;
  rewritePrefix?: string;
  http2?: boolean;
};

export type StaticConfig = {
  root: string;
  prefix?: string;
};

export type MongooseRepositoryConfig<D = unknown> = {
  readonly type: ORMType.Mongoose;
  readonly name?: string;
  readonly schema: Schema<D>;
};
```

**Pattern Consistency:** ✅ High - Consistent structure across configs

---

## 2. Verb-Noun Method Patterns Analysis

### Active Patterns Found:

| Category              | Verb       | Pattern          | Examples                                                      |
| --------------------- | ---------- | ---------------- | ------------------------------------------------------------- |
| **Initialization**    | `ensure`   | `ensure<State>`  | `ensureInitialized()`                                         |
| **Loading**           | `load`     | `load<Resource>` | `loadAdapter()`, `loadMongooseAdapter()`                      |
| **Validation**        | `validate` | `validate<Type>` | `validateConfig()`                                            |
| **Registration**      | `register` | `register<Type>` | `registerRoute()`, `registerHook()`, `registerDependencies()` |
| **Conversion**        | `to`       | `to<Format>`     | `toLean()`                                                    |
| **Type Guard**        | `is`       | `is<Type>`       | `isMongoose()`, `isSequelize()`                               |
| **Retrieval**         | `get`      | `get<Type>`      | `getMongooseModel()`, `getSequelizeModel()`                   |
| **Server Ops**        | `serve`    | `serve<Type>`    | `serveStatic()`                                               |
| **Listening**         | `listen`   | `listen<Config>` | `listen(port)`                                                |
| **Handler Execution** | `execute`  | `execute()`      | (async handler execution)                                     |

**Pattern Consistency:** ✅ Very High - Verb+Noun naming is dominant

---

## 3. Known Inconsistencies & Areas for Improvement

### 3.1 I-Prefix Convention (Medium Priority)

**Issue:** `IRepository` uses I-prefix (Hungarian notation)

```typescript
export interface IRepository<T> { ... }
```

**Recommendation:**

- Remove I-prefix for consistency with modern TypeScript conventions
- Rename to: `RepositoryInterface` or just `Repository`
- Update all implementations accordingly

**Impact:** Low (internal interface, not widely used in public API)

---

### 3.2 Configuration Type Naming (Low Priority)

**Current:** Mixed use of `Config` suffix

- `ProxyConfig`, `StaticConfig` (specific configs)
- `I18nConfig` (generic config)
- `LoggerConfig` (implicit via `PinoLoggerConfig`)

**Recommendation:** Consistent `Config` suffix across all configuration types

- ✅ Already mostly consistent

---

### 3.3 Error Class Naming

**Observed Pattern:**

```typescript
// From error/ directory (implied from structure)
BadRequest;
BadResource;
Forbidden;
NotFound;
Unauthorized;
ValidationError;
InternalServer;
```

**Pattern:** `<ErrorType>Error` or bare `<ErrorType>`
**Recommendation:** Standardize to `<ErrorType>Error` suffix for clarity

---

## 4. ESLint Configuration

See `eslint.config.naming-conventions.mjs` for the complete configuration that enforces:

1. **Type Aliases:**
   - `Input` suffix for input types
   - `Output` suffix for output types
   - `Config` suffix for configuration types
   - `Type` suffix for enums and literal types
   - `Document` suffix for document types

2. **Interfaces:**
   - `Adapter` suffix for adapter interfaces
   - No I-prefix convention

3. **Classes:**
   - `Adapter` suffix for adapter implementations
   - `Service` suffix for service classes

4. **Methods:**
   - Private methods: `ensure*`, `validate*`, `load*`, `register*` patterns
   - Public methods: verb+noun patterns (get, register, create, find, etc.)

5. **Variables & Parameters:**
   - camelCase for all variables, parameters, and constants
   - Avoid all-caps except for true constants

---

## 5. Summary Statistics

| Category      | Pattern         | Count | Consistency  |
| ------------- | --------------- | ----- | ------------ |
| Type Aliases  | Suffix-based    | 8+    | ✅ Very High |
| Interfaces    | Suffix-based    | 6+    | ✅ Very High |
| Classes       | Adapter pattern | 9+    | ✅ Very High |
| Methods       | Verb+Noun       | 20+   | ✅ Very High |
| Generic Types | Single letters  | 10+   | ✅ High      |
| Configs       | Config suffix   | 5+    | ✅ High      |

**Overall Code Quality Score:** 8.5/10

- Strong consistency in adapter pattern
- Excellent verb+noun method naming
- Minor issues with I-prefix convention
- Well-established configuration patterns
