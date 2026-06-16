export enum ORMType {
  Mongoose = 'mongoose',
  Sequelize = 'sequelize',
  NodeSqlite = 'nodesqlite',
}

export type LeanDocument<T extends object = Record<string, unknown>> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
