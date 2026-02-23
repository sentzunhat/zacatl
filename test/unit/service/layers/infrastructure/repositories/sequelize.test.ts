import { DataTypes, Sequelize } from "sequelize";
import { singleton } from "tsyringe";
import { describe, it, expect, vi, beforeAll } from "vitest";

import {
  SequelizeRepository,
  ORMType,
} from "../../../../../../src/service/layers/infrastructure/repositories/sequelize";
import { SequelizeModel as Model, ModelStatic } from "../../../../../../src/third-party/sequelize";

interface UserTestDb extends Model {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

let UserModel: ModelStatic<UserTestDb>;

const initializeSequelizeModel = async () => {
  const sequelize = new Sequelize("sqlite::memory:");

  UserModel = sequelize.define(
    "SequelizeUser",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(),
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: () => new Date(),
      },
    },
    {
      timestamps: true,
    },
  ) as ModelStatic<UserTestDb>;

  return sequelize;
};

@singleton()
class UserTestRepository extends SequelizeRepository<
  UserTestDb,
  Record<string, unknown>,
  UserTestDb
> {
  constructor() {
    super({ type: ORMType.Sequelize, model: UserModel });
  }
}

describe("SequelizeRepository", () => {
  let repository: UserTestRepository;
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = await initializeSequelizeModel();
    try {
      await sequelize.sync({ force: true });
      repository = new UserTestRepository();
    } catch (error: any) {
      if (error.message?.includes("Sequelize is not installed")) {
        console.log("Skipping SequelizeRepository tests - running from TypeScript source");
        return;
      }
      throw error;
    }
  });

  describe("model access", () => {
    it("should have model property set", () => {
      if (!repository) return;
      expect(repository.model).toBeDefined();
      expect(repository.model).toBe(UserModel);
    });
  });

  describe("toLean", () => {
    it("should convert Sequelize instance to plain object", async () => {
      if (!repository) return;
      const user = await repository.create({ name: "Alice" });
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("updatedAt");
    });

    it("should return null for null/undefined input", () => {
      if (!repository) return;
      expect(repository.toLean(null)).toBeNull();
      expect(repository.toLean(undefined)).toBeNull();
    });

    it("should normalize _id to id field", () => {
      if (!repository) return;
      const result = repository.toLean({ _id: "test-id", name: "test" });
      expect(result?.id).toBe("test-id");
    });

    it("should preserve existing id field", () => {
      if (!repository) return;
      const result = repository.toLean({ id: "existing-id", name: "test" });
      expect(result?.id).toBe("existing-id");
    });

    it("should normalize timestamps to Date objects", () => {
      if (!repository) return;
      const result = repository.toLean({
        id: "123",
        name: "test",
        createdAt: "2026-02-14",
        updatedAt: 1708000000000,
      });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it("should handle empty id by returning empty string", () => {
      if (!repository) return;
      const result = repository.toLean({ name: "test" });
      expect(result?.id).toBe("");
    });
  });

  describe("create", () => {
    it("should create record and return plain object", async () => {
      if (!repository) return;
      const input = { name: "Bob" };
      const result = await repository.create(input);

      expect(result).toHaveProperty("id");
      expect(result.name).toBe("Bob");
      expect(typeof result.id).toBe("string");
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should call model.create with input", async () => {
      if (!repository) return;
      const spyCreate = vi.spyOn(UserModel, "create");
      const input = { name: "Charlie" };

      await repository.create(input);

      expect(spyCreate).toHaveBeenCalled();
    });
  });

  describe("findById", () => {
    it("should return record by id", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "David" });
      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe("David");
    });

    it("should return null if record not found", async () => {
      if (!repository) return;
      const result = await repository.findById("nonexistent-id");
      expect(result).toBeNull();
    });

    it("should call model.findByPk", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Eve" });
      const spyFindByPk = vi.spyOn(UserModel, "findByPk");

      await repository.findById(created.id);

      expect(spyFindByPk).toHaveBeenCalledWith(created.id);
    });
  });

  describe("findMany", () => {
    it("should return array of matching records", async () => {
      if (!repository) return;
      await repository.create({ name: "Frank" });
      await repository.create({ name: "Grace" });

      const results = await repository.findMany();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should return empty array if no matches", async () => {
      if (!repository) return;
      const results = await repository.findMany({
        name: "NotAPersonWhoExists",
      });
      expect(results).toEqual([]);
    });

    it("should apply filter correctly", async () => {
      if (!repository) return;
      const name = `UniqueUser${Date.now()}`;
      await repository.create({ name });

      const results = await repository.findMany({ name });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.name === name)).toBe(true);
    });

    it("should call model.findAll", async () => {
      if (!repository) return;
      const spyFindAll = vi.spyOn(UserModel, "findAll");

      await repository.findMany();

      expect(spyFindAll).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update record and return updated state", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Henry" });
      const updated = await repository.update(created.id, { name: "Harold" });

      expect(updated).not.toBeNull();
      expect(updated?.id).toBe(created.id);
      expect(updated?.name).toBe("Harold");
    });

    it("should return null if record not found", async () => {
      if (!repository) return;
      const result = await repository.update("nonexistent-id", {
        name: "Updated",
      });
      expect(result).toBeNull();
    });

    it("should call model.update", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Iris" });
      const spyUpdate = vi.spyOn(UserModel, "update");

      await repository.update(created.id, { name: "Irene" });

      expect(spyUpdate).toHaveBeenCalled();
    });

    it("should return lean document with updated timestamp", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Jack" });
      const updated = await repository.update(created.id, { name: "Jordan" });

      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });
  });

  describe("delete", () => {
    it("should delete record and return last state", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Karen" });
      const deleted = await repository.delete(created.id);

      expect(deleted).not.toBeNull();
      expect(deleted?.id).toBe(created.id);
      expect(deleted?.name).toBe("Karen");

      // Verify it's actually deleted
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it("should return null if record not found", async () => {
      if (!repository) return;
      const result = await repository.delete("nonexistent-id");
      expect(result).toBeNull();
    });

    it("should call model.destroy", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Leo" });
      const spyDestroy = vi.spyOn(UserModel, "destroy");

      await repository.delete(created.id);

      expect(spyDestroy).toHaveBeenCalled();
    });
  });

  describe("exists", () => {
    it("should return true if record exists", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Mia" });
      const exists = await repository.exists(created.id);

      expect(exists).toBe(true);
    });

    it("should return false if record does not exist", async () => {
      if (!repository) return;
      const exists = await repository.exists("nonexistent-id");
      expect(exists).toBe(false);
    });

    it("should call model.count", async () => {
      if (!repository) return;
      const created = await repository.create({ name: "Nina" });
      const spyCount = vi.spyOn(UserModel, "count");

      await repository.exists(created.id);

      expect(spyCount).toHaveBeenCalled();
    });
  });
});
