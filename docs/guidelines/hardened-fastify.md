# Hardened Fastify Template

Zacatl deliberately does **not** bundle security middleware — every service
passes its own `FastifyInstance` via `server.instance`, so security stays
under the service's control and the framework stays lean. This page is the
recommended production template, adapted from a real service running on
zacatl. Copy it, delete what you don't need, and pass the result to zacatl.

## Dependencies (yours, not zacatl's)

```bash
npm install @fastify/helmet @fastify/cors @fastify/rate-limit \
  @fastify/multipart @fastify/swagger @fastify/swagger-ui \
  fastify-type-provider-zod
```

## The template

```typescript
import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from 'fastify';
import type { ZodError } from 'zod';

import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { CustomError } from '@sentzunhat/zacatl/error';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

const isProduction = process.env['NODE_ENV'] === 'production';

/**
 * CORS origin from ALLOWED_ORIGINS (comma-separated allowlist).
 * - Production REQUIRES an explicit allowlist — boot fails without one.
 * - Wildcards are rejected in every environment.
 * - Unset in development reflects the request origin for convenience.
 */
export const resolveCorsOrigin = (): string[] | boolean => {
  const raw = process.env['ALLOWED_ORIGINS']?.trim();
  if (raw == null || raw === '') {
    if (isProduction) {
      throw new Error(
        'ALLOWED_ORIGINS is required in production and must be an explicit allowlist.',
      );
    }
    return true; // reflect request origin (dev only)
  }
  const origins = raw.split(',').map((o) => o.trim()).filter(Boolean);
  if (origins.includes('*')) {
    throw new Error('ALLOWED_ORIGINS cannot contain a wildcard (*).');
  }
  return origins;
};

const swaggerUiEnabled = (): boolean => {
  const raw = process.env['ENABLE_SWAGGER_UI']?.trim().toLowerCase();
  if (raw == null || raw === '') return !isProduction;
  return ['1', 'true', 'yes', 'on'].includes(raw);
};

export const createHardenedFastify = async (): Promise<FastifyInstance> => {
  const server = Fastify({ logger: isProduction });

  // Zod validation/serialization — zacatl's route handlers rely on these.
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // Security headers. Tune the CSP to your frontend's needs.
  await server.register(helmet, {
    frameguard: { action: 'deny' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    noSniff: true,
    hidePoweredBy: true,
  });

  await server.register(cors, { origin: resolveCorsOrigin() });

  // global: false — opt individual routes in via config.rateLimit.
  await server.register(fastifyRateLimit, { global: false });

  await server.register(fastifyMultipart);

  // Survive load balancers: keepAlive above the LB idle timeout,
  // headersTimeout above keepAliveTimeout.
  server.server.keepAliveTimeout = 65 * 1000;
  server.server.headersTimeout = 70 * 1000;

  // Layered error handler: schema validation → serialization → Zod →
  // CustomError → fallback. Never leak stack traces to clients.
  server.setErrorHandler(
    async (error: FastifyError, _request: FastifyRequest, reply: FastifyReply) => {
      if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: "Request doesn't match the schema",
          details: { issues: error.validation },
        });
      }
      if (isResponseSerializationError(error)) {
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: "Response doesn't match the schema",
        });
      }
      if (error instanceof Error && error.name === 'ZodError') {
        const zodError = error as unknown as ZodError;
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Validation failed',
          details: { issues: zodError.issues },
        });
      }
      if (error instanceof CustomError) {
        const code = error.code != null ? Number(error.code) : 500;
        return reply.status(code).send({
          statusCode: code,
          error: error.name,
          message: error.message,
        });
      }
      return reply.status(error.statusCode ?? 500).send({
        statusCode: error.statusCode ?? 500,
        error: error.name,
        message: error.message,
      });
    },
  );

  // OpenAPI docs — UI enabled outside production (or via ENABLE_SWAGGER_UI).
  await server.register(fastifySwagger, {
    openapi: {
      info: { title: 'my-service', description: 'backend service', version: '0.0.1' },
      servers: [],
    },
    transform: jsonSchemaTransform,
  });
  if (swaggerUiEnabled()) {
    await server.register(fastifySwaggerUI, { routePrefix: '/documentation' });
  }

  return server;
};
```

## Wiring it into zacatl

```typescript
import { Service, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const fastify = await createHardenedFastify();

new Service({
  type: ServiceType.SERVER,
  layers: { application: { entryPoints: { rest: { routes: [/* ... */] } } } },
  platforms: {
    server: {
      name: 'my-service',
      port: 8080,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify, // your hardened instance
      },
      page: {
        staticDir: 'apps/frontend/dist',
        cache: { maxAge: '1y', immutable: true },
      },
      databases: [/* ... */],
    },
  },
});
```

## What zacatl already handles (don't duplicate)

- **Route-level error mapping** — zacatl's abstract route handlers map
  framework error types (`NotFoundError` → 404, `ValidationError` → 422,
  etc.) per route; the global `setErrorHandler` above is the safety net for
  everything that escapes them.
- **Static assets + SPA fallback + cache headers** — `page.staticDir` and
  `page.cache` serve the frontend with CDN-correct `Cache-Control`
  (`index.html` always `no-cache`).
- **Zod route schemas** — handlers declare Zod schemas; the compilers set in
  the template are the only per-instance requirement.

## Notes

- Helmet's default CSP will block inline scripts; if your SPA needs
  exceptions (or Swagger UI is enabled), pass a custom
  `contentSecurityPolicy` to the helmet registration.
- The same pattern works for Express (`vendor: ServerVendor.EXPRESS`) with
  `helmet`, `cors`, and `express-rate-limit` applied to your own `express()`
  instance before passing it as `instance`.
