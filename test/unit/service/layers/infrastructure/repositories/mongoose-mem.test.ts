import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { mongoose, Schema } from '@zacatl/third-party/databases/mongoose';

const userSchema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true },
);

// mongoose 9.10+ models carry an `id` virtual, so a hand-written Model<unknown>
// annotation no longer matches; let mongoose infer the type from the schema.
const userModel = mongoose.model('MemUser', userSchema);

describe('BaseRepository (mongodb-memory-server)', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
  });

  it('creates and finds a document', async () => {
    const created = await userModel.create({ name: 'MemUser' });
    expect(created).toBeDefined();
    const found = await userModel.findById(created._id).lean();
    expect(found).not.toBeNull();
    expect((found as Record<string, unknown>)['name']).toBe('MemUser');
  });

  it('updates and deletes a document', async () => {
    const created = await userModel.create({ name: 'ToUpdate' });
    await userModel.findByIdAndUpdate(created._id, { name: 'Updated' }).exec();
    const updated = await userModel.findById(created._id).lean();
    expect((updated as Record<string, unknown>)['name']).toBe('Updated');

    await userModel.findByIdAndDelete(created._id).exec();
    const gone = await userModel.findById(created._id).lean();
    expect(gone).toBeNull();
  });
});
