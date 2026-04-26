import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

import { mongoose, Schema } from '@zacatl/third-party/mongoose';

describe('MongooseRepository (mongodb-memory-server)', () => {
  let mongoServer: MongoMemoryServer;
  let userModel: mongoose.Model<unknown>;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { dbName: 'test' });

    const userSchema = new Schema(
      {
        name: { type: String, required: true },
      },
      { timestamps: true },
    );

    userModel = mongoose.model('MemUser', userSchema);
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
