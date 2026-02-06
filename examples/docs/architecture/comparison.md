# Technology Comparison Matrix

This document shows how the **same business logic** works across different technologies in the Zacatl framework.

## 🎯 The Core Principle

**Write your business logic once, swap technologies freely.**

All three examples use the **identical** `GreetingService` from `shared/domain/services/greeting.service.ts`. Only the adapters change.

## 📊 Technology Matrix

| Feature            | Example 01               | Example 02                | Example 03        |
| ------------------ | ------------------------ | ------------------------- | ----------------- |
| **Name**           | Basic Fastify + Mongoose | Basic Express + Sequelize | CLI Application   |
| **Platform**       | HTTP Server              | HTTP Server               | Command Line      |
| **Service Type**   | `ServiceType.SERVER`     | `ServiceType.SERVER`      | `ServiceType.CLI` |
| **HTTP Framework** | Fastify                  | Express                   | N/A               |
| **Database Type**  | NoSQL (Document)         | SQL (Relational)          | In-Memory         |
| **ORM/ODM**        | Mongoose                 | Sequelize                 | None              |
| **Storage**        | MongoDB                  | SQLite/PostgreSQL         | JavaScript Map    |
| **Request Type**   | `FastifyRequest`         | `express.Request`         | Command args      |
| **Response Type**  | `FastifyReply`           | `express.Response`        | Console output    |
| **Port**           | 3000                     | 3001                      | N/A               |
| **ID Format**      | MongoDB ObjectId         | Auto-increment int        | Sequential int    |

## 🔄 What Stays the Same

### 1. Domain Service (100% Identical)

```typescript
// shared/domain/services/greeting.service.ts
// Used in ALL examples without modification
class GreetingService implements ServicePort {
  constructor(private readonly greetingRepository: GreetingRepositoryPort) {}

  async createGreeting(input: CreateGreetingInput): Promise<Greeting> {
    // Business logic validation
    if (!input.message || input.message.trim().length === 0) {
      throw new Error("Greeting message cannot be empty");
    }
    return this.greetingRepository.create(input);
  }
  // ... other methods
}
```

### 2. Repository Interface (Port)

```typescript
// shared/domain/ports/greeting-repository.port.ts
// All repositories implement this exact interface
export interface GreetingRepositoryPort {
  findById(id: string): Promise<Greeting | null>;
  findAll(filter?: { language?: string }): Promise<Greeting[]>;
  create(input: CreateGreetingInput): Promise<Greeting>;
  delete(id: string): Promise<boolean>;
}
```

### 3. Domain Models

```typescript
// shared/domain/models/greeting.ts
// Same entity definition across all examples
export interface Greeting {
  id: string;
  message: string;
  language: string;
  createdAt: Date;
}
```

## 🔀 What Changes (Adapters)

### Application Layer: Different Entry Points

#### Example 01: Fastify Handler

```typescript
export async function createGreeting(
  request: FastifyRequest<{ Body: CreateGreetingInput }>,
  reply: FastifyReply,
  greetingService: GreetingService,
): Promise<void> {
  const greeting = await greetingService.createGreeting(request.body);
  reply.code(201).send({ success: true, data: greeting });
}
```

#### Example 02: Express Handler

```typescript
export async function createGreeting(
  req: Request,
  res: Response,
  greetingService: GreetingService,
): Promise<void> {
  const greeting = await greetingService.createGreeting(req.body);
  res.status(201).json({ success: true, data: greeting });
}
```

#### Example 03: CLI Command

```typescript
export async function createCommand(
  args: string[],
  greetingService: GreetingService,
): Promise<void> {
  const [message, language] = args;
  const greeting = await greetingService.createGreeting({ message, language });
  console.log(`✓ Greeting created: ID ${greeting.id}`);
}
```

### Infrastructure Layer: Different Repositories

#### Example 01: Mongoose Repository

```typescript
export class MongooseGreetingRepository implements GreetingRepositoryPort {
  async create(input: CreateGreetingInput): Promise<Greeting> {
    const doc = await GreetingModel.create(input);
    return this.toDomain(doc);
  }
}
```

#### Example 02: Sequelize Repository

```typescript
export class SequelizeGreetingRepository implements GreetingRepositoryPort {
  async create(input: CreateGreetingInput): Promise<Greeting> {
    const model = await GreetingModel.create(input);
    return this.toDomain(model);
  }
}
```

#### Example 03: In-Memory Repository

```typescript
export class InMemoryGreetingRepository implements GreetingRepositoryPort {
  private greetings: Map<string, Greeting> = new Map();

  async create(input: CreateGreetingInput): Promise<Greeting> {
    const greeting = { id: this.nextId++, ...input, createdAt: new Date() };
    this.greetings.set(greeting.id, greeting);
    return greeting;
  }
}
```

## 📈 Dependency Injection Flow

All examples follow the same DI pattern:

```
Service Configuration
  └─> Infrastructure Layer
       └─> Registers Repository in DI Container
  └─> Domain Layer
       └─> Injects Repository → Creates Service → Registers in DI Container
  └─> Application Layer
       └─> Injects Service → Creates Handlers → Registers Routes/Commands
```

**Configuration Example:**

```typescript
layers: {
  application: {
    entryPoints: { /* handlers/commands */ }
  },
  domain: {
    providers: [{
      service: GreetingService,
      dependencies: [SomeRepository] // ← Type changes, interface same
    }]
  },
  infrastructure: {
    repositories: [{
      repository: SomeRepository, // ← Implementation changes
      dependencies: []
    }]
  }
}
```

## 🧪 Testing the Equivalence

Run all three examples and verify they produce the same business behavior:

```bash
# Example 01: Fastify + MongoDB
cd 02-with-mongodb
npm start &
curl -X POST http://localhost:3000/greetings \
  -d '{"message":"Test","language":"en"}'

# Example 02: Express + SQLite
cd ../03-with-sqlite
npm start &
curl -X POST http://localhost:3001/greetings \
  -d '{"message":"Test","language":"en"}'

# Example 03: CLI
cd ../03-cli-application
npm start -- create "Test" en
```

All three:

- Validate the message isn't empty ✓
- Normalize language to lowercase ✓
- Store with timestamp ✓
- Return consistent greeting structure ✓

## 🎓 Key Learnings

1. **Port-Adapter Pattern**: Interfaces (ports) enable swapping implementations (adapters)
2. **Layer Separation**: Domain logic is isolated from infrastructure and presentation
3. **Technology Agnostic**: Business rules work regardless of HTTP framework or database
4. **Dependency Injection**: Framework manages wiring, you focus on logic
5. **Consistent Configuration**: Same config structure across all platforms

## 💡 Real-World Applications

This pattern enables:

- **Gradual Migration**: Move from MongoDB to PostgreSQL without rewriting business logic
- **Multi-Platform**: Same backend for web API, mobile app, and admin CLI
- **Testing**: Use in-memory repository for fast unit tests
- **Cloud Flexibility**: Swap databases based on deployment environment
- **Framework Updates**: Migrate from Fastify to Express (or vice versa) with minimal changes

## 🚀 Next Steps

- Run all three examples side by side
- Try mixing components (Express + MongoDB, Fastify + SQLite)
- Add new methods to `GreetingService` and see them work everywhere
- Create your own repository implementation (Redis, Firebase, etc.)
- Build a frontend that calls Example 01 or 02
