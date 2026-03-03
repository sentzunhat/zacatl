// @barrel-manual
// Selective exports for internal ORM adapter factory functions.
//
// This module exports ONLY the adapter factory functions needed by the
// BaseRepository class. The actual Mongoose/Sequelize/node:sqlite packages
// are NOT re-exported here — they remain available only through subpath imports
// (@zacatl/third-party/mongoose, @zacatl/third-party/sequelize, node:sqlite).

export { createMongooseAdapter } from './mongoose/adapter-loader';
export { createSequelizeAdapter } from './sequelize/adapter-loader';
export { createNodeSqliteAdapter } from './nodesqlite';
