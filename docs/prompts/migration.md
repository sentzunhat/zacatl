# AI Prompts for @sentzunhat/zacatl v0.0.20

Choose the appropriate prompt based on whether v0.0.20 is published yet:

- **📝 [PREPARE_FOR_V0.0.20.md](./PREPARE_FOR_V0.0.20.md)** - For preparing your project BEFORE v0.0.20 is published
- **⬇️ Below** - For migrating AFTER v0.0.20 is published

---

## 🤖 MIGRATION PROMPT (After v0.0.20 Release)

Use this when v0.0.20 is already published on npm:

````
I need to migrate my project to use @sentzunhat/zacatl version 0.0.20. This version has important breaking changes in the infrastructure/repository layer.

Key changes in v0.0.20:
1. MongooseRepository and SequelizeRepository classes were removed
2. All repositories now extend BaseRepository
3. Repository type configuration now uses ORMType enum instead of string literals
4. No more 'any' type casts - everything is type-safe
5. Configuration properties are now readonly

Please help me:

1. Update package.json to use @sentzunhat/zacatl@0.0.20

2. Find all repository files and update them:
   - Replace: extends MongooseRepository → extends BaseRepository
   - Replace: extends SequelizeRepository → extends BaseRepository
   - Replace: type: "mongoose" → type: ORMType.Mongoose
   - Replace: type: "sequelize" → type: ORMType.Sequelize
   - Update imports to include ORMType enum

3. Update all repository imports:
   FROM: import { MongooseRepository } from "@sentzunhat/zacatl"
   TO:   import { BaseRepository, ORMType } from "@sentzunhat/zacatl"

   FROM: import { SequelizeRepository } from "@sentzunhat/zacatl"
   TO:   import { BaseRepository, ORMType } from "@sentzunhat/zacatl"

4. Verify the Service configuration still works (no changes needed there)

5. Run build and fix any TypeScript errors

Example transformation:

BEFORE:
```typescript
import { MongooseRepository } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";

export class UserRepository extends MongooseRepository<UserDb, UserInput, UserOutput> {
  constructor() {
    super({
      type: "mongoose",
      name: "User",
      schema: UserSchema,
    });
  }
}
````

AFTER:

```typescript
import { BaseRepository, ORMType } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";

export class UserRepository extends BaseRepository<
  UserDb,
  UserInput,
  UserOutput
> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }
}
```

Please scan my project and suggest all necessary changes.

```

---

## 📋 ALTERNATIVE SHORT PROMPT

For a quicker migration, use this shorter version:

```

Migrate this project to @sentzunhat/zacatl v0.0.20:

1. Update package.json: "@sentzunhat/zacatl": "0.0.20"
2. In all repository files:
   - extends MongooseRepository → extends BaseRepository
   - extends SequelizeRepository → extends BaseRepository
   - type: "mongoose" → type: ORMType.Mongoose
   - type: "sequelize" → type: ORMType.Sequelize
   - import { MongooseRepository } → import { BaseRepository, ORMType }
   - import { SequelizeRepository } → import { BaseRepository, ORMType }
3. Build and fix TypeScript errors

```

---

## 🎯 FOCUSED PROMPTS FOR SPECIFIC TASKS

### For Repository Updates Only
```

Update all repository classes in this project to use v0.0.20 of @sentzunhat/zacatl:

- Replace MongooseRepository/SequelizeRepository with BaseRepository
- Use ORMType enum instead of string literals for type configuration
- Update all imports to include ORMType

Show me the changes for each repository file.

```

### For Import Updates Only
```

Find all imports from @sentzunhat/zacatl in this project and update them for v0.0.20:

- MongooseRepository → BaseRepository
- SequelizeRepository → BaseRepository
- Add ORMType to imports where BaseRepository is used

Generate a find-and-replace list.

```

### For Type Safety Check
```

After migrating to @sentzunhat/zacatl v0.0.20, check my repository files for:

1. Any remaining 'any' type casts that should be removed
2. String literals used instead of ORMType enum
3. Incorrect repository configurations
4. Missing readonly modifiers on config objects

Show me any issues found.

```

---

## 🔍 VERIFICATION PROMPT

After migration, use this to verify everything is correct:

```

Verify my project's migration to @sentzunhat/zacatl v0.0.20 is complete:

1. Check package.json has correct version
2. Confirm no MongooseRepository or SequelizeRepository imports exist
3. Verify all repositories extend BaseRepository
4. Verify all repository configs use ORMType enum (not strings)
5. Check for any remaining 'any' type casts in repository files
6. Confirm Service configuration is unchanged
7. List any potential issues or warnings

Provide a migration checklist with ✅/❌ for each item.

```

---

## 📁 PROJECT STRUCTURE EXAMPLES

### Small Project (Single Database)
```

If my project has this structure:
src/
repositories/
user.repository.ts
post.repository.ts
service.ts

And uses only MongoDB, update all files to use BaseRepository with ORMType.Mongoose

```

### Medium Project (Multiple Repositories)
```

If my project has:
src/
modules/
users/
repositories/
user.repository.ts
products/
repositories/
product.repository.ts
orders/
repositories/
order.repository.ts

Update all repository files to use v0.0.20 BaseRepository pattern

```

### Large Project (Multi-Database)
```

If my project uses:

- MongoDB for users/sessions (MongooseRepository)
- PostgreSQL for products/orders (SequelizeRepository)

Update all to use BaseRepository with appropriate ORMType enum values

```

---

## 🛠️ AUTOMATED SCRIPT REQUEST

```

Create a migration script (migrate.sh or migrate.js) that:

1. Backs up my current repository files
2. Updates all MongooseRepository → BaseRepository
3. Updates all SequelizeRepository → BaseRepository
4. Replaces type: "mongoose" → type: ORMType.Mongoose
5. Replaces type: "sequelize" → type: ORMType.Sequelize
6. Updates imports to include ORMType
7. Runs build to check for errors
8. Generates a migration report

Make it safe with rollback capability.

```

---

## 💡 TIPS FOR USING THESE PROMPTS

1. **Start with the main migration prompt** - gives AI full context
2. **Use focused prompts** for specific issues or step-by-step migration
3. **Use verification prompt** after migration to catch issues
4. **Customize** with your actual project structure
5. **Review all changes** before committing

## 🚦 MIGRATION WORKFLOW

1. **Backup your project** (git commit or branch)
2. **Run main migration prompt** with AI
3. **Review suggested changes**
4. **Apply changes** (let AI do it or do it yourself)
5. **Run verification prompt**
6. **Build and test**: `npm run build && npm test`
7. **Fix any remaining issues** with focused prompts
8. **Commit**: `git commit -m "Migrate to @sentzunhat/zacatl v0.0.20"`

---

## 📚 REFERENCE LINKS

Include these in your prompt for AI to reference:
- Migration Guide: docs/MIGRATION_TO_V0.0.20.md
- Infrastructure Usage: docs/examples/INFRASTRUCTURE_USAGE.md
- Multi-ORM Setup: docs/examples/MULTI_ORM_SETUP.md
- Type Safety: docs/examples/TYPE_SAFETY_IMPROVEMENTS.md

---

## ✅ SUCCESS CRITERIA

Your migration is complete when:
- ✅ No MongooseRepository or SequelizeRepository imports
- ✅ All repositories extend BaseRepository
- ✅ All configs use ORMType enum
- ✅ No string literals for repository types
- ✅ Build passes without errors
- ✅ Tests pass
- ✅ No 'any' type casts in repository layer
```
