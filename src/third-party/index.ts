// @barrel-generated
export * from './dependency-injection/tsyringe';
export * from './zod';
export * from './uuid';
export * from './i18n';
export * from './js-yaml';
export * from './fastify';
export * from './express';
export * from './http-proxy-middleware';
export * from './dependency-injection/reflect-metadata';
export * from './databases/sqlite3';

// ORM exports are available via subpath imports only to avoid naming conflicts:
// - @zacatl/third-party/mongoose (exports Schema, connect, etc.)
// - @zacatl/third-party/sequelize (exports DataTypes, Op, etc.)
