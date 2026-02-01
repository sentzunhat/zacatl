# Quick Start - 5 Minutes

Get a working example running in 5 minutes.

## Prerequisites

- Node.js 22+ (or Bun)
- npm, yarn, or pnpm

## 1. Install (1 min)

```bash
npm install @sentzunhat/zacatl express
```

## 2. Create index.ts (2 min)

```typescript
import express from "express";
import { container } from "tsyringe";
import { logger } from "@sentzunhat/zacatl";
import "reflect-metadata";

// Create Express app
const app = express();
app.use(express.json());

// Define a simple user repository
interface User {
  id: string;
  name: string;
}

const users: User[] = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
];

// Create routes
app.get("/users", (req, res) => {
  logger.info("Fetching all users");
  res.json(users);
});

app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  logger.info("Fetched user", { userId: user.id });
  res.json(user);
});

app.post("/users", (req, res) => {
  const newUser: User = {
    id: Date.now().toString(),
    name: req.body.name,
  };
  users.push(newUser);
  logger.info("Created user", { userId: newUser.id, name: newUser.name });
  res.status(201).json(newUser);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
```

## 3. Run (1 min)

```bash
# If using TypeScript
npx tsx index.ts

# Or compile first
npx tsc index.ts
node index.js
```

You should see:

```
{"level":"info","msg":"Server running at http://localhost:3000",...}
```

## 4. Test (1 min)

In another terminal:

```bash
# Get all users
curl http://localhost:3000/users

# Get one user
curl http://localhost:3000/users/1

# Create user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Charlie"}'
```

## ✅ Done!

You now have a working API using Zacatl.

---

## Next Steps

1. **Add validation** - Use Zod schemas
2. **Add database** - Use Sequelize or Mongoose adapter
3. **Use DI properly** - Move logic to services
4. **Read** [Architecture Fundamentals](../architecture/FUNDAMENTALS.md)

## Minimal Zacatl Example

Here's the same API using Zacatl patterns more properly:

```typescript
import "reflect-metadata";
import { injectable, container, inject } from "tsyringe";
import express, { Request, Response } from "express";
import { logger } from "@sentzunhat/zacatl";

// 1. Domain (Interface)
interface User {
  id: string;
  name: string;
}

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(name: string): Promise<User>;
}

// 2. Infrastructure (Implementation)
@injectable()
export class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
  ];

  async findAll(): Promise<User[]> {
    return this.users;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async create(name: string): Promise<User> {
    const user: User = { id: Date.now().toString(), name };
    this.users.push(user);
    return user;
  }
}

// 3. Application (Service)
@injectable()
export class UserService {
  constructor(@inject("IUserRepository") private repo: IUserRepository) {}

  async getAllUsers(): Promise<User[]> {
    logger.info("Fetching all users");
    return this.repo.findAll();
  }

  async getUser(id: string): Promise<User | null> {
    logger.info("Fetching user", { userId: id });
    return this.repo.findById(id);
  }

  async createUser(name: string): Promise<User> {
    logger.info("Creating user", { name });
    return this.repo.create(name);
  }
}

// 4. Platform (Routes)
const app = express();
app.use(express.json());

// Register dependencies
container.registerSingleton("IUserRepository", InMemoryUserRepository);

const userService = container.resolve(UserService);

app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/users", async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body.name);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start
const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Server running at http://localhost:${PORT}`);
});
```

This is the Zacatl way: clean layers, dependency injection, structured logging.

---

**[Read more →](../FRAMEWORK_OVERVIEW.md)**
