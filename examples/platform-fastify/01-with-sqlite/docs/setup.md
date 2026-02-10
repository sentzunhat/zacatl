# SQLite + Sequelize Setup

Zero-config database example with Sequelize ORM.

## Quick Start

```bash
cd examples/platform-fastify/01-with-sqlite
bun install
bun run dev
```

## Database Configuration

**ORM**: Sequelize
**Storage**: SQLite (file-based)
**Location**: `apps/backend/database.sqlite`

### Connection Setup

**Location**: `apps/backend/src/infrastructure/database/connection.ts`

```typescript
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false, // Set to console.log for debugging
});
```

**Auto-initialization**: Connection opens on app start, creates schema automatically.

---

## Repository Implementation

**Sequelize Model**: `infrastructure/greetings/models/greeting.model.ts`

```typescript
import { DataTypes, Model } from "sequelize";
import { sequelize } from "../connection";

export class GreetingModel extends Model {
  declare id: number;
  declare message: string;
  declare language: string;
  declare createdAt: Date;
}

GreetingModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, tableName: "greetings", timestamps: false },
);
```

**Repository Adapter**: `infrastructure/greetings/repositories/greeting/adapter.ts`

```typescript
@singleton()
export class GreetingRepositoryAdapter implements GreetingRepositoryPort {
  private toDomain(model: GreetingModel): Greeting {
    return {
      id: model.id.toString(),
      message: model.message,
      language: model.language,
      createdAt: model.createdAt,
    };
  }

  async create(input: CreateGreetingInput): Promise<Greeting> {
    const model = await GreetingModel.create({
      message: input.message,
      language: input.language,
    });
    return this.toDomain(model);
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const models = await GreetingModel.findAll({ where });
    return models.map((m) => this.toDomain(m));
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

✅ **Zero setup**: No database server required
✅ **Fast startup**: < 1s to running
✅ **Portable**: Single file, easy to reset
✅ **Perfect for**: Learning, prototyping, edge deployments

## Limitations

⚠️ **Single connection**: Not ideal for high concurrency
⚠️ **File-based**: Not horizontally scalable

---

## Production Patterns

See [../../docs/production-patterns.md](../../docs/production-patterns.md) for framework-agnostic patterns used in this example.

## Next Steps

- **Add features**: See "Adding New Features" in production-patterns.md
- **Switch to MongoDB**: Compare with [../../02-with-mongodb/](../../02-with-mongodb/)
- **Deploy**: Use Docker ([../../../docs/deployment/](../../../docs/deployment/))
