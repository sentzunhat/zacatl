export const createDatabaseToken = (vendor: string, key: string): symbol =>
  Symbol.for(`@sentzunhat/zacatl/service/layers/infrastructure/orm/${vendor}/${key}`);

/** Token used by releases before ORM tokens were moved into the package namespace. */
export const createLegacyDatabaseToken = (vendor: string, key: string): symbol =>
  Symbol.for(`db:${vendor}:${key}`);
