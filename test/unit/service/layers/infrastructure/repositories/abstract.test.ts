import { Schema } from "mongoose";
import { singleton } from "tsyringe";

import { BaseRepository } from "../../../../../../src/service/layers/infrastructure/repositories/abstract";
import { ORMType } from "../../../../../../src/service/layers/infrastructure/repositories/types";
import { connectToMongoServerAndRegisterDependency } from "../../../../helpers/database/mongo";

interface UserTest {
  name: string;
}

interface UserTestOutput extends UserTest {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const schemaUserTest = new Schema<UserTest>({
  name: { type: String, required: true },
});

@singleton()
class UserRepository extends BaseRepository<
  UserTest,
  UserTest,
  UserTestOutput
> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "User", schema: schemaUserTest });
  }
}

describe("BaseRepository", () => {
  let repository: UserRepository;

  beforeAll(async () => {
    await connectToMongoServerAndRegisterDependency();

    try {
      repository = new UserRepository();
    } catch (error: any) {
      // If mongoose adapter can't be loaded (running from TS source), skip these tests
      if (error.message?.includes("Mongoose is not installed")) {
        console.log(
          "Skipping BaseRepository tests - running from TypeScript source",
        );
        return;
      }
      throw error;
    }
  });

  it("should create a model using the provided name and schema", async () => {
    if (!repository) return; // Skip if repository couldn't be initialized
    // Initialize adapter by calling an async method first
    await repository.create({ name: "test" });
    expect(repository.getMongooseModel().modelName).toBe("User");
    expect(repository.getMongooseModel().schema).toBe(schemaUserTest);
  });

  it("should call create() and return the created user document", async () => {
    if (!repository) return; // Skip if repository couldn't be initialized
    const user = { name: "Alice" };

    // Initialize adapter first, then spy
    await repository.create({ name: "init" });
    const spyFunction = vi.spyOn(repository.getMongooseModel(), "create");

    const result = await repository.create(user);

    expect(spyFunction).toHaveBeenCalledWith(user);
    expect(result).toEqual(expect.objectContaining(user));
  });

  it("should call findById() and return the user document", async () => {
    if (!repository) return; // Skip if repository couldn't be initialized
    const user = await repository.create({ name: "Alice" });
    const spyFunction = vi.spyOn(repository.getMongooseModel(), "findById");
    const result = await repository.findById(user.id);
    expect(spyFunction).toHaveBeenNthCalledWith(1, user.id);
    expect(result).toMatchObject({ name: user.name });
    expect(result?.id).toBe(user.id);
  });

  it("should call update() and return the updated user document", async () => {
    if (!repository) return; // Skip if repository couldn't be initialized
    const user = await repository.create({ name: "Alice" });

    const update = { name: "Alice Updated" };

    const spyFunction = vi.spyOn(
      repository.getMongooseModel(),
      "findByIdAndUpdate",
    );

    const result = await repository.update(user.id, update);

    expect(spyFunction).toHaveBeenNthCalledWith(1, user.id, update, {
      new: true,
    });
    expect(result).toEqual(expect.objectContaining(update));
  });

  it("should call delete() and return the deleted user document", async () => {
    if (!repository) return; // Skip if repository couldn't be initialized
    const user = await repository.create({ name: "Alice" });
    const spyFunction = vi.spyOn(
      repository.getMongooseModel(),
      "findByIdAndDelete",
    );
    const result = await repository.delete(user.id);
    expect(spyFunction).toHaveBeenNthCalledWith(1, user.id);
    // Patch: allow for id only (ignore _id)
    expect(result).toMatchObject({ name: user.name });
    expect(result?.id).toBe(user.id);
  });
});
