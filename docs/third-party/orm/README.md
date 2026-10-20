# ORM & Database Reference

## Related Documentation

- [overview.md](overview.md) - Supported databases and adapters
- [orm-import-strategies.md](orm-import-strategies.md) - How to import ORM packages
- [architecture.md](architecture.md) - How adapters work internally
- [orm-lazy-loading.md](orm-lazy-loading.md) - Load related data on-demand
- [mongoose-index-lifecycle.md](mongoose-index-lifecycle.md) - Safe MongoDB index diff/create/sync controls
- [multi-orm-setup.md](multi-orm-setup.md) - Use multiple databases in one service
- [working-with-databases.md](working-with-databases.md) - Step-by-step tutorial

## Common Pattern

Import the wrapper for the repository's ORM. `/service` exports the Service
orchestrator; repository wrappers and ORM types are available through explicit
subpaths.

```typescript
import { BaseRepository as MongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';

class UserRepository extends MongooseRepository<UserDb, CreateUser, UserDTO> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: 'User',
      schema: userSchema,
    });
  }
}
```

Use `sequelize/repository` or `nodesqlite/repository` for those databases. The
wrappers share CRUD methods but each repository uses one ORM. For an
application-owned persistence contract, use `RepositoryPort` from
`service/layers/infrastructure/repositories/types`.

## Related Documentation

- [API: Repository](../../service/repository.md) - Repository API reference
- [Database Guide](./working-with-databases.md) - Step-by-step tutorial
