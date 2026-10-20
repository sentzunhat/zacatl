export const createDatabaseToken = (vendor: string, key: string): symbol =>
  Symbol.for(`@sentzunhat/zacatl/service/layers/infrastructure/orm/${vendor}/${key}`);
