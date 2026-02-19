# Layer Registration Pattern

**Zacatl** is a **library** (or toolkit) - it provides utilities you control, rather than a framework that controls your app's flow.

---

## Domain Layer: `providers` vs `services`

Both `providers` and `services` are valid options in the domain layer configuration. They serve similar purposes but have different semantic meanings:

### `providers` - Business Logic Providers

Use `providers` for domain logic classes that **provide functionality** to other layers:

```typescript
import { Service } from "@sentzunhat/zacatl";

const service = new Service({
  layers: {
    domain: {
      providers: [UserService, OrderService, PaymentService],
    },
    infrastructure: {
      repositories: [UserRepository],
    },
  },
});
```

**When to use `providers`:**

- Business logic consumed by HTTP handlers
- Domain services used by application layer
- Logic that "provides" functionality to entry points

### `services` - Service Classes

Use `services` for classes that represent executable services or workers:

```typescript
import { Service } from "@sentzunhat/zacatl";

const service = new Service({
  type: ServiceType.CLI,
  layers: {
    domain: {
      services: [CLIService, MigrationService, WorkerService],
    },
  },
});
```

**When to use `services`:**

- CLI command handlers
- Background workers or job processors
- Migration scripts
- Standalone service classes with lifecycle methods

### Both Are Valid

**Technical Note:** Both `providers` and `services` extend the same `DomainPort` interface, so they're interchangeable at the type level. The distinction is **semantic** - use the name that best describes your use case:

```typescript
// ✅ REST API - providers make sense
domain: { providers: [UserService, AuthService] }

// ✅ Worker - services make sense
domain: { services: [EmailWorker, QueueProcessor] }

// ✅ Mixed - use both!
domain: {
  providers: [BusinessLogic, DataProcessor],
  services: [BackgroundWorker, Scheduler]
}
```

**Bottom line:** Use whichever makes your code more readable. Both work identically.

---

## Centralized DI Functions

All dependency injection uses three simple functions from one place:

```typescript
import {
  registerDependencies,
  resolveDependencies,
  registerAndResolve,
} from "@sentzunhat/zacatl";
```

## Usage Pattern

### 1. Register in Correct Order

Dependencies must be registered in **layer order**:

```typescript
// ✅ Infrastructure layer FIRST - repositories (no dependencies)
registerDependencies([UserRepository, ProductRepository]);

// ✅ Domain layer SECOND - services (depend on repositories)
registerDependencies([UserService, ProductService]);

// ✅ Application layer THIRD - hooks/routes (depend on services)
registerDependencies([AuthHook, ApiRoute]);
```

### 2. Resolve When Needed

```typescript
// Resolve specific dependencies
const services = resolveDependencies([UserService, ProductService]);

// Or register and resolve in one step
const hooks = registerAndResolve([AuthHook, LoggingHook]);
```

## How It Works

### `registerDependencies(classes)`

- Registers classes with DI container
- Order in array is preserved
- No validation or topological sorting (keep it simple)
- **You** ensure correct order

### `resolveDependencies(classes)`

- Resolves already-registered classes
- Returns array of instances in same order
- Classes must be registered first

### `registerAndResolve(classes)`

- Convenience: register + resolve in one call
- Useful when you need instances immediately

## Example: Building a Service

```typescript
import {
  registerDependencies,
  resolveDependencies,
  Constructor,
} from "@sentzunhat/zacatl";

// Infrastructure
class UserRepository {
  findById(id: string) {
    return { id, name: "John" };
  }
}

class ProductRepository {
  findById(id: string) {
    return { id, price: 100 };
  }
}

// Domain
class UserService {
  constructor(private userRepo: UserRepository) {}

  getUser(id: string) {
    return this.userRepo.findById(id);
  }
}

class ProductService {
  constructor(private productRepo: ProductRepository) {}

  getProduct(id: string) {
    return this.productRepo.findById(id);
  }
}

// Application
class ApiRoute {
  constructor(
    private userService: UserService,
    private productService: ProductService,
  ) {}

  async execute() {
    const user = this.userService.getUser("1");
    const product = this.productService.getProduct("1");
    return { user, product };
  }
}

// Register in correct order
registerDependencies([UserRepository, ProductRepository]);
registerDependencies([UserService, ProductService]);
registerDependencies([ApiRoute]);

// Resolve when needed
const [route] = resolveDependencies([ApiRoute]);
await route.execute();
```

## No Inheritance Required

Previous pattern (removed):

```typescript
// ❌ OLD: Required inheritance
class MyLayer extends AbstractArchitecture {
  // Had to extend to get registerDependencies
}
```

Current pattern:

```typescript
// ✅ NEW: Just use the functions
import { registerDependencies } from "@sentzunhat/zacatl";

class MyLayer {
  constructor(config) {
    registerDependencies(config.dependencies);
  }
}
```

## Benefits

1. **No duplication** - One place for registration logic
2. **No inheritance** - Use composition instead
3. **Simple** - Three functions, easy to understand
4. **Explicit** - You control the order
5. **Maintainable** - Change once, works everywhere

## Integration with Layers

Domain and Infrastructure layers use these functions internally:

```typescript
import { Domain, Infrastructure } from "@sentzunhat/zacatl";

// Infrastructure auto-uses registerDependencies
const infra = new Infrastructure({
  repositories: [UserRepository, ProductRepository],
  autoRegister: true, // Registers on construction
});

// Domain auto-uses registerDependencies + resolveDependencies
const domain = new Domain({
  providers: [UserService, ProductService],
  autoRegister: true,
});
```
