# Zacatl Naming Conventions Implementation Guide

## Quick Reference

### Type Aliases

```typescript
// ✅ DO: Use descriptive suffixes
export type CreateUserInput = { name: string; email: string };
export type UserOutput = { id: string; name: string; email: string };
export type DatabaseConfig = { host: string; port: number };
export type UserDocument = Document<ObjectId, {}, User>;
export type ErrorType = "validation" | "unauthorized" | "not_found";

// ❌ DON'T: Ambiguous names without suffixes
export type User = { ... };        // Use UserOutput or UserDocument
export type CreateUser = { ... };  // Use CreateUserInput
```

### Interfaces

#### Adapter Pattern

```typescript
// ✅ DO: Suffix with Adapter
export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string): Promise<any[]>;
}

export interface LoggerAdapter {
  log(message: string): void;
  error(message: string, err?: Error): void;
}

// Implementation
export class PostgresAdapter implements DatabaseAdapter { ... }
export class PinoLoggerAdapter implements LoggerAdapter { ... }
```

#### Service Layer

```typescript
// ✅ DO: Service contracts
export interface UserService {
  createUser(input: CreateUserInput): Promise<UserOutput>;
  getUserById(id: string): Promise<UserOutput | null>;
  updateUser(id: string, input: Partial<CreateUserInput>): Promise<UserOutput>;
}

export class UserServiceImpl implements UserService { ... }
```

#### Repository Pattern

```typescript
// ✅ DO: Data access layer
export interface UserRepository {
  save(user: UserInput): Promise<UserOutput>;
  findById(id: string): Promise<UserOutput | null>;
  findAll(): Promise<UserOutput[]>;
}

export class MongoUserRepository extends BaseRepository<User, UserInput, UserOutput> { ... }
```

### Classes

#### Adapter Implementation

```typescript
// ✅ DO: Concrete adapter with suffix
export class FastifyAdapter implements ServerAdapter {
  public registerRoute(handler: RouteHandler): void { ... }
  public registerHook(handler: HookHandler): void { ... }
  private registerFastifyRoutes(): void { ... }
}

export class ExpressAdapter implements ServerAdapter {
  public registerRoute(handler: RouteHandler): void { ... }
  private setupMiddleware(): void { ... }
}

// ❌ DON'T: Generic names
export class Fastify { ... }
export class ExpressServer { ... }
```

#### Service Implementation

```typescript
// ✅ DO: Service classes
export class UserAuthService {
  public async login(credentials: LoginInput): Promise<TokenOutput> { ... }
  public async validateToken(token: string): Promise<boolean> { ... }
  private async generateToken(userId: string): Promise<string> { ... }
}

export class NotificationService {
  public async sendEmail(input: EmailInput): Promise<void> { ... }
  private validateEmailAddress(email: string): boolean { ... }
}
```

### Methods

#### Public Method Naming

| Pattern             | Usage                    | Examples                                    |
| ------------------- | ------------------------ | ------------------------------------------- |
| `get<Type>()`       | Retrieve typed instances | `getMongooseModel()`, `getUserById()`       |
| `register<Type>()`  | Register dependencies    | `registerRoute()`, `registerDependencies()` |
| `create<Type>()`    | Create/instantiate       | `createUserService()`                       |
| `find<Criterion>()` | Query data               | `findById()`, `findByEmail()`               |
| `is<Type>()`        | Type guards              | `isMongoose()`, `isSequelize()`             |
| `to<Format>()`      | Transform/convert        | `toLean()`, `toJSON()`                      |
| `serve<Type>()`     | Server operations        | `serveStatic()`                             |
| `update<Type>()`    | Modify data              | `updateUser()`                              |
| `delete<Type>()`    | Remove data              | `deleteUser()`                              |

```typescript
// ✅ DO: Consistent verb+noun pattern
export class UserRepository {
  public async getUserById(id: string): Promise<UserOutput | null> { ... }
  public async createUser(input: UserInput): Promise<UserOutput> { ... }
  public async updateUser(id: string, update: Partial<UserInput>): Promise<UserOutput> { ... }
  public async deleteUser(id: string): Promise<void> { ... }
  public async findUsersByRole(role: string): Promise<UserOutput[]> { ... }
  public isUserActive(user: UserOutput): boolean { ... }
  public toLean(doc: MongooseDocument): UserOutput { ... }
}

export class ConfigService {
  public registerDependency(key: string, value: any): void { ... }
  public getDependency<T>(key: string): T { ... }
}
```

