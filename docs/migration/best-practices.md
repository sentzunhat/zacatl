# Migration Best Practices

Recommended patterns and tips for migrating to the new `Service` API.

## 🎯 Key Principles

1. **Config-Based DI** - Let Zacatl handle dependency injection
2. **Separation of Concerns** - Keep config separate from logic
3. **Type Safety** - Use enums, not strings
4. **Minimal Entry Point** - Keep index.ts simple
5. **Progressive Enhancement** - Start simple, add complexity as needed

## ✅ Recommended Patterns

### 1. Entry Point Structure

**Best:**

```typescript
import "reflect-metadata";
import "./init-di"; // Only if needed for custom DI
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl/service";
import { createServiceConfig } from "./config";

const fastify = Fastify({ logger: false });
const sequelize = new Sequelize({ dialect: "sqlite", storage: "db.sqlite" });

const service = new Service(createServiceConfig(fastify, sequelize));
await service.start({ port: 8081 });
```

**Why:**

- ✅ Single responsibility (just bootstrap)
- ✅ Easy to test (config is separate)
- ✅ Clear dependencies

**Avoid:**

```typescript
// ❌ Too much logic in entry point
import "reflect-metadata";
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl/service";
import { UserRepository } from "./repositories/user";
// ... 50 more imports

// ❌ Manual DI registration
for (const dep of dependencies) {
  container.register(dep, { useValue: new dep() });
}

// ❌ Inline config (hard to maintain)
const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      name: "my-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: Fastify(),
      },
      databases: [
        // ... 50 lines of config
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [Repo1, Repo2 /* ... 20 more */],
    },
    // ... more
  },
});
```

### 2. Configuration Pattern

**Best: Separate config.ts**

```typescript
// config.ts
import type { FastifyInstance } from "fastify";
import type { Sequelize } from "sequelize";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import { GetAllUsersHandler } from "./application/handlers/get-all-users.handler";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import { UserService } from "./domain/services/user.service";

export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || "8081", 10),
  databaseUrl: process.env.DATABASE_URL || "sqlite:database.sqlite",
};

export function createServiceConfig(
  fastify: FastifyInstance,
  sequelize: Sequelize,
) {
  return {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: "user-service",
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
        },
        databases: [
          {
            vendor: DatabaseVendor.SEQUELIZE,
            instance: sequelize,
            connectionString: config.databaseUrl,
          },
        ],
      },
    },
    layers: {
      infrastructure: { repositories: [UserRepository] },
      domain: { services: [UserService] },
      application: {
        entryPoints: {
          rest: {
            routes: [GetAllUsersHandler],
          },
        },
      },
    },
  };
}
```

**Why:**

- ✅ Single source of truth
- ✅ Easy to test (export config function)
- ✅ Clear structure
- ✅ Type-safe

### 3. DI Pattern

**Best: Use Class-Token Injection**

```typescript
import { singleton, inject } from "tsyringe";

@singleton()
export class UserService {
  constructor(
    @inject(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async getUser(id: string) {
    return this.userRepository.findById(id);
  }
}
```

**Why:**

- ✅ Auto-wired by Zacatl
- ✅ Type-safe
- ✅ No manual container code

**Avoid:**

```typescript
// ❌ Manual token registration
container.register("UserRepository", {
  useClass: UserRepository,
});

// ❌ String tokens
constructor(
  @inject("UserRepository")
  private readonly userRepository: UserRepository
) {}
```

### 4. Handler Pattern

**Best: Extend AbstractRouteHandler**

```typescript
import { singleton, inject } from "tsyringe";
import { AbstractRouteHandler, type Request } from "@sentzunhat/zacatl/service";
import type { FastifyReply } from "fastify";

@singleton()
export class GetAllUsersHandler extends AbstractRouteHandler<
  void,
  void,
  User[]
> {
  constructor(
    @inject(UserService)
    private readonly userService: UserService,
  ) {
    super({
      url: "/users",
      method: "GET",
      schema: {
        response: {
          200: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
      },
    });
  }

  async handler(request: Request<void>, reply: FastifyReply): Promise<User[]> {
    return this.userService.getAllUsers();
  }
}
```

