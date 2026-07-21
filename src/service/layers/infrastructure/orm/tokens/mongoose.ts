import { createDatabaseToken } from './factory';

/**
 * DI token for the default Mongoose instance.
 *
 * Single-database back-compat alias for createDatabaseToken('MONGOOSE', 'MONGOOSE').
 * For multi-database setups, use createDatabaseToken directly or provide
 * connection.name in DatabaseConfig.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- PascalCase kept for public-API back-compat (was a class token)
export const MongooseToken = createDatabaseToken('MONGOOSE', 'MONGOOSE');
