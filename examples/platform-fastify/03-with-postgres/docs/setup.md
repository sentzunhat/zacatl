# PostgreSQL + Sequelize Setup

Production-friendly database example with Sequelize ORM.

## Quick Start

```bash
cd examples/platform-fastify/03-with-postgres
bun install
bun run dev
```

## Database Configuration

**ORM**: Sequelize
**Storage**: PostgreSQL
**Connection**: `DATABASE_URL`

Set `DATABASE_URL` before starting the backend. Example:

```bash
export DATABASE_URL="postgres://local:local@localhost:5432/appdb"
```

If you already run a shared dev environment repo with PostgreSQL, just point to its connection string.

### Connection Setup

**Location**: `apps/backend/src/index.ts`

```typescript
const sequelize = new Sequelize(config.databaseUrl, {
  dialect: "postgres",
  logging: false, // Set to console.log for debugging
});
```

**Auto-initialization**: Connection opens on app start, creates schema automatically.

---

## Repository Implementation

**Sequelize Model**: `apps/backend/src/infrastructure/greetings/models/greeting.model.ts`

```typescript
export class GreetingModel extends Model implements Omit<Greeting, "id"> {
  declare id: string;
  declare message: string;
  declare language: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}
```

**Repository Adapter**: `apps/backend/src/infrastructure/greetings/repositories/greeting/adapter.ts`

```typescript
@singleton()
export class GreetingRepositoryAdapter
  extends BaseRepository<GreetingModel, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({
      type: ORMType.Sequelize,
      model: GreetingModel,
    });
  }
}
```

---

## Testing Endpoints

```bash
# Create greeting
curl -X POST http://localhost:3001/greetings \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello World", "language": "en"}'

# Get all greetings
curl http://localhost:3001/greetings

# Get by language
curl http://localhost:3001/greetings?language=en

# Get random by language
curl http://localhost:3001/greetings/random/en

# Get by ID
curl http://localhost:3001/greetings/1

# Delete
curl -X DELETE http://localhost:3001/greetings/1
```

---

## Advantages

✅ **Production-grade**: Real relational database
✅ **Config-only**: Set `DATABASE_URL` and run
✅ **Schema auto-sync**: Tables created on start

## Limitations

⚠️ **Requires Postgres**: You need a running database instance

---

## Production Patterns

See [../../docs/production-patterns.md](../../docs/production-patterns.md) for framework-agnostic patterns used in this example.

## Next Steps

- **Add features**: See "Adding New Features" in production-patterns.md
- **Switch to MongoDB**: Compare with [../../02-with-mongodb/](../../02-with-mongodb/)
- **Deploy**: Use Docker ([../../../docs/deployment/](../../../docs/deployment/))
