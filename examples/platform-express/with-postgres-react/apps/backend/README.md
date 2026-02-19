# Zacatl Fastify + PostgreSQL Backend Example

Enterprise-grade Node.js ESM backend using the Zacatl framework with Sequelize ORM.

## Quick Start

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build

# Run production build
npm start
```

## Build Process

The build is simple and transparent:

1. **TypeScript compilation**: `tsc` compiles your code to ESNext modules
2. **ESM fix**: Framework's built-in `zacatl-fix-esm` adds `.js` extensions for Node.js ESM compatibility

That's it! No bundlers, no complex tooling. The ESM fix script is included in the framework package - no manual setup required.

## What's Happening Behind the Scenes

Node.js ESM requires explicit file extensions in imports:

- ❌ `import { thing } from "./file"`
- ✅ `import { thing } from "./file.js"`

The framework's `zacatl-fix-esm` utility automatically adds these extensions after TypeScript compilation, so you can write clean TypeScript without manual `.js` extensions everywhere.

## Project Structure

```
src/
├── application/         # HTTP handlers (entry points)
│   └── handlers/
│       └── greetings/   # Feature: Greetings CRUD
├── domain/              # Business logic & models
│   ├── greetings/
│   │   ├── model.ts     # Domain-specific model
│   │   ├── service.ts   # Service adapter (implementation)
│   │   └── service.port.ts # Service interface
│   └── dtos/            # Data transfer objects
├── infrastructure/      # Database models & repos
│   ├── models/
│   │   └── greeting.model.ts # Sequelize model
│   ├── repositories/
│   │   ├── greeting/
│   │   │   ├── adapter.ts    # Repository implementation
│   │   │   └── port.ts       # Repository interface
│   │   └── repositories.ts   # DI exports
├── config.ts            # Configuration
└── index.ts             # App entry point
```

## Architectural Layers

### Application Layer

Entry points for HTTP requests. Handlers receive requests, validate input, call domain services, and return responses.

- Location: `application/handlers/greetings/`
- Responsibilities: Request validation, service orchestration, response serialization
- Dependencies: Domain layer

### Domain Layer

Pure business logic independent of frameworks and databases.

- Location: `domain/greetings/`
- Responsibilities: Business rules, domain models, service contracts
- Dependencies: None (except interfaces)

### Infrastructure Layer

Database access, external API calls, and technology implementations.

- Location: `infrastructure/`
- Responsibilities: Database models, repository implementations, external integrations
- Dependencies: Domain layer (interfaces)

## Key Patterns

### Handler Example

```typescript
@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateGreetingBody,
  void,
  GreetingResponse
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: "/greetings",
      method: "POST",
      schema: { body: CreateGreetingBodySchema },
    });
  }

  async handler(
    request: Request<CreateGreetingBody>,
    reply: FastifyReply,
  ): Promise<GreetingResponse> {
    const greeting = await this.greetingService.createGreeting(request.body);
    return toGreetingResponse(greeting);
  }
}
```

### Service Pattern

Services implement domain logic without knowing about databases:

```typescript
@singleton()
export class GreetingServiceAdapter implements GreetingServicePort {
  constructor(
    @inject(GreetingRepositoryAdapter)
    private readonly greetingRepository: GreetingRepositoryAdapter,
  ) {}

  async createGreeting(input: CreateGreetingInput): Promise<Greeting> {
    // Business logic here
    return this.greetingRepository.create(normalizedInput);
  }
}
```

### Repository Pattern

Repositories handle data persistence:

```typescript
@singleton()
export class GreetingRepositoryAdapter
  extends SequelizeRepository<GreetingModel, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({ model: GreetingModel });
  }
}
```

## Adding a New Feature

To add a new entity (e.g., Users):

1. Create domain layer:

   ```
   domain/users/
   ├── user.model.ts
   ├── user.service.ts
   └── user.service.port.ts
   ```

2. Create infrastructure layer:

   ```
   infrastructure/users/
   ├── user.database.model.ts
   ├── user.repository.ts
   └── user.repository.port.ts
   ```

3. Create application layer:

   ```
   application/handlers/users/
   ├── create-user/handler.ts
   ├── delete-user/handler.ts
   ├── get-all-users/handler.ts
   ├── get-user-by-id/handler.ts
   ├── user.schema.ts
   └── user.serializer.ts
   ```

4. Update `index.ts` to import and use the new handler

## Developer Experience

- ✅ Write clean TypeScript (no `.js` in imports)
- ✅ One command to build: `npm run build`
- ✅ Fast development with `tsx watch`
- ✅ Production-ready output in `dist/`
- ✅ Works in Docker (distroless images)
- ✅ Type-safe dependency injection
- ✅ Hexagonal architecture ready

## Environment Variables

Create a `.env` file:

```env
PORT=8083
DATABASE_URL=postgresql://user:password@localhost:5432/zacatl
NODE_ENV=development
```

## Running with Docker

```bash
# Build
docker build -f Dockerfile -t zacatl-postgres .

# Run with PostgreSQL
docker run -p 8083:8083 \
  -e DATABASE_URL=postgresql://user:password@postgres:5432/zacatl \
  -e POSTGRES_HOST=postgres \
  zacatl-postgres
```

## Testing & Maintenance

- Use `npm run dev` for active development
- Tests can be added in `test/` directory
- Keep handlers thin - move logic to services
- Use repository pattern for data access
- Follow DDD principles within domain layer

## Troubleshooting

**"Cannot find module"**: Run `npm run build` - the ESM fix might need to re-run

**Type errors**: Ensure all imports use interfaces from `.port.ts` files in the domain layer

**Database connection issues**: Verify DATABASE_URL environment variable and Sequelize configuration in `config.ts`
