# Dependency Injection Guide

Complete guide to dependency injection patterns in Zacatl.

> **⚠️ Class Tokens vs String Tokens:** The canonical pattern uses **class-based tokens** (`@inject(MyClass)`) for automatic type safety and resolution. String tokens (`@inject("myToken")`) require manual registration and are only for advanced use cases. See [String Token Warning](#string-token-warning) below.

---

## Overview

Zacatl uses [tsyringe](https://github.com/microsoft/tsyringe) for dependency injection. Choose the approach that fits your app:

| Approach                    | Best For                               | Pros                                                                                       | Cons                                |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------- |
| **1. Decorators**           | Standalone modules, libraries          | ✅ Minimal setup<br>✅ Standard tsyringe pattern<br>✅ Fine-grained control                | ⚠️ Manual registration calls needed |
| **2. Service Architecture** | REST APIs, microservices, full apps ⭐ | ✅ **Zero manual registration**<br>✅ Automatic layer wiring<br>✅ Best practices enforced | ⚠️ Requires layer structure         |

**Recommendation:** Use **Service Architecture** for production applications — it automates everything and keeps DI complexity out of your code.

---

## Approach 1: Decorators (Recommended for Production)

**Best for:** Standard TypeScript apps compiled with `tsc`

### Setup

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Basic Usage

```typescript
import {
  inject,
  singleton,
  BadRequestError,
  ValidationError,
  InternalServerError,
} from "@sentzunhat/zacatl";

// Define a repository
@singleton()
class UserRepository {
  async findById(id: string) {
    // Implementation
    return { id, name: "John Doe" };
  }
}

// Inject dependencies
@singleton()
class UserService {
  constructor(
    @inject(UserRepository)
    private userRepo: UserRepository,
  ) {}

  async getUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new BadRequestError({
        message: "User not found",
        reason: "USER_NOT_FOUND",
      });
    }
    return user;
  }
}

// Multiple dependencies
@singleton()
class NotificationService {
  constructor(
    @inject(UserRepository)
    private userRepo: UserRepository,
    @inject(EmailService)
    private emailService: EmailService,
    @inject(LogService)
    private logService: LogService,
  ) {}

  async notifyUser(userId: string, message: string) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      this.logService.warn(`User ${userId} not found`);
      return;
    }

    await this.emailService.send(user.email, message);
    this.logService.info(`Notification sent to ${userId}`);
  }
}
```

  ### Manual Registration Helpers (Advanced)

  If you are not using the Service architecture, prefer Zacatl's DI helper functions
  over calling `container.register(...)` directly.

  ```typescript
  import {
    registerDependency,
    registerSingleton,
    registerValue,
    resolveDependency,
  } from "@sentzunhat/zacatl/dependency-injection";

  registerDependency(UserService, UserService);
  registerSingleton(NotificationService, NotificationService);

  const userRepository = new UserRepository();
  registerValue(UserRepository, userRepository);

  const service = resolveDependency<UserService>(UserService);
  ```

  Use this approach only when you intentionally manage DI outside of the Service
  layers. For most applications, the Service architecture is simpler and more robust.

### Real-World Example

From a production authentication service:

```typescript
import {
  inject,
  singleton,
  BadRequestError,
  ValidationError,
  InternalServerError,
} from "@sentzunhat/zacatl";

@singleton()
export class AttestOptionsProviderAdapter {
  constructor(
    @inject(DeviceProviderAdapter)
    private deviceProvider: DeviceProviderAdapter,
    @inject(ChallengeRepositoryAdapter)
    private challengeRepository: ChallengeRepositoryAdapter,
    @inject(SessionProviderAdapter)
    private sessionProvider: SessionProviderAdapter,
  ) {}

  public async generate(input: AttestGenerateOptionsInput) {
    const { token, fingerprint, tenantId, partnerId } = input;

    if (!token) {
      throw new BadRequestError({
        message: "invalid token",
        reason: "CLIENT_TOKEN_MISSING",
      });
    }

    // Use injected dependencies
    const device = await this.deviceProvider.get({
      fingerprint,
      tenancy: { partnerId, tenantId },
    });

    const challenge = await this.challengeRepository.create({
      value: this.generateChallengeValue(),
      deviceId: device.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    return {
      value: challenge.value,
      token: device.token.server,
    };
  }
}
```

---

---

## Approach 2: Service Architecture (Full-Stack Apps)

**Best for:** REST APIs, microservices, full applications — **automatic DI with zero manual registration**

The Service architecture handles ALL DI registration automatically. Just pass your layer classes to the Service constructor, and it wires everything together.

### What Service Does Automatically

When you pass classes to the Service:

```typescript
new Service({
  layers: {
    domain: { providers: [OrderService, UserService] },
    infrastructure: { repositories: [OrderRepo, UserRepo] },
    application: {
      entryPoints: { rest: { routes: [GetOrderHandler, CreateOrderHandler] } },
    },
  },
});
```

The Service automatically:

1. **Scans all classes** for `@singleton()` and `@inject()` decorators
2. **Registers each class** with the tsyringe container
3. **Resolves all dependencies** based on constructor `@inject()` annotations
4. **Creates instances** when layers start
5. **Injects resolved dependencies** into all handlers before routing

No manual `container.register()` calls needed.

### Domain Layer: `providers` vs `services`

Both `providers` and `services` are valid in domain layer config:

```typescript
domain: {
  providers: [UserService, AuthService],  // Business logic providers
  services: [EmailWorker, JobProcessor],  // Service/worker classes
}
```

**Use `providers`** for business logic consumed by handlers.
**Use `services`** for CLI commands, workers, or standalone services.

Both work identically - choose based on semantic meaning. See [Layer Registration](../service/layer-registration.md#domain-layer-providers-vs-services) for details.

### Basic Setup

```typescript
import { Service, singleton } from "@sentzunhat/zacatl";

// Define your classes
@singleton()
class EmailProvider {
  async send(to: string, message: string) {
    console.log(`Email sent to ${to}`);
  }
}

@singleton()
class UserProvider {
  constructor(private emailProvider: EmailProvider) {}

  async createUser(email: string) {
    // Create user...
    await this.emailProvider.send(email, "Welcome!");
    return { id: "123", email };
  }
}

// Service auto-registers everything
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    domain: {
      providers: [EmailProvider, UserProvider],
    },
  },
});

await service.start();
```

✅ No manual DI setup. No `container.register()`. No boilerplate.

See the [Service Adapter Pattern](../service/service-adapter-pattern.md) for full details.

---

## Common Patterns

### Pattern 1: Repository with Service

```typescript
import { inject, singleton, NotFoundError } from "@sentzunhat/zacatl";

@singleton()
class UserRepository {
  async findById(id: string) {
    // DB query
    return { id, email: "user@example.com" };
  }

  async create(data: any) {
    // DB insert
    return { id: "new-id", ...data };
  }
}

@singleton()
class UserService {
  constructor(
    @inject(UserRepository)
    private userRepo: UserRepository,
  ) {}

  async getUser(id: string) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError({
        message: "User not found",
        reason: "USER_NOT_FOUND",
      });
    }
    return user;
  }
}
```

### Pattern 2: Multiple Dependencies

```typescript
@singleton()
class OrderService {
  constructor(
    @inject(OrderRepository)
    private orderRepo: OrderRepository,
    @inject(PaymentProvider)
    private paymentProvider: PaymentProvider,
    @inject(EmailProvider)
    private emailProvider: EmailProvider,
    @inject(Logger)
    private logger: Logger,
  ) {}

  async createOrder(userId: string, items: Item[]) {
    this.logger.info(`Creating order for user ${userId}`);

    const order = await this.orderRepo.create({ userId, items });
    await this.paymentProvider.charge(order.total);
    await this.emailProvider.sendOrderConfirmation(userId, order);

    return order;
  }
}
```

### Pattern 3: Abstract-Class DI (Manual Binding)

```typescript
import { inject, singleton, container } from "@sentzunhat/zacatl";

// Define abstract token
abstract class NotificationService {
  abstract send(userId: string, message: string): Promise<void>;
}

// Implementations
@singleton()
class EmailNotificationService extends NotificationService {
  async send(userId: string, message: string) {
    console.log(`Email to ${userId}: ${message}`);
  }
}

@singleton()
class SmsNotificationService extends NotificationService {
  async send(userId: string, message: string) {
    console.log(`SMS to ${userId}: ${message}`);
  }
}

// Manual binding (must run before Service creation)
container.registerSingleton(NotificationService, EmailNotificationService);

// Inject by class token
@singleton()
class UserService {
  constructor(
    @inject(NotificationService)
    private notificationService: NotificationService,
  ) {}
}
```

**Note:** Prefer class-based injection with concrete providers. Use abstract tokens only when you need a swappable contract, and bind them manually before creating a `Service`.

---

## Best Practices

### 1. Choose the Right Approach

```typescript
// ✅ Production app with tsc - use decorators
@singleton()
class MyService {
  constructor(@inject(MyRepo) private repo: MyRepo) {}
}

// ✅ CLI tool with tsx - use helpers
registerSingletonWithDependencies(MyRepo);
registerSingletonWithDependencies(MyService, [MyRepo]);

// ✅ Full REST API - use Service architecture
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    domain: { providers: [MyService, MyRepo] },
  },
});
```

### 2. Keep Dependencies Explicit

```typescript
// ✅ Good - clear what's needed
@singleton()
class OrderService {
  constructor(
    @inject(OrderRepo) private orderRepo: OrderRepo,
    @inject(PaymentService) private paymentService: PaymentService,
  ) {}
}

// ❌ Bad - hidden dependency
@singleton()
class OrderService {
  async createOrder() {
    const paymentService = resolveDependency<PaymentService>(PaymentService);
  }
}
```

### 3. Use Interfaces for Flexibility

> **⚠️ String Token Warning:** This pattern uses string tokens and requires manual registration. Only use this for advanced cases where you need runtime polymorphism. The canonical pattern uses class tokens.

```typescript
// Define contract
interface ILogger {
  log(message: string): void;
}

// Multiple implementations
class ConsoleLogger implements ILogger {
  log(message: string) {
    console.log(message);
  }
}

class FileLogger implements ILogger {
  log(message: string) {
    fs.appendFileSync("app.log", message + "\n");
  }
}

// Manual registration with string token (advanced only)
container.register<ILogger>("ILogger", {
  useClass: process.env.NODE_ENV === "production" ? FileLogger : ConsoleLogger,
});

// Inject using string token
class MyService {
  constructor(@inject("ILogger") private logger: ILogger) {}
}
```

**Preferred alternative using class tokens:**

```typescript
// Use abstract class instead of interface for DI
abstract class LoggerPort {
  abstract log(message: string): void;
}

@singleton()
class ConsoleLogger extends LoggerPort {
  log(message: string) {
    console.log(message);
  }
}

// Register concrete implementation
container.registerInstance(LoggerPort, new ConsoleLogger());

// Inject using class token (automatic type safety)
@singleton()
class MyService {
  constructor(@inject(LoggerPort) private logger: LoggerPort) {}
}
```

### 4. Avoid Circular Dependencies

```typescript
// ❌ Bad - circular dependency
@singleton()
class UserService {
  constructor(@inject(OrderService) private orderService: OrderService) {}
}

@singleton()
class OrderService {
  constructor(@inject(UserService) private userService: UserService) {}
}

// ✅ Good - introduce a third service
@singleton()
class UserOrderCoordinator {
  constructor(
    @inject(UserService) private userService: UserService,
    @inject(OrderService) private orderService: OrderService,
  ) {}
}
```

---

## Troubleshooting

### "TypeInfo not known" Errors

**Problem:** Getting errors like `TypeInfo not known for "MyClass"` when using tsx or ts-node

**Solution:** Use helper functions instead of decorators:

```typescript
// Instead of decorators
import { registerSingletonWithDependencies } from "@sentzunhat/zacatl";

registerSingletonWithDependencies(MyRepository);
registerSingletonWithDependencies(MyService, [MyRepository]);
```

### Dependency Not Registered

**Problem:** `Error: Dependency X not registered`

**Solution:** Register dependencies **before** dependents:

```typescript
// ✅ Correct order
registerSingletonWithDependencies(Logger);
registerSingletonWithDependencies(Database, [Logger]);
registerSingletonWithDependencies(Service, [Database, Logger]);
```

### Getting Different Instances

**Problem:** Expecting singleton behavior but getting new instances

**Solution:** Use `registerSingletonWithDependencies` not `registerWithDependencies`:

```typescript
// ✅ Singleton - same instance
registerSingletonWithDependencies(MyService, []);

// ❌ Transient - new instances
registerWithDependencies(MyService, []);
```

---

## String Token Warning

**String tokens are for advanced/manual use only.** The canonical Zacatl pattern uses **class-based tokens** for automatic type safety.

### ❌ Avoid String Tokens

```typescript
// String token - requires manual registration, no type safety
container.registerInstance("MyRepository", new MyRepositoryAdapter());

@singleton()
class MyService {
  constructor(@inject("MyRepository") private repo: any) {}
  //                 ^^^^^^^^^^^^^^^^           ^^^ - loses type safety
}
```

### ✅ Use Class Tokens

```typescript
// Class token - automatic type resolution and type safety
container.registerInstance(MyRepositoryAdapter, new MyRepositoryAdapter());

@singleton()
class MyService {
  constructor(@inject(MyRepositoryAdapter) private repo: MyRepositoryAdapter) {}
  //                 ^^^^^^^^^^^^^^^^^^^^           ^^^^^^^^^^^^^^^^^^^^ - full type safety
}
```

**When to use abstract classes instead of interfaces:**

```typescript
// Abstract class can be used as a DI token
abstract class RepositoryPort {
  abstract findById(id: string): Promise<Model>;
}

// Concrete implementation
@singleton()
class SequelizeRepository extends RepositoryPort {
  async findById(id: string) {
    /* ... */
  }
}

// Register and inject using class token
container.registerInstance(RepositoryPort, new SequelizeRepository());

@singleton()
class Service {
  constructor(@inject(RepositoryPort) private repo: RepositoryPort) {}
}
```

**Only use string tokens when:**

- You need runtime polymorphism that can't be achieved with class tokens
- You're integrating with third-party code that requires string tokens
- You understand you must manually register every string token before use

---

## Migration from Older Versions

### From Manual DI (pre-v0.0.26)

**Before:**

```typescript
container.register(Logger, { useClass: Logger });
container.register(Database, {
  useFactory: (c) => new Database(c.resolve(Logger)),
});
```

**After:**

```typescript
registerSingletonWithDependencies(Logger);
registerSingletonWithDependencies(Database, [Logger]);
```

---

---

## Importing from Zacatl

**Recommended:** Import everything from `@sentzunhat/zacatl`:

```typescript
import {
  // DI decorators and container
  inject,
  singleton,
  container,

  // Errors
  BadRequestError,
  ValidationError,
  NotFoundError,

  // Other utilities
  Service,
  BaseRepository,
} from "@sentzunhat/zacatl";
```

This ensures you're using the correct versions bundled with Zacatl. You can also import directly from `tsyringe` if needed, but the Zacatl exports are recommended for consistency.

---

## See Also

- [Service Adapter Pattern](../service/service-adapter-pattern.md)
- [tsyringe Documentation](https://github.com/microsoft/tsyringe)
- [Error Handling](../error/README.md)
- [Examples](../../examples/)
