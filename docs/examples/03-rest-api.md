# REST API (Full Example)

Complete CRUD API with validation, errors, and testing.

## File Structure

```
src/
├── domain/
│   ├── models/user.ts
│   └── services/user-service.ts
├── infrastructure/
│   └── repositories/user-repository.ts
└── application/
    └── handlers/user-handler.ts
```

## 1. Domain Model

`src/domain/models/user.ts`:

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export interface CreateUserDTO {
  name: string;
  email: string;
}
```

## 2. Repository

`src/infrastructure/repositories/user-repository.ts`:

```typescript
import { IRepository } from "@sentzunhat/zacatl";
import { User } from "../../domain/models/user";

export class UserRepository implements IRepository<User> {
  private users = new Map<string, User>();
  private nextId = 1;

  findById = async (id: string): Promise<User | null> => {
    return this.users.get(id) ?? null;
  };

  findMany = async (): Promise<User[]> => {
    return Array.from(this.users.values());
  };

  create = async (data: Omit<User, "id">): Promise<User> => {
    const user: User = { ...data, id: String(this.nextId++) };
    this.users.set(user.id, user);
    return user;
  };

  update = async (id: string, data: Partial<User>): Promise<void> => {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    this.users.set(id, { ...user, ...data });
  };

  delete = async (id: string): Promise<void> => {
    this.users.delete(id);
  };

  exists = async (id: string): Promise<boolean> => {
    return this.users.has(id);
  };
}
```

## 3. Service

`src/domain/services/user-service.ts`:

```typescript
import { NotFoundError } from "@sentzunhat/zacatl";
import { UserRepository } from "../../infrastructure/repositories/user-repository";
import { User, CreateUserDTO } from "../models/user";

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return this.userRepo.findMany();
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    return this.userRepo.create({
      ...dto,
      createdAt: new Date(),
    });
  }

  async updateUser(id: string, dto: Partial<CreateUserDTO>): Promise<void> {
    const exists = await this.userRepo.exists(id);
    if (!exists) throw new NotFoundError(`User ${id} not found`);
    await this.userRepo.update(id, dto);
  }

  async deleteUser(id: string): Promise<void> {
    const exists = await this.userRepo.exists(id);
    if (!exists) throw new NotFoundError(`User ${id} not found`);
    await this.userRepo.delete(id);
  }
}
```

## 4. HTTP Handler

`src/application/handlers/user-handler.ts`:

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { UserService } from "../../domain/services/user-service";
import { ValidationError } from "@sentzunhat/zacatl";

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export class UserHandler {
  constructor(private userService: UserService) {}

  listUsers = async (_req: FastifyRequest, reply: FastifyReply) => {
    const users = await this.userService.listUsers();
    return reply.send(users);
  };

  getUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const user = await this.userService.getUser(id);
    return reply.send(user);
  };

  createUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const result = CreateUserSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid user data");
    }
    const user = await this.userService.createUser(result.data);
    return reply.status(201).send(user);
  };

  updateUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const result = CreateUserSchema.partial().safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid update data");
    }
    await this.userService.updateUser(id, result.data);
    return reply.send({ success: true });
  };

  deleteUser = async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    await this.userService.deleteUser(id);
    return reply.send({ success: true });
  };
}
```

## 5. Main Entry

`src/index.ts`:

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";
import { UserRepository } from "./infrastructure/repositories/user-repository";
import { UserService } from "./domain/services/user-service";
import { UserHandler } from "./application/handlers/user-handler";

const fastify = Fastify({ logger: true });
const userRepo = new UserRepository();
const userService = new UserService(userRepo);
const userHandler = new UserHandler(userService);

// Register routes
fastify.get("/users", userHandler.listUsers);
fastify.get("/users/:id", userHandler.getUser);
fastify.post("/users", userHandler.createUser);
fastify.put("/users/:id", userHandler.updateUser);
fastify.delete("/users/:id", userHandler.deleteUser);

const service = new Service({
  architecture: {
    application: {
      entryPoints: { rest: { hookHandlers: [], routeHandlers: [UserHandler] } },
    },
    domain: { providers: [UserService] },
    infrastructure: { repositories: [UserRepository] },
    server: {
      name: "user-api",
      server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
    },
  },
});

await service.start({ port: 3000 });
```

## Test the API

```bash
# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'

# List users
curl http://localhost:3000/users

# Get user
curl http://localhost:3000/users/1

# Update user
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane"}'

# Delete user
curl -X DELETE http://localhost:3000/users/1
```

## Key Patterns

✅ **Layered Architecture** - Domain, Infrastructure, Application  
✅ **Dependency Injection** - Services injected into handlers  
✅ **Validation** - Zod schemas for input  
✅ **Error Handling** - Custom errors with proper status codes  
✅ **Type Safety** - Full TypeScript types throughout

**Next**: [Database Integration →](./04-database.md)
