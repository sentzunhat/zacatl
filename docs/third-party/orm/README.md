# ORM & Database Reference

## Related Documentation

- [overview.md](overview.md) - Supported databases and adapters
- [orm-import-strategies.md](orm-import-strategies.md) - How to import ORM packages
- [architecture.md](architecture.md) - How adapters work internally
- [orm-lazy-loading.md](orm-lazy-loading.md) - Load related data on-demand
- [multi-orm-setup.md](multi-orm-setup.md) - Use multiple databases in one service
- [working-with-databases.md](working-with-databases.md) - Step-by-step tutorial

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

- [API: Repository](../../service/repository.md) - Repository API reference
- [Database Guide](./working-with-databases.md) - Step-by-step tutorial
