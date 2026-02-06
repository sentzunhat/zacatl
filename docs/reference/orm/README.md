# ORM & Database Reference

Complete guide to using databases with Zacatl.

## Getting Started

- [ORM Overview](overview.md) - Supported databases and adapters
- [Import Strategies](orm-import-strategies.md) - How to import ORM packages

## Advanced Topics

- [ORM Architecture](architecture.md) - How adapters work internally
- [Lazy Loading](orm-lazy-loading.md) - Load related data on-demand
- [Multi-ORM Setup](multi-orm-setup.md) - Use multiple databases in one service

## Supported Databases

- **Mongoose** - MongoDB ODM
- **Sequelize** - SQL databases (PostgreSQL, MySQL, SQLite, etc.)

## Common Patterns

```typescript
// Basic repository usage
class UserRepository extends BaseRepository<User, CreateUser, UserDTO> {
  constructor() {
    super({
      type: "mongoose",
      name: "User",
      schema: userSchema,
    });
  }
}

// Use in routes
@injectable()
class GetUsersHandler extends GetRouteHandler {
  constructor(private userRepo: UserRepository) {
    super({ url: "/users" });
  }

  async handle() {
    return this.userRepo.find({});
  }
}
```

## Related Documentation

- [API: Repository](../api/repository.md) - Repository API reference
- [Tutorials: Databases](../../tutorials/working-with-databases.md) - Step-by-step tutorial
