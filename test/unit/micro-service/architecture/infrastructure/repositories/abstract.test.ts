import { Schema } from "mongoose";
import { singleton } from "tsyringe";

import { BaseRepository } from "../../../../../../src/micro-service/architecture/infrastructure";
import { connectToMongoServerAndRegisterDependency } from "../../../../helpers/database/mongo";

interface UserTest {
  name: string;
}

const schemaUserTest = new Schema<UserTest>({
  name: { type: String, required: true },
});

@singleton()
class UserRepository extends BaseRepository<UserTest, UserTest> {
  constructor() {
    super({ type: "mongoose", name: "User", schema: schemaUserTest });
  }
}

describe("BaseRepository", () => {
  let repository: UserRepository;

  beforeAll(async () => {
    await connectToMongoServerAndRegisterDependency();

    repository = new UserRepository();
  });

  it("should create a model using the provided name and schema", async () => {
    expect(repository.getMongooseModel().modelName).toBe("User");
    expect(repository.getMongooseModel().schema).toBe(schemaUserTest);
  });

  it("should call create() and return the created user document", async () => {
    const user = { name: "Alice" };

    const spyFunction = vi.spyOn(repository.getMongooseModel(), "create");

    const result = await repository.create(user);

    expect(spyFunction).toHaveBeenNthCalledWith(1, user);
    expect(result).toEqual(expect.objectContaining(user));
  });

  it("should call findById() and return the user document", async () => {
    const user = await repository.create({ name: "Alice" });
    const spyFunction = vi.spyOn(repository.getMongooseModel(), "findById");
    const result = await repository.findById(user.id);
    expect(spyFunction).toHaveBeenNthCalledWith(1, user.id);
    expect(result).toMatchObject({ name: user.name });
    expect(result?.id).toBe(user.id);
  });

  it("should call update() and return the updated user document", async () => {
    const user = await repository.create({ name: "Alice" });

    const update = { name: "Alice Updated" };

    const spyFunction = vi.spyOn(
      repository.getMongooseModel(),
      "findByIdAndUpdate"
    );

    const result = await repository.update(user.id, update);

    expect(spyFunction).toHaveBeenNthCalledWith(1, user.id, update, {
      new: true,
    });
    expect(result).toEqual(expect.objectContaining(update));
  });

  it("should call delete() and return the deleted user document", async () => {
    const user = await repository.create({ name: "Alice" });
    const spyFunction = vi.spyOn(
      repository.getMongooseModel(),
      "findByIdAndDelete"
    );
    const result = await repository.delete(user.id);
    expect(spyFunction).toHaveBeenNthCalledWith(1, user.id);
    // Patch: allow for id only (ignore _id)
    expect(result).toMatchObject({ name: user.name });
    expect(result?.id).toBe(user.id);
  });
});
