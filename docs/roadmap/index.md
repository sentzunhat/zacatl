# Zacatl Roadmap

## Current Release

✅ **Stable**

- ESM import fixing for Node.js compatibility
- Multi-database support (SQLite, MongoDB, PostgreSQL)
- Fastify as primary HTTP server framework
- Express HTTP adapter shipped (`AbstractRouteHandler` for Express handlers, `ExpressApiAdapter`)
- Hexagonal architecture with dependency injection
- Docker-ready examples (Fastify + SQLite, Express + SQLite, Express + MongoDB, Express + PostgreSQL)

### Patch Versions

🔧 **Until v0.1.0**

- Bug fixes and performance improvements
- Documentation refinements (guides, migration paths)
- Community feedback integration
- Express + Fastify polish and examples

### Handler & Response Flexibility

🔧 **Conservative separation of shipped behavior vs planned enhancements**

This section intentionally distinguishes what is available now from what may be added later.

**Current behavior (shipped):**

- Handlers implement `handler(request)` for business logic.
- `execute(request, reply)` in `AbstractRouteHandler` orchestrates invocation and auto-sends returned values if a reply was not already sent.
- `handleError(error)` is available and maps Zacatl error types to HTTP status codes.
- There is no built-in `response()` hook in current `AbstractRouteHandler` implementations.

**Current execution flow (shipped):**

```typescript
public async execute(request, reply) {
  try {
    const result = await this.handler(request);

    const replyAlreadySent = 'sent' in reply ? reply.sent : reply.headersSent;
    if (!replyAlreadySent) {
      // Fastify: reply.send(result)
      // Express: reply.send(result)
    }

    return result;
  } catch (error) {
    const errorResponse = this.handleError(error as Error);
    // Adapter/handler sends mapped status + body when reply is still open
    throw error;
  }
}
```

**Planned enhancements (proposal):**

- Evaluate an optional `response()` hook for per-handler success envelope/status customization.
- Keep `handleError()` override support for per-handler error shaping.
- Preserve compatibility with a global error-handler-first deployment style.

**Status**: Planned

**Global Error Handler Pattern (Fastify & Express)**

Handlers can throw errors; a global error handler can normalize responses consistently.

**Fastify Setup** (real-world example):

```typescript
import { CustomError, BadRequestError, NotFoundError } from '@sentzunhat/zacatl';
import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { ZodError } from 'zod';

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

function isCustomError(error: unknown): error is CustomError {
  return error instanceof CustomError;
}

export async function setupServer(server: FastifyInstance): Promise<void> {
  // Register middleware/plugins
  await server.register(cors, { origin: '*' });
  await server.register(helmet, {
    contentSecurityPolicy: false,
    frameguard: { action: 'deny' },
  });

  // Global error handler — catches ALL errors
  server.setErrorHandler(
    async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      // Log the error
      server.log.error({
        method: request.method,
        url: request.url,
        error: error.message,
        stack: error.stack,
      });

      // Handle Zod validation errors
      if (isZodError(error)) {
        return reply.code(400).send({
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          statusCode: 400,
          details: {
            issues: error.issues,
          },
        });
      }

      // Handle custom errors (with statusCode from error.statusCode property)
      if (isCustomError(error)) {
        const statusCode = error.statusCode || 500;
        return reply.code(statusCode).send({
          ok: false,
          error: error.code || 'ERROR',
          message: error.message,
          statusCode,
          reason: error.reason,
        });
      }

      // Handle FastifyError (validation, serialization, etc.)
      if (error.validation) {
        return reply.code(400).send({
          ok: false,
          error: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          statusCode: 400,
          details: { issues: error.validation },
        });
      }

      // Fallback: generic error
      const statusCode = error.statusCode || 500;
      return reply.code(statusCode).send({
        ok: false,
        error: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message,
        statusCode,
      });
    },
  );
}
```

**Handler Pattern** (handlers just throw):