**Why:**

- ✅ Auto-registered from config
- ✅ Type-safe request/response
- ✅ Schema validation built-in
- ✅ Testable

### 5. Repository Pattern

**Best: Use BaseRepository with ORMType**

```typescript
import { singleton, inject } from "tsyringe";
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import type { Model } from "sequelize";

@singleton()
export class UserRepository extends BaseRepository<User, string, UserModel> {
  constructor(@inject("Sequelize") sequelize: Sequelize) {
    const UserModel = initUserModel(sequelize);
    super(UserModel, ORMType.Sequelize);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.model.findOne({ where: { email } });
    return result ? result.toJSON() : null;
  }
}
```

**Why:**

- ✅ Type-safe domain/input/output
- ✅ Standard CRUD operations
- ✅ Easy to swap ORMs

## 🎯 Migration Strategies

### Strategy 1: Big Bang (Small Services)

**When:** Service has < 10 files, < 3 layers

**How:**

1. Stop service
2. Update all files at once
3. Test thoroughly
4. Deploy

**Time:** 30-60 minutes

### Strategy 2: Incremental (Medium Services)

**When:** Service has 10-50 files, multiple areas

**How:**

1. Create parallel config (old + new)
2. Migrate one area at a time
3. Test each area
4. Switch config when done

**Time:** 2-4 hours over 1-2 days

### Strategy 3: Side-by-Side (Large Services)

**When:** Service has 50+ files, critical production

**How:**

1. Create new service instance
2. Run old + new in parallel
3. Gradual traffic shift
4. Deprecate old service

**Time:** 1-2 weeks

## ⚡ Performance Tips

### 1. Disable Logger in Production

```typescript
const fastify = Fastify({ logger: false }); // Faster!
```

### 2. Use Bun Runtime

```bash
bun src/index.ts  # 2-3x faster startup vs Node.js
```

### 3. Minimal Middleware

```typescript
// ✅ Start with zero middleware
const fastify = Fastify({ logger: false });

// ❌ Don't add all at once
await fastify.register(cors);
await fastify.register(helmet);
await fastify.register(swagger);
await fastify.register(openTelemetry);
// Add only what you need!
```

### 4. Lazy Load Heavy Dependencies

```typescript
// ✅ Import only what you use
import { Service } from "@sentzunhat/zacatl/service";

// ❌ Don't import everything
import * as Zacatl from "@sentzunhat/zacatl";
```

## 🚫 Common Mistakes

### 1. Forgetting reflect-metadata

```typescript
// ❌ Missing
import { Service } from "@sentzunhat/zacatl/service";

// ✅ Correct
import "reflect-metadata"; // FIRST!
import { Service } from "@sentzunhat/zacatl/service";
```

### 2. Manual DI with Auto DI

```typescript
// ❌ Don't mix patterns
for (const dep of deps) {
  container.register(dep, { useValue: new dep() });
}
const service = new Service({ layers: { ... } });  // Already registers!

// ✅ Pick one
const service = new Service({ layers: { ... } });  // Auto DI
```

### 3. Using String Literals

```typescript
// ❌ Not type-safe
vendor: "MONGOOSE";

// ✅ Type-safe
vendor: DatabaseVendor.MONGOOSE;
```

### 4. Inline Config

```typescript
// ❌ Hard to test/maintain
const service = new Service({
  /* 100 lines */
});

// ✅ Separate config
const service = new Service(createServiceConfig(fastify, db));
```

## 📚 Next Steps

- 🏆 [Example Migration](./EXAMPLE-MICTLAN.md) - See it in action
- ⚡ [Quick Reference](./old-to-new-api.md) - API cheat sheet
- 📖 [Step-by-Step Guide](./step-by-step.md) - Detailed process
