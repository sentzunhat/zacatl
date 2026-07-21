export const createDatabaseToken = (vendor: string, key: string): symbol =>
  Symbol.for(`db:${vendor}:${key}`);