```typescript
export class UserGetHandler extends GetRouteHandler<User> {
  async handler(request, reply) {
    const userId = request.params.id;

    // Just throw — global error handler will catch
    const user = await this.repository.findOne(userId);
    if (!user) throw new NotFoundError('User not found');

    return user;
  }
}
```

**Express Setup** (similar pattern):

```typescript
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';

export function setupExpressServer(app: Express): void {
  app.use(cors({ origin: '*' }));
  app.use(helmet());

  // Global error handler — placed at the end
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    // Log error
    console.error(`[${req.method}] ${req.path}`, error.message);

    // Handle custom errors
    if (isCustomError(error)) {
      const statusCode = error.statusCode || 500;
      return res.status(statusCode).json({
        ok: false,
        error: error.code || 'ERROR',
        message: error.message,
        statusCode,
      });
    }

    // Handle Zod errors
    if (isZodError(error)) {
      return res.status(400).json({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        statusCode: 400,
        details: { issues: error.issues },
      });
    }

    // Fallback
    res.status(500).json({
      ok: false,
      error: 'INTERNAL_ERROR',
      message: 'Something went wrong',
      statusCode: 500,
    });
  });
}
```

**Execution Flow (current + global handler option):**

1. `execute()` calls `handler()` for business logic.
2. On success, the adapter auto-sends the returned value when the reply is still open.
3. On error, `handleError()` maps known error types to a status/body shape.
4. The handler rethrows, allowing an optional global error handler to add centralized logging/normalization.
5. Reply is finalized with the mapped status and response body.

**Key Pattern:**

```typescript
// Handler: just throw
class UserCreateHandler extends PostRouteHandler<User> {
  async handler(request, reply) {
    if (!request.body.email) {
      throw new BadRequestError('Email is required'); // statusCode 400 from CustomError
    }
    const user = await this.repository.create(request.body);
    return user; // Returned value is auto-sent when reply is still open
  }
}

// Global handler catches all throws
// Knows how to handle CustomError, ZodError, FastifyError, etc.
// Sends consistent error response with correct statusCode
```

**Benefits:**

- **Handlers stay clean** — just throw, no error handling code
- **Global handler is DRY** — one place for all error logic, logging, metrics
- **Status codes automatic** — come from error.statusCode or error.code
- **Works for both Fastify & Express** — same pattern, same error classes
- **Testable** — mock errors, verify global handler response
- **Extensible** — add error tracking (Sentry), metrics, logging in one place
- **Per-handler customization still possible** — override `handleError()` if needed

---

### Schema Validation Flexibility

🎯 **Flexible Validation: Zod, Yup, or None**

**Goal**: Give users choice and control over request/response validation. Keep Zod as the recommended default, add Yup support for migration paths, and allow opt-out for maximum performance.

**Current State**:

- ✅ Zod validation built-in and recommended
- ✅ Strong type safety with TypeScript + Zod schemas
- ✅ Automatic validation errors with helpful messages
- ✅ Works seamlessly with Global Error Handler

**Planned Enhancements**:

**1. Yup Support for Express & Fastify**

Enable Yup as an alternative validation library:

```typescript
// Option A: Zod (default, recommended)
import { z } from 'zod';
import { PostRouteHandler } from '@sentzunhat/zacatl';

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

class CreateUserHandler extends PostRouteHandler<User, typeof createUserSchema> {
  schema = createUserSchema;

  async handler(request, reply) {
    // request.body is validated and typed
    return await this.userService.create(request.body);
  }
}

// Option B: Yup (for existing codebases or preference)
import * as yup from 'yup';
import { PostRouteHandler } from '@sentzunhat/zacatl';

const createUserSchema = yup.object({
  name: yup.string().required().min(3),
  email: yup.string().required().email(),
});

class CreateUserHandler extends PostRouteHandler<User, typeof createUserSchema> {
  schema = createUserSchema;
  validationLibrary = 'yup'; // explicit opt-in

  async handler(request, reply) {
    // request.body is validated with Yup
    return await this.userService.create(request.body);
  }
}
```

**2. No Schema Validation (Opt-Out)**

For scenarios where validation isn't needed or is handled elsewhere:

```typescript
import { PostRouteHandler } from '@sentzunhat/zacatl';

// Option C: No validation (manual checks or pre-validated data)
class CreateUserHandler extends PostRouteHandler<User, CreateUserInput> {
  // No schema property = no automatic validation

  async handler(request, reply) {
    // Manual validation if needed
    if (!request.body?.email) {
      throw new BadRequestError('Email is required');
    }

    // Or trust upstream validation (API gateway, middleware, etc.)
    return await this.userService.create(request.body);
  }
}
```

**3. Validation Adapter Pattern**

Abstract validation behind a common interface:

```typescript
interface ValidationAdapter<T> {
  validate(data: unknown): T;
  validateAsync(data: unknown): Promise<T>;
}

class ZodAdapter<T> implements ValidationAdapter<T> {
  constructor(private schema: z.ZodSchema<T>) {}
  validate(data: unknown): T {
    return this.schema.parse(data);
  }
}

class YupAdapter<T> implements ValidationAdapter<T> {
  constructor(private schema: yup.Schema<T>) {}
  async validate(data: unknown): Promise<T> {
    return await this.schema.validate(data);
  }
}

// Framework detects and uses the appropriate adapter
```

**4. Configuration-Level Defaults**

Set project-wide validation preferences:

```typescript
// zacatl.config.ts
export default {
  validation: {
    library: 'zod', // "zod" | "yup" | "none"
    strict: true, // throw on validation errors
    stripUnknown: true, // remove extra properties
  },
  // ... other config
};
```

**Benefits**:

- **Choice**: Use Zod, Yup, or no validation based on project needs
- **Performance**: Skip validation overhead when not needed (trusted sources, internal APIs)
- **Migration**: Adopt Zacatl without rewriting existing Yup schemas
- **Flexibility**: Mix validation strategies in the same project (per-route control)
- **Standards**: Validation adapters follow common interface — easy to extend
- **Type Safety**: TypeScript inference works with all validation libraries

**Implementation Phases**:

- **Phase 1**: No-validation opt-out, documentation
- **Phase 2** (v0.1.0): Yup adapter implementation
- **Phase 3** (v0.1.0): Configuration-level defaults and validation adapter interface
- **Phase 4** (Post v0.1.0): Additional libraries (Joi, Ajv, class-validator) as community demand grows

**Use Cases**:

1. **High-throughput APIs**: Skip validation for performance-critical endpoints
2. **Microservices**: Validation already done by API gateway
3. **Legacy codebases**: Keep existing Yup schemas during Zacatl migration
4. **Hybrid projects**: Zod for new code, Yup for legacy, none for internal routes
5. **Prototyping**: Fast iteration without schema definitions

**Timeline**:

- **Near-term**: Opt-out support and documentation
- **v0.1.0**: Full Yup support and validation adapter pattern

---

## Next Major Version (v0.1.0)

### Goal

Multi-Provider Framework Support: Extend architecture beyond HTTP servers to support **CLI**, **Desktop**, and other platforms alongside Fastify/Express HTTP providers.

### Implementation Plan

**Phase 1: CLI Provider**

- SDK for building CLI applications with same domain/infrastructure layers
- Command routing and middleware
- Examples: CLI tools, background workers

**Phase 2: Desktop Provider**

- Desktop application provider (Electron, Tauri ready)
- UI event routing
- Same layered architecture, framework-agnostic application logic

**Phase 3: Documentation & Tooling**

- Migration guides (HTTP ↔ CLI/Desktop)
- Multi-provider project templates
- Framework comparison and selection guides

### Benefits

- Single platform-agnostic domain layer
- Reuse business logic across HTTP, CLI, Desktop at compile time
- Framework selection at configuration time
- Proven architecture extends beyond web

### Timeline

- **Target**: v0.1.0 (next minor release after patch series)
- **Effort**: Significant (introduces new provider ecosystem)

---

## How to Contribute

Have ideas? Found improvements? Open an issue or PR!

Current focus: Keep it simple, pragmatic, production-ready. 🚀
