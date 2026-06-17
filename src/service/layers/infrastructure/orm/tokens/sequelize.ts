/**
 * DI token for the Sequelize instance.
 *
 * Register the shared Sequelize instance under this token at service startup
 * so that ORM adapters and repositories can resolve it via the DI container.
 */
export class SequelizeToken {}
