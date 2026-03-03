import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { beforeEach, afterEach, describe, expect, it } from 'vitest';

describe('Mongoose + mongodb-memory-server extended operations', () => {
  let mongod: MongoMemoryServer;

  beforeEach(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri, {});

    const UserSchema = new mongoose.Schema({
      email: { type: String, unique: true },
      name: String,
      meta: { type: { age: Number }, default: {} },
    });

    const PostSchema = new mongoose.Schema({
      title: String,
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    });

    mongoose.model('User', UserSchema);
    mongoose.model('Post', PostSchema);
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
    const User = mongoose.model('User') as mongoose.Model<any>;
    await User.create({ email: 'u1@example.com', name: 'U1' });
    let threw = false;
    try {
      await User.create({ email: 'u1@example.com', name: 'U2' });
    } catch (err: any) {
      threw = true;
      expect(err).toBeTruthy();
    }
    expect(threw).toBe(true);
  });

  it('supports populate, updateMany, aggregate and countDocuments', async () => {
    const User = mongoose.model('User') as mongoose.Model<any>;
    const Post = mongoose.model('Post') as mongoose.Model<any>;

    const u = await User.create({ email: 'pop@example.com', name: 'P', meta: { age: 30 } });
    await Post.create({ title: 'one', author: u._id });
    await Post.create({ title: 'two', author: u._id });

    const posts = await Post.find({}).populate('author');
    expect(posts.length).toBe(2);
    expect(posts[0].author.email).toBe('pop@example.com');

    await User.updateMany({ 'meta.age': { $gte: 30 } }, { $set: { 'meta.age': 31 } });
    const updated = await User.findOne({ email: 'pop@example.com' });
    expect(updated.meta.age).toBe(31);

    const agg = await Post.aggregate([{ $group: { _id: '$author', count: { $sum: 1 } } }]);
    expect(agg[0].count).toBe(2);

    const c = await Post.countDocuments();
    expect(c).toBe(2);
  });
});
