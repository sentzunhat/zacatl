import { describe, it, expect, beforeAll, afterAll } from "vitest";
import mongoose, { Schema } from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

describe("MongooseRepository (mongodb-memory-server)", () => {
  let mongoServer: MongoMemoryServer;
  let UserModel: mongoose.Model<any>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: "test" });

    const UserSchema = new Schema(
      {
        name: { type: String, required: true },
      },
      { timestamps: true },
    );

    UserModel = mongoose.model("MemUser", UserSchema);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it("creates and finds a document", async () => {
    const created = await UserModel.create({ name: "MemUser" });
    expect(created).toBeDefined();
    const found = await UserModel.findById(created._id).lean();
    expect(found).not.toBeNull();
    expect(found.name).toBe("MemUser");
  });

  it("updates and deletes a document", async () => {
    const created = await UserModel.create({ name: "ToUpdate" });
    await UserModel.findByIdAndUpdate(created._id, { name: "Updated" }).exec();
    const updated = await UserModel.findById(created._id).lean();
    expect(updated.name).toBe("Updated");

    await UserModel.findByIdAndDelete(created._id).exec();
    const gone = await UserModel.findById(created._id).lean();
    expect(gone).toBeNull();
  });
});
