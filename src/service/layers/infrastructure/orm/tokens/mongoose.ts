/**
 * DI token for the Mongoose instance.
 *
 * Register the shared Mongoose instance under this token at service startup
 * so that ORM adapters and repositories can resolve it via the DI container.
 */
export class MongooseToken {}
