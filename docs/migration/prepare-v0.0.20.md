# Prepare Your Project for @sentzunhat/zacatl v0.0.20

**Status:** v0.0.20 is not yet published. Use these prompts to prepare your codebase NOW so when v0.0.20 is released, you only need to update package.json.

---

## 🎯 Strategy: Prepare Now, Upgrade Later

### Phase 1: Preparation (NOW - Before Release)

Refactor your code to match v0.0.20 patterns using local types/patterns

### Phase 2: Upgrade (When v0.0.20 is Published)

Simply update package.json and swap local types for framework types

---

## 🤖 AI PROMPT: Prepare for v0.0.20 (Use This Now)

Copy this prompt to your AI assistant:

````
I'm using @sentzunhat/zacatl and want to prepare my codebase for the upcoming v0.0.20 release.
v0.0.20 is NOT published yet, so I need to refactor my code using local patterns that will be
compatible when v0.0.20 releases.

Context about v0.0.20 changes:
1. Removes MongooseRepository and SequelizeRepository classes
2. Adds BaseRepository that works with all ORMs
3. Uses ORMType enum instead of string literals
4. Full type safety (no 'any' casts)
5. Single-package imports (mongoose, sequelize, zod exported from @sentzunhat/zacatl)

MY CURRENT PROJECT STRUCTURE:
[Paste your repository file structure here]

EXAMPLE CURRENT REPOSITORY:
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

WHAT I NEED:

1. Create a local ORMType enum in my project
2. Create a local BaseRepository that extends current MongooseRepository/SequelizeRepository
3. Refactor all my repositories to use BaseRepository + ORMType enum
4. Ensure everything still works with current @sentzunhat/zacatl version

WHEN v0.0.20 RELEASES, I should only need to:

- Update package.json version
- Remove local ORMType enum and BaseRepository
- Import them from @sentzunhat/zacatl instead

Please help me:

1. Create the local ORMType enum
2. Create a BaseRepository wrapper
3. Show me how to refactor each repository
4. Provide a migration checklist

````

---

## 📝 Step-by-Step Manual Preparation

### Step 1: Create Local ORMType Enum

Create `src/types/orm-types.ts` (or similar):

```typescript
/**
 * Local ORMType enum for v0.0.20 compatibility
 * TODO: Remove when v0.0.20 is released - import from @sentzunhat/zacatl instead
 */
export enum ORMType {
  Mongoose = "mongoose",
  Sequelize = "sequelize",
}
````

### Step 2: Create Local BaseRepository Wrapper

Create `src/repositories/base-repository.ts`:

```typescript
import { MongooseRepository, SequelizeRepository } from "@sentzunhat/zacatl";
import { Model as MongooseModel, Schema } from "mongoose";
import { Model as SequelizeModel, ModelStatic } from "sequelize";
import { ORMType } from "@/types/orm-types";

/**
 * BaseRepository wrapper for v0.0.20 compatibility
 * This allows us to use the new pattern with the current version
 * TODO: Remove when v0.0.20 is released - import from @sentzunhat/zacatl instead
 */

type MongooseConfig<D> = {
  type: ORMType.Mongoose;
  name?: string;
  schema: Schema<D>;
};

type SequelizeConfig<D extends SequelizeModel> = {
  type: ORMType.Sequelize;
  model: ModelStatic<D>;
};

type BaseRepositoryConfig<D> =
  | MongooseConfig<D>
  | SequelizeConfig<D extends SequelizeModel ? D : never>;

export class BaseRepository<D, I, O> {
  private impl:
    | MongooseRepository<D, I, O>
    | SequelizeRepository<SequelizeModel, I, O>;

  constructor(config: BaseRepositoryConfig<D>) {
    if (config.type === ORMType.Mongoose) {
      // @ts-ignore - Temporary compatibility layer
      this.impl = new MongooseRepository<D, I, O>(config);
    } else {
      // @ts-ignore - Temporary compatibility layer
      this.impl = new SequelizeRepository<SequelizeModel, I, O>(config);
    }
  }

  // Delegate all methods to underlying implementation
  async findById(id: string): Promise<O | null> {
    return this.impl.findById(id);
  }

  async create(entity: I): Promise<O> {
    return this.impl.create(entity);
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.impl.update(id, update);
  }

  async delete(id: string): Promise<O | null> {
    return this.impl.delete(id);
  }

  toLean(input: unknown): O | null {
    return this.impl.toLean(input);
  }

  get model() {
    return this.impl.model;
  }

  // Add other methods as needed...
}
```

### Step 3: Refactor Your Repositories

**Before:**

```typescript
import { MongooseRepository } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";

export class UserRepository extends MongooseRepository<
  UserDb,
  UserInput,
  UserOutput
