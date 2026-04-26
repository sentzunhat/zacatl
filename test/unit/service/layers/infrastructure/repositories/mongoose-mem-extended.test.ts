import { MongoMemoryServer } from 'mongodb-memory-server';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

import { mongoose } from '@zacatl/third-party/mongoose';

describe('Mongoose + mongodb-memory-server extended operations', () => {
  let mongod: MongoMemoryServer;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {});

    const userSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      name: String,
      meta: { type: { age: Number }, default: {} },
    });

    const postSchema = new mongoose.Schema({
      title: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    });

    mongoose.model('User', userSchema);
    mongoose.model('Post', postSchema);
    // Ensure indexes are created before tests that rely on unique constraints
    await mongoose.model('User').createIndexes();
  });

  afterEach(async () => {
    await mongoose.disconnect();
    await mongod.stop();
    const models = mongoose.models;
    Object.keys(models).forEach((k) => delete mongoose.models[k]);
  });

  it('supports unique index violations and validation', async () => {
    const userModel = mongoose.model('User') as mongoose.Model<unknown>;
    await userModel.create({ email: 'u1@example.com', name: 'U1' });
    let threw = false;
    try {
      await userModel.create({ email: 'u1@example.com', name: 'U2' });
    } catch (err: unknown) {
      threw = true;
      expect(err).toBeTruthy();
    }
    expect(threw).toBe(true);
  });

  it('supports populate, updateMany, aggregate and countDocuments', async () => {
    const userModel = mongoose.model('User') as mongoose.Model<unknown>;
    const postModel = mongoose.model('Post') as mongoose.Model<unknown>;

    const user = await userModel.create({ email: 'pop@example.com', name: 'P', meta: { age: 30 } });
    await postModel.create({ title: 'one', author: user._id });
    await postModel.create({ title: 'two', author: user._id });

    const posts = await postModel.find({}).populate('author');
    expect(posts.length).toBe(2);
    expect(
      ((posts[0] as Record<string, unknown>)['author'] as Record<string, unknown>)['email'],
    ).toBe('pop@example.com');

    await userModel.updateMany({ meta: { age: { $gte: 30 } } }, { $set: { meta: { age: 31 } } });
    const updated = await userModel.findOne({ email: 'pop@example.com' });
    expect(((updated as Record<string, unknown>)['meta'] as Record<string, unknown>)['age']).toBe(
      31,
    );

    const agg = await postModel.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }]);
    expect((agg[0] as Record<string, unknown>)['count']).toBe(2);

    const c = await postModel.countDocuments();
    expect(c).toBe(2);
  });
});