#### Private Method Naming

| Pattern              | Usage                 | Examples                                   |
| -------------------- | --------------------- | ------------------------------------------ |
| `ensure<State>()`    | Verify preconditions  | `ensureInitialized()`, `ensureConnected()` |
| `load<Resource>()`   | Load/initialize       | `loadAdapter()`, `loadConfiguration()`     |
| `validate<Type>()`   | Validate data         | `validateConfig()`, `validateInput()`      |
| `register<Type>()`   | Internal registration | `registerRest()`, `registerMiddleware()`   |
| `check<Condition>()` | Check state           | `checkPermissions()`                       |
| `initialize<Type>()` | Setup                 | `initializeDatabase()`                     |

```typescript
// ✅ DO: Ensure* and validate* patterns for private methods
export class BaseRepository<D, I, O> {
  private async ensureInitialized(): Promise<void> { ... }
  private async loadAdapter(): Promise<void> { ... }
  private validateConfig(config: any): void { ... }
}

export class Service {
  private validateConfig(config: ConfigService): void { ... }
  private async ensureAllLayersInitialized(): Promise<void> { ... }
  private registerApplicationLayer(config: ConfigService): void { ... }
}

// ❌ DON'T: Generic or unclear private method names
private init(): void { ... }           // Use ensureInitialized()
private check(): void { ... }          // Use validateConfig()
private setup(): void { ... }          // Use registerApplicationLayer()
```

### Variables & Parameters

```typescript
// ✅ DO: camelCase for all variables and parameters
const userRepository = new UserRepository(config);
const mongooseAdapter = new MongooseAdapter<User, UserInput, UserOutput>(config);

function createUserService(
  userRepository: UserRepository,
  emailService: EmailService,
  config: ServiceConfig,
): UserService {
  return new UserServiceImpl(userRepository, emailService, config);
}

// ❌ DON'T: PascalCase for variables
const UserRepository = new UserRepository(config);
const MongooseAdapter = new MongooseAdapter(config);

function CreateUserService(...) { ... }
```

### Generic Type Parameters

```typescript
// ✅ DO: Use conventional abbreviations
export interface Repository<D, I, O> {
  // D = Domain/Database model
  // I = Input type
  // O = Output type
}

export class BaseRepository<D, I, O> extends Repository<D, I, O> { ... }

export interface ORMAdapter<D, I, O> {
  create(entity: I): Promise<O>;
  toLean(input: unknown): O | null;
}

// ✅ DO: PascalCase for complex generics
export type RouteSchema<TBody, TQuery, TParams, THeaders, TResponse> = { ... };

export class AbstractRouteHandler<
  TBody = void,
  TQuerystring = void,
  TResponse = void,
  TParams = void,
  THeaders = void,
> { ... }

// ❌ DON'T: Unclear abbreviations
export interface Repository<Model, Inp, Out> { ... }  // Use D, I, O
export interface Service<DataType, InputData, ReturnType> { ... }  // Too verbose
```

### Enums

```typescript
// ✅ DO: UPPER_CASE enum members
export enum ORMType {
  Mongoose = "mongoose",
  Sequelize = "sequelize",
}

export enum ServiceType {
  CLI = "cli",
  DESKTOP = "desktop",
  SERVER = "server",
}

export enum LogLevel {
  TRACE = "trace",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

// ❌ DON'T: camelCase or mixed case
export enum ORMType {
  mongoose = "mongoose", // Use Mongoose
  sequelize = "sequelize", // Use Sequelize
}
```

### Configuration Objects

