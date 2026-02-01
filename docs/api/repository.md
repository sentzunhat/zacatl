# Repository Pattern API

Generic repository interface for data access.

## Interface

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

## Sequelize Implementation

```typescript
import { IRepository } from "@sentzunhat/zacatl";
import { Model } from "sequelize";

class UserRepository implements IRepository<User> {
  constructor(private model: typeof Model) {}

  async findById(id: string): Promise<User | null> {
    return await this.model.findByPk(id);
  }

  async findMany(filter?: any): Promise<User[]> {
    return await this.model.findAll({ where: filter });
  }

  async create(data: Partial<User>): Promise<User> {
    return await this.model.create(data);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.model.update(data, { where: { id } });
  }

  async delete(id: string): Promise<void> {
    await this.model.destroy({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  }
}
```

## Mongoose Implementation

```typescript
import { IRepository } from "@sentzunhat/zacatl";
import { Model } from "mongoose";

class UserRepository implements IRepository<User> {
  constructor(private model: Model<User>) {}

  async findById(id: string): Promise<User | null> {
    return await this.model.findById(id);
  }

  async findMany(filter?: any): Promise<User[]> {
    return await this.model.find(filter);
  }

  async create(data: Partial<User>): Promise<User> {
    return await this.model.create(data);
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.model.findByIdAndUpdate(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id);
  }

  async exists(id: string): Promise<boolean> {
    return await this.model.exists({ _id: id });
  }
}
```

## Usage

```typescript
class UserService {
  constructor(private userRepo: IRepository<User>) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async createUser(data: Partial<User>): Promise<User> {
    return await this.userRepo.create(data);
  }
}
```

---

**Complete API Reference**: [← Back to API](./README.md)