> {
  constructor() {
    super({
      type: "mongoose",
      name: "User",
      schema: UserSchema,
    });
  }
}
```

**After (v0.0.20 Ready):**

```typescript
import { BaseRepository } from "@/repositories/base-repository"; // Local wrapper
import { ORMType } from "@/types/orm-types"; // Local enum
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

### Step 4: Test Everything Works

```bash
npm run build
npm test
```

Your code should work exactly the same, but now uses the v0.0.20 pattern!

---

## 🚀 When v0.0.20 is Released

### Quick Upgrade Steps:

1. **Update package.json:**

   ```bash
   npm install @sentzunhat/zacatl@0.0.20
   ```

2. **Update imports** (find & replace):

   ```typescript
   // Find:
   import { BaseRepository } from "@/repositories/base-repository";
   import { ORMType } from "@/types/orm-types";

   // Replace with:
   import { BaseRepository, ORMType } from "@sentzunhat/zacatl";
   ```

3. **Delete local files:**

   ```bash
   rm src/repositories/base-repository.ts
   rm src/types/orm-types.ts
   ```

4. **Optional - Use single-package imports:**

   ```typescript
   // Instead of:
   import { Schema } from "mongoose";
   import { DataTypes } from "sequelize";

   // You can now:
   import { Schema, DataTypes } from "@sentzunhat/zacatl";
   ```

5. **Build and test:**
   ```bash
   npm run build
   npm test
   ```

Done! Your project is now on v0.0.20 with minimal changes.

---

## 🎨 Alternative Approach: Simpler Wrapper

If the full BaseRepository is too complex, use this simpler approach:

### Create `src/types/repository-types.ts`:

```typescript
import type {
  MongooseRepository,
  SequelizeRepository,
} from "@sentzunhat/zacatl";

/**
 * Temporary type aliases for v0.0.20 compatibility
 * TODO: Remove when v0.0.20 releases
 */

export enum ORMType {
  Mongoose = "mongoose",
  Sequelize = "sequelize",
}

// Use type aliases to existing classes
export type BaseRepository<D, I, O> =
  | MongooseRepository<D, I, O>
  | SequelizeRepository<any, I, O>;

// Just update your constructors to use ORMType
export const createMongooseConfig = <D>(config: {
  name?: string;
  schema: any;
}) => ({
  type: ORMType.Mongoose,
  ...config,
});

export const createSequelizeConfig = <D>(config: { model: any }) => ({
  type: ORMType.Sequelize,
  ...config,
});
```

### Use in repositories:

```typescript
import { MongooseRepository } from "@sentzunhat/zacatl";
import { ORMType, createMongooseConfig } from "@/types/repository-types";
import { Schema } from "mongoose";

// Still extends MongooseRepository (works with current version)
// But uses ORMType pattern (ready for v0.0.20)
export class UserRepository extends MongooseRepository<
  UserDb,
  UserInput,
  UserOutput
> {
  constructor() {
    super(
      createMongooseConfig({
        name: "User",
        schema: UserSchema,
      }),
    );
  }
}
```

When v0.0.20 releases:

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

---

## 📊 Preparation Checklist

- [ ] Decide on approach (full BaseRepository wrapper or type aliases)
- [ ] Create local ORMType enum
- [ ] Create BaseRepository wrapper or helper functions
- [ ] Identify all repository files in your project
- [ ] Refactor repositories one by one
- [ ] Update imports to use local ORMType
- [ ] Run build - ensure no TypeScript errors
- [ ] Run tests - ensure everything still works
- [ ] Document what needs to change when v0.0.20 releases
- [ ] Create a TODO or issue to track v0.0.20 upgrade

---

## 💡 Benefits of Preparing Now

✅ **Smaller migration** - When v0.0.20 releases, just update package.json  
✅ **Test incrementally** - Refactor and test each repository now  
✅ **Learn the pattern** - Get familiar with v0.0.20 architecture  
✅ **No rush** - Take your time to refactor properly  
✅ **Stay compatible** - Everything still works with current version

---

## 🆘 Need Help?

If you get stuck during preparation:

1. **Check your current version:**

   ```bash
   npm list @sentzunhat/zacatl
   ```

2. **Verify your repositories work:**

   ```bash
   npm run build && npm test
   ```

3. **Use the AI prompts above** - they're designed to help you refactor safely

4. **Keep notes** - Document what you changed for the final upgrade

---

## Summary

**Prepare NOW:**

- Create local ORMType enum
- Create BaseRepository wrapper
- Refactor repositories to use new pattern
- Test everything works

**When v0.0.20 releases:**

- Update package.json
- Swap local types for framework types
- Delete local files
- Done! ✅

This approach lets you prepare at your own pace and makes the actual upgrade trivial.
