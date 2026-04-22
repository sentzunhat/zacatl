// @barrel-generated
// Re-export common types and hook handlers
export * from './common';
export * from './hook-handlers';

// Re-export RouteHandler interface (used by adapters)
export type { RouteHandler } from './fastify/handlers/route-handler';

// Backward compatibility: Export Fastify handlers by default from @sentzunhat/zacatl/service
// Projects using this import path get Fastify handlers (existing behavior)
export * from './fastify/handlers';

// Fastify-prefixed aliases for clearer, vendor-explicit imports.
export {
  AbstractRouteHandler as AbstractFastifyRouteHandler,
  AbstractRouteHandler as FastifyAbstractRouteHandler,
  DeleteRouteHandler as DeleteFastifyRouteHandler,
  DeleteRouteHandler as FastifyDeleteRouteHandler,
  GetRouteHandler as GetFastifyRouteHandler,
  GetRouteHandler as FastifyGetRouteHandler,
  PatchRouteHandler as PatchFastifyRouteHandler,
  PatchRouteHandler as FastifyPatchRouteHandler,
  PostRouteHandler as PostFastifyRouteHandler,
  PostRouteHandler as FastifyPostRouteHandler,
  PutRouteHandler as PutFastifyRouteHandler,
  PutRouteHandler as FastifyPutRouteHandler,
} from './fastify/handlers';

// Note: Provider-specific imports are available for explicit framework selection:
// - @sentzunhat/zacatl/handlers/fastify (Fastify-specific handlers)
// - @sentzunhat/zacatl/handlers/express (Express-specific handlers)
