export { MongooseAdapter } from "./mongoose-adapter";
export { SequelizeAdapter } from "./sequelize-adapter";

import { CustomError } from "@zacatl/error";

import { MongooseAdapter as _MongooseAdapter } from "./mongoose-adapter";
import type { DatabaseServerPort } from "./port";
import { DatabaseVendor } from "./port";
import { SequelizeAdapter as _SequelizeAdapter } from "./sequelize-adapter";

export const createDatabaseAdapter = (vendor: DatabaseVendor): DatabaseServerPort => {
  switch (vendor) {
    case DatabaseVendor.MONGOOSE:
      return new _MongooseAdapter();
    case DatabaseVendor.SEQUELIZE:
      return new _SequelizeAdapter();
    default:
      throw new CustomError({
        message: `Unsupported database vendor: ${vendor}`,
        code: 500,
        reason: "database vendor not supported",
      });
  }
};
