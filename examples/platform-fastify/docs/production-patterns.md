# Production Patterns - Fastify Examples

Framework-agnostic patterns demonstrated across all Fastify examples.

## Architecture Overview

All examples implement clean architecture with:

- **Application Layer**: Handlers, schemas, validation
- **Domain Layer**: Services, models, ports (interfaces)
- **Infrastructure Layer**: Repositories, database adapters
- **Platform Layer**: Fastify-specific configuration

---

## 1. Zod Validation

**Location**: `apps/backend/src/application/handlers/greetings/greeting.schema.ts`

```typescript
export const CreateGreetingBodySchema = z.object({
  message: z.string().min(1, "Message is required"),
  language: z.string().min(2, "Language code must be at least 2 characters"),
});

export type CreateGreetingBody = z.infer<typeof CreateGreetingBodySchema>;
```

**Benefits:**

- Runtime validation catches bad requests
- TypeScript types auto-generated from schemas
- Self-documenting API contracts
- Clear error messages for clients

---

## 2. Response Serialization

**Location**: `apps/backend/src/application/handlers/greetings/greeting.serializer.ts`

```typescript
export const toGreetingResponse = (greeting: Greeting): GreetingResponse => ({
  id: greeting.id,
  message: greeting.message,
  language: greeting.language,
  createdAt: greeting.createdAt.toISOString(),
});
```

**Benefits:**

- Domain uses `Date` objects, API uses ISO strings
- Single source of truth for response types (Zod)
- Clear serialization boundary in the application layer
- Consistent JSON format

---

## 3. Type-Safe Handlers

**Location**: `apps/backend/src/application/handlers/greetings/create/handler.ts`

```typescript
@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateGreetingBody,
  void,
  GreetingResponse
> {
  async handler(request, reply): Promise<GreetingResponse> {
    const { message, language } = request.body;
    const greeting = await this.greetingService.createGreeting({
      message,
      language,
    });
    return toGreetingResponse(greeting);
  }
}
```

**Benefits:**

- No `any` types - full type safety
- Autocomplete in editor
- Compile-time error detection
- Safe refactoring

---

## 4. Centralized Error Handling

**Location**: `apps/backend/src/index.ts`

```typescript
fastify.setErrorHandler(async (error, request, reply) => {
  const statusCode = error.statusCode || 500;
  console.error(`[${request.method}] ${request.url}:`, error.message);

  await reply.status(statusCode).send({
    error: {
      message: error.message || "Internal Server Error",
      statusCode,
    },
  });
});
```

**Benefits:**

- Consistent error format across endpoints
- Safe error messages (no stack traces to clients)
- Single place for logging/monitoring
- Validation errors automatically formatted

---

## 5. Repository Pattern

**Port** (interface): `domain/greetings/ports/greeting-repository.port.ts`

```typescript
export interface GreetingRepositoryPort {
  create(input: CreateGreetingInput): Promise<Greeting>;
  findById(id: string): Promise<Greeting | null>;
  findAll(filter?: { language?: string }): Promise<Greeting[]>;
  delete(id: string): Promise<boolean>;
}
```

**Adapter** (implementation): `infrastructure/greetings/repositories/greeting/adapter.ts`

```typescript
@singleton()
export class GreetingRepositoryAdapter
  extends BaseRepository<GreetingModel, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({ type: ORMType.Sequelize, model: GreetingModel });
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const models = await (this.model as any).findAll({ where });
    return models
      .map((model) => this.toLean(model))
      .filter((item): item is Greeting => item !== null);
  }
}
```

**Benefits:**

- Services depend on interface, not implementation
- Easy to swap databases
- Testable (mock the port)
- Clear separation of concerns

---

## 6. Dependency Injection

**Service → Repository:**

```typescript
@singleton()
export class GreetingService {
  constructor(
    @inject(GreetingRepositoryAdapter)
    private readonly greetingRepository: GreetingRepositoryAdapter,
  ) {}
}
```

**Handler → Service:**

```typescript
@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<...> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) { super({...}); }
}
```

**Auto-registration** in `config.ts`:

```typescript
{
  infrastructure: {
    repositories,
  },
  domain: {
    providers: [GreetingService],
  },
  application: {
    entryPoints: {
      rest: {
        routeHandlers: [
          CreateGreetingHandler,
          GetAllGreetingsHandler,
          GetGreetingByIdHandler,
          DeleteGreetingHandler,
        ],
      },
    },
  },
}
```

**Benefits:**

- No manual `container.register()` calls
- Framework discovers dependencies automatically
- Enforces dependency direction
- Easy to test (inject mocks)

---

## Handler Patterns

### GET - No Parameters

`AbstractRouteHandler<void, { language?: string }, GreetingListResponse>`

### GET - Path Parameters

`AbstractRouteHandler<void, void, GreetingResponse | null, GreetingIdParams>`

### POST - Request Body

`AbstractRouteHandler<CreateGreetingBody, void, GreetingResponse>`

### DELETE - Path Parameters

`AbstractRouteHandler<void, void, { success: boolean }, GreetingIdParams>`

---

## Production Checklist

✅ **Validation**: Request body + service layer validation
✅ **Type Safety**: No `any` types, Zod type inference
✅ **Error Handling**: Centralized handler, safe responses
✅ **Dependency Injection**: `@singleton()` + `@inject()`
✅ **Architecture**: Clear layers with dependency flow
✅ **Code Quality**: Single responsibility, clear naming

---

## Adding New Features

To add a new resource (e.g., "User"):

1. **Domain model**: `domain/models/user.ts`
2. **Port**: `domain/users/ports/user-repository.port.ts`
3. **Repository**: `infrastructure/users/repositories/user.repository.ts`
4. **Model**: `infrastructure/users/models/user.model.ts`
5. **Service**: `domain/services/user.service.ts`
6. **Schema**: `application/handlers/users/user.schema.ts`
7. **Handlers**: `application/handlers/users/{create,get-all,get-by-id}/handler.ts`
8. **Register**: `config.ts`

**Zero existing files modified!** Clean architecture enables this.

---

## See Also

- **SQLite Setup**: [../01-with-sqlite/README.md#database-setup](../01-with-sqlite/README.md#database-setup)
- **MongoDB Setup**: [../02-with-mongodb/README.md#database-setup](../02-with-mongodb/README.md#database-setup)
- **PostgreSQL Setup**: [../03-with-postgres/README.md#database-setup](../03-with-postgres/README.md#database-setup)
- **Quick Start**: [quick-start.md](quick-start.md)
- **Framework Docs**: [../../../docs/README.md](../../../docs/README.md)
