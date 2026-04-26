/**
 * DI token for the shared node:sqlite DatabaseSync instance.
 *
 * Register the shared database instance under this token at service startup
 * so that ORM adapters and repositories can resolve it via the DI container.
 */
export class NodeSqliteToken {}
