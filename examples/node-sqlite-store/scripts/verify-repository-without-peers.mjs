// Exercises Zacatl's node:sqlite BaseRepository while the optional database
// peers (sqlite3, sequelize, mongoose, ...) are unresolvable, the way they are
// in a consumer app that never installed them.
//
// The repo-local `file:../..` link can still see those packages in Zacatl's own
// node_modules, so "not declared" is not enough; a resolve hook blocks them.
import { registerHooks } from 'node:module';
import { DatabaseSync } from 'node:sqlite';

const optionalPeers = new Set(['sqlite3', 'sequelize', 'mongoose', 'mongodb', 'pg']);
const attempted = [];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (optionalPeers.has(specifier)) {
      attempted.push(specifier);
      const error = new Error(`Cannot find package '${specifier}' (blocked optional peer)`);
      error.code = 'ERR_MODULE_NOT_FOUND';
      throw error;
    }
    return nextResolve(specifier, context);
  },
});

const { registerValue } = await import('@sentzunhat/zacatl/dependency-injection');
const { NodeSqliteToken } =
  await import('@sentzunhat/zacatl/service/layers/infrastructure/orm/tokens/nodesqlite');
const { BaseRepository } =
  await import('@sentzunhat/zacatl/service/layers/infrastructure/repositories/nodesqlite/repository');

class NoteRepository extends BaseRepository {
  constructor() {
    super({ type: 'nodesqlite', name: 'notes' });
  }
}

const db = new DatabaseSync(':memory:');
registerValue(NodeSqliteToken, db);

try {
  const notes = new NoteRepository();
  const created = await notes.create({ title: 'hello' });
  const found = await notes.findById(created.id);

  if (found?.title !== 'hello') {
    throw new Error(`Round-trip failed: ${JSON.stringify(found)}`);
  }
  if (attempted.length > 0) {
    throw new Error(`Optional peers were requested: ${attempted.join(', ')}`);
  }

  console.log('node:sqlite BaseRepository works without sqlite3/sequelize/mongoose installed.');
} finally {
  db.close();
}
