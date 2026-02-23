// Re-export common types and hook handlers
export * from './common';
export * from './hook-handlers';

// Re-export RouteHandler interface (used by adapters)
export type { RouteHandler } from './fastify/handlers/route-handler';

// Backward compatibility: Export Fastify handlers by default from @sentzunhat/zacatl/service
// Projects using this import path get Fastify handlers (existing behavior)
export * from './fastify/handlers';

// Note: Provider-specific imports are available for explicit framework selection:
// - @sentzunhat/zacatl/handlers/fastify (Fastify-specific handlers)
// - @sentzunhat/zacatl/handlers/express (Express-specific handlers)