```typescript
// ✅ DO: Config suffix, readonly properties
export type DatabaseConfig = {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username: string;
  readonly password: string;
  readonly poolSize?: number;
  readonly ssl?: boolean;
};

export type MongooseRepositoryConfig<D = unknown> = {
  readonly type: ORMType.Mongoose;
  readonly name?: string;
  readonly schema: Schema<D>;
};

export type ServiceConfig = {
  readonly type?: ServiceType;
  readonly layers?: ConfigLayers;
  readonly platforms?: ConfigPlatforms;
  readonly database?: DatabaseConfig;
  readonly logger?: LoggerConfig;
};

// ❌ DON'T: Unclear config naming
export type DbSettings = { ... };       // Use DatabaseConfig
export type ServiceOptions = { ... };   // Use ServiceConfig
export type AppConfiguration = { ... }; // Too generic
```

### Error Classes

```typescript
// ✅ DO: Error suffix for clarity
export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = "Unauthorized access") {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = "Access forbidden") {
    super(message);
  }
}

// ❌ DON'T: Generic error names
export class BadRequest extends Error { ... }  // Use ValidationError or BadRequestError
export class NotFound { ... }                   // Use NotFoundError
```

## Integration with ESLint

### 1. Add the naming conventions config to your eslint.config.mjs:

```javascript
// eslint.config.mjs
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import namingConventionsConfig from "./eslint.naming-conventions.mjs";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
  resolvePluginsRelativeTo: import.meta.dirname,
});

export default [
  {
    ignores: ["build/**/*", "dist/**/*", "node_modules/**/*", "coverage/**/*"],
  },
  namingConventionsConfig,
  js.configs.recommended,
  ...compat.config({}),
];
```

### 2. Run ESLint to check your codebase:

```bash
# Check for naming convention violations
npm run lint

# Auto-fix where possible
npm run lint -- --fix
```

### 3. Integrate with your CI/CD pipeline:

```json
{
  "scripts": {
    "lint": "eslint . --config eslint.config.mjs",
    "lint:fix": "eslint . --config eslint.config.mjs --fix",
    "lint:ci": "eslint . --config eslint.config.mjs --max-warnings=0"
  }
}
```

## Common Violations & Fixes

### Violation 1: Type alias without suffix

```typescript
// ❌ BEFORE
export type User = { id: string; name: string };
export type CreateUser = { name: string; email: string };
export type UserSettings = { ... };

// ✅ AFTER
export type UserOutput = { id: string; name: string };
export type CreateUserInput = { name: string; email: string };
export type UserSettingsConfig = { ... };
```

### Violation 2: Interface with I-prefix

```typescript
// ❌ BEFORE
export interface IUserRepository { ... }
export interface ILogger { ... }

// ✅ AFTER
export interface UserRepository { ... }
export interface Logger { ... }

// Or use suffix if ambiguous:
export interface UserRepositoryPort { ... }
export interface LoggerAdapter { ... }
```

### Violation 3: Unclear private method names

```typescript
// ❌ BEFORE
private init(): void { ... }
private setup(): void { ... }
private check(): void { ... }
private load(): void { ... }

// ✅ AFTER
private ensureInitialized(): void { ... }
private registerMiddleware(): void { ... }
private validateConfig(): void { ... }
private loadAdapter(): void { ... }
```

### Violation 4: Variable naming

```typescript
// ❌ BEFORE
const UserService = new UserService();
const MongoAdapter = new MongooseAdapter();
const DbConnection = await createConnection();

// ✅ AFTER
const userService = new UserService();
const mongoAdapter = new MongooseAdapter();
const dbConnection = await createConnection();
```

### Violation 5: Generic type abbreviations

```typescript
// ❌ BEFORE
export class Repository<Model, Inp, Out> { ... }
export interface Service<T, I, R> { ... }

// ✅ AFTER
export class Repository<D, I, O> { ... }
export interface Service<D, I, O> { ... }
```

## Benefits of Following These Conventions

1. **Consistency**: Patterns are predictable across the codebase
2. **Discoverability**: Clear suffixes make it easy to find related classes/types
3. **Type Safety**: Explicit naming prevents confusion between Input/Output types
4. **Maintainability**: New developers quickly understand code structure
5. **Refactoring**: Automated tools can identify violations and suggest fixes
6. **Documentation**: Naming itself documents intent (Adapter vs Service vs Repository)

## References

- [TypeScript ESLint Naming Convention](https://typescript-eslint.io/rules/naming-convention/)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Clean Code naming conventions](https://www.books.google.com/books?id=hjEFCAAAQBAJ)
