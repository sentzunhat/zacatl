# ORM Import Guide - Choose Your Style

> **Version:** 0.0.23+  
> **Two import options:** Convenience vs. Minimal bundle size

---

## Quick Decision

**Starting a new project or prototyping?** → Use **Main Package** imports  
**Building for production or optimizing bundle size?** → Use **Subpath** imports

---

## Option 1: Main Package (Convenience)

Import everything from one place:

```typescript
import {
  Service,
  BaseRepository,
  mongoose,
  Schema,
  Sequelize,
  DataTypes,
} from "@sentzunhat/zacatl";
```

**When to use:**

- Quick projects and prototypes
- Learning zacatl
- Bundle size isn't critical (< 100kb difference)
- Prefer simplicity over optimization

---

## Option 2: Subpath Imports (Minimal)

Import ORMs separately:

```typescript
import { Service, BaseRepository } from "@sentzunhat/zacatl";
import { mongoose, Schema } from "@sentzunhat/zacatl/orm/mongoose";
// OR
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/orm/sequelize";
```

**When to use:**

- Production applications
- Only using ONE ORM (eliminates unused one from bundle)
- Optimizing bundle size
- Clear separation of concerns

---

## Complete Examples

### Mongoose Repository (Both Styles)

**Style 1 - Main Package:**

```typescript
import {
  Service,
  BaseRepository,
  ORMType,
  mongoose,
  Schema,
} from "@sentzunhat/zacatl";

const UserSchema = new Schema({
  name: String,
  email: String,
});

class UserRepository extends BaseRepository {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }
}
```

**Style 2 - Subpath (Minimal):**

```typescript
import { Service, BaseRepository, ORMType } from "@sentzunhat/zacatl";
import { mongoose, Schema } from "@sentzunhat/zacatl/orm/mongoose";

const UserSchema = new Schema({
  name: String,
  email: String,
});

class UserRepository extends BaseRepository {
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

### Sequelize Repository (Both Styles)

**Style 1 - Main Package:**

```typescript
import {
  Service,
  BaseRepository,
  ORMType,
  Sequelize,
  DataTypes,
} from "@sentzunhat/zacatl";

const sequelize = new Sequelize("sqlite::memory:");

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

class UserRepository extends BaseRepository {
  constructor() {
    super({
      type: ORMType.Sequelize,
      model: User,
    });
  }
}
```

**Style 2 - Subpath (Minimal):**

```typescript
import { Service, BaseRepository, ORMType } from "@sentzunhat/zacatl";
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/orm/sequelize";

const sequelize = new Sequelize("sqlite::memory:");

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

class UserRepository extends BaseRepository {
  constructor() {
    super({
      type: ORMType.Sequelize,
      model: User,
    });
  }
}
```

---

## Migration from v0.0.22

If you were importing ORMs from zacatl, **no changes needed** - both styles work:

```typescript
// v0.0.22 and v0.0.23+ - Still works ✅
import { Service, mongoose, Schema } from "@sentzunhat/zacatl";

// v0.0.23+ New option - Minimal bundle
import { Service } from "@sentzunhat/zacatl";
import { mongoose, Schema } from "@sentzunhat/zacatl/orm/mongoose";
```

---

## Available Subpath Exports

### Mongoose

```typescript
import {
  mongoose,
  Mongoose,
  Schema,
  Model,
  Document,
  connect,
  connection,
  MongooseModel, // Type only
} from "@sentzunhat/zacatl/orm/mongoose";
```

### Sequelize

```typescript
import {
  Sequelize,
  SequelizeModel,
  DataTypes,
  Op,
  ModelStatic, // Type only
  SequelizeOptions, // Type only
} from "@sentzunhat/zacatl/orm/sequelize";
```

---

## Bundle Size Impact

**Scenario:** Using only Mongoose in your app

| Import Style | Bundle Includes            | Approx. Size     |
| ------------ | -------------------------- | ---------------- |
| Main package | Mongoose + Sequelize types | ~100%            |
| Subpath      | Mongoose only              | ~92% (saves ~8%) |

**Note:** Actual savings depend on your bundler's tree-shaking capabilities. Modern bundlers (Vite, Rollup, esbuild) work best with subpath imports.

---

## Recommendation

**Start with main package imports** for simplicity. **Switch to subpath imports** when:

- You're ready to optimize
- Bundle size matters for your use case
- You're only using one ORM

Both options are fully supported and will remain stable across versions.

---

**Generated for:** Zacatl v0.0.23+  
**Last Updated:** January 31, 2026
