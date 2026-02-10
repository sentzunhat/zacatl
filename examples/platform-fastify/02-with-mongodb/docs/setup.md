# MongoDB + Mongoose Setup

Production-ready database example with Mongoose ODM.

## Quick Start

### Option 1: Docker (Recommended)

```bash
cd examples/platform-fastify/02-with-mongodb

# Start MongoDB in Docker
docker run -d -p 27017:27017 --name mongo mongo:latest

# Install and run
bun install
bun run dev
```

### Option 2: Local MongoDB

```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
```

---

## Database Configuration

**ODM**: Mongoose
**Connection**: `mongodb://localhost:27017/greetings-db`
**Schema**: Flexible, document-based

### Connection Setup

**Location**: `apps/backend/src/infrastructure/database/connection.ts`

```typescript
import mongoose from "mongoose";

export async function connectDatabase() {
  await mongoose.connect("mongodb://localhost:27017/greetings-db");
  console.log("MongoDB connected");
}
```

**Environment Variables** (optional):

```bash
MONGODB_URI=mongodb://localhost:27017/greetings-db
```

---

## Repository Implementation

**Mongoose Schema**: `infrastructure/greetings/models/greeting.model.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

interface GreetingDocument extends Document {
  message: string;
  language: string;
  createdAt: Date;
}

const greetingSchema = new Schema<GreetingDocument>({
  message: { type: String, required: true },
  language: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const GreetingModel = mongoose.model<GreetingDocument>(
  "Greeting",
  greetingSchema,
);
```

**Repository Adapter**: `infrastructure/greetings/repositories/greeting/adapter.ts`

```typescript
@singleton()
export class GreetingRepositoryAdapter implements GreetingRepositoryPort {
  private toDomain(doc: any): Greeting {
    return {
      id: doc._id.toString(),
      message: doc.message,
      language: doc.language,
      createdAt: doc.createdAt,
    };
  }

  async create(input: CreateGreetingInput): Promise<Greeting> {
    const doc = await GreetingModel.create({
      message: input.message,
      language: input.language,
    });
    return this.toDomain(doc);
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const query = filter?.language ? { language: filter.language } : {};
    const docs = await GreetingModel.find(query);
    return docs.map((doc) => this.toDomain(doc));
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
curl http://localhost:3001/greetings/507f1f77bcf86cd799439011

# Delete
curl -X DELETE http://localhost:3001/greetings/507f1f77bcf86cd799439011
```

---

## Advantages

✅ **Scalable**: Horizontal scaling via replica sets
✅ **Flexible**: Schema-less, easy evolution
✅ **Production-ready**: Used by major applications
✅ **Cloud-native**: MongoDB Atlas, AWS DocumentDB

## Considerations

⚠️ **Server required**: MongoDB instance needed
⚠️ **Startup time**: ~2-3s with Docker

---

## Docker Management

```bash
# Start MongoDB
docker start mongo

# Stop MongoDB
docker stop mongo

# View logs
docker logs mongo

# Remove container
docker rm -f mongo

# Connect with CLI
docker exec -it mongo mongosh
```

---

## Production Patterns

See [../../docs/production-patterns.md](../../docs/production-patterns.md) for framework-agnostic patterns used in this example.

## Next Steps

- **Add features**: See "Adding New Features" in production-patterns.md
- **Compare SQLite**: See [../../01-with-sqlite/](../../01-with-sqlite/)
- **Deploy**: Use Docker Compose ([../../../docs/deployment/](../../../docs/deployment/))
