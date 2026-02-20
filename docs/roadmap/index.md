# Zacatl Roadmap

## Current Release (v0.0.39)

✅ **Stable**

- ESM import fixing for Node.js compatibility
- Multi-database support (SQLite, MongoDB, PostgreSQL)
- Fastify as primary HTTP server framework
- Express HTTP adapter shipped (`AbstractExpressRouteHandler`, `ExpressApiAdapter`)
- Hexagonal architecture with dependency injection
- Docker-ready examples (Fastify + SQLite, Express + SQLite, Express + MongoDB, Express + PostgreSQL)

### Patch Versions (v0.0.40+)

🔧 **Until v0.1.0**

- Bug fixes and performance improvements
- Documentation refinements (guides, migration paths)
- Community feedback integration
- Express + Fastify polish and examples

### Handler & Response Flexibility (v0.0.40+)

🔧 **Simplified Handler Lifecycle with Sensible Defaults**

**Goal**: Simple method overrides with robust default implementations. Users only override what they need.

**Core Pattern**: Keep `execute()` for business logic, add `response()` and `handleError()` with defaults in abstract.

**Default Behavior** (in AbstractRouteHandler):

```typescript
// Default: returns { ok: true, data } with statusCode 200
// Can be overridden to return { ok, data, statusCode } for custom status
protected response(data: T): any {
  return { ok: true, data, statusCode: 200 };
}

// Default: handles common error types automatically with correct status codes
protected handleError(error: Error): { error: string; message: string; statusCode: number } {
  if (error instanceof NotFoundError) {
    return { error: 'NOT_FOUND', message: error.message, statusCode: 404 };
  }
  if (error instanceof BadRequestError) {
    return { error: 'BAD_REQUEST', message: error.message, statusCode: 400 };
  }
  if (error instanceof ValidationError) {
    return { error: 'VALIDATION_ERROR', message: error.message, statusCode: 422 };
  }
  if (error instanceof UnauthorizedError) {
    return { error: 'UNAUTHORIZED', message: error.message, statusCode: 401 };
  }
  if (error instanceof ForbiddenError) {
    return { error: 'FORBIDDEN', message: error.message, statusCode: 403 };
  }
  return { error: 'INTERNAL_ERROR', message: 'Something went wrong', statusCode: 500 };
}
```

**User Handler** (simple case — no overrides needed):

```typescript
class UserGetHandler extends GetRouteHandler<User> {
  async execute(request, reply) {
    const user = await this.repository.findById(request.params.id);
    if (!user) throw new NotFoundError("User not found");
    return user;
  }
  // Automatic: response() wraps in { ok: true, data }
  // Automatic: handleError() handles errors with sensible defaults
}
```

**User Handler** (custom envelope and status — override what you need):

```typescript
class UserCreateHandler extends PostRouteHandler<User, CreateUserInput, User> {
  async execute(request, reply) {
    const newUser = await this.repository.create(request.body);
    return newUser;
  }

  // Override response shape and status code
  protected response(user: User) {
    return {
      success: true,
      data: { id: user.id, name: user.name, email: user.email },
      statusCode: 201, // Created — API respects this status code
    };
  }

  // Override error shape with custom status code
  protected handleError(error: Error) {
    if (error instanceof BadRequestError) {
      return {
        success: false,
        error: "INVALID_INPUT",
        message: error.message,
        statusCode: 400, // Bad Request
      };
    }
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: "VALIDATION_FAILED",
        message: error.message,
        statusCode: 422, // Unprocessable Entity
      };
    }
    return {
      success: false,
      error: "SERVER_ERROR",
      statusCode: 500,
    };
  }
}
```

**Execute() Pipeline** (in AbstractRouteHandler):

The framework orchestrates the handler lifecycle automatically:

```typescript
// Pseudocode: how execute() manages the flow
public async execute(request, reply) {
  try {
    // 1. Call handler's business logic
    const result = await this.handler(request, reply);

    // 2. Format success response via response() override (or default)
    const { statusCode, ...body } = this.response(result);

    // 3. Send response with correct HTTP status
    reply.code(statusCode).send(body);

  } catch (error) {
    // 4. Format error response via handleError() override (or default)
    const { statusCode, ...body } = this.handleError(error);

    // 5. Send error with correct HTTP status
    reply.code(statusCode).send(body);

    // If step 4 or 5 throws unexpectedly, global error handler catches it
  }
}
```

**Three tiers of error handling:**

1. **Handler `handleError()` override** — per-handler customization, knows business logic
2. **Handler default `handleError()`** — automatic mapping of Zacatl error types to status codes
3. **Global error handler** — catches unhandled errors, schema validation failures, serialization errors, fallback for unexpected errors

**4. Global Error Handler (Fastify & Express)**

Handlers simply **throw errors**. A global error handler catches everything and normalizes responses.

**Fastify Setup** (real-world example):

```typescript
import { CustomError, BadRequestError, NotFoundError } from "@sentzunhat/zacatl";
import { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { ZodError } from "zod";

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

function isCustomError(error: unknown): error is CustomError {
  return error instanceof CustomError;
}

export async function setupServer(server: FastifyInstance): Promise<void> {
  // Register middleware/plugins
  await server.register(cors, { origin: "*" });
  await server.register(helmet, {
    contentSecurityPolicy: false,
    frameguard: { action: "deny" },
  });

  // Global error handler — catches ALL errors
  server.setErrorHandler(async (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
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
        error: "VALIDATION_ERROR",
        message: "Request validation failed",
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
        error: error.code || "ERROR",
        message: error.message,
        statusCode,
        reason: error.reason,
      });
    }

    // Handle FastifyError (validation, serialization, etc.)
    if (error.validation) {
      return reply.code(400).send({
        ok: false,
        error: "VALIDATION_ERROR",
        message: "Request validation failed",
        statusCode: 400,
        details: { issues: error.validation },
      });
    }

    // Fallback: generic error
    const statusCode = error.statusCode || 500;
    return reply.code(statusCode).send({
      ok: false,
      error: "INTERNAL_ERROR",
      message: process.env.NODE_ENV === "production" ? "Something went wrong" : error.message,
      statusCode,
    });
  });
}
```

**Handler Pattern** (handlers just throw):

```typescript
export class UserGetHandler extends GetRouteHandler<User> {
  async handler(request, reply) {
    const userId = request.params.id;

    // Just throw — global error handler will catch
    const user = await this.repository.findOne(userId);
    if (!user) throw new NotFoundError("User not found");

    return user;
  }

  // Optional: customize response shape only
  protected response(user: User) {
    return {
      ok: true,
      data: { id: user.id, name: user.name },
    };
  }

  // No need for handleError() — global handler takes care of it
}
```

**Express Setup** (similar pattern):

```typescript
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

export function setupExpressServer(app: Express): void {
  app.use(cors({ origin: "*" }));
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
        error: error.code || "ERROR",
        message: error.message,
        statusCode,
      });
    }

    // Handle Zod errors
    if (isZodError(error)) {
      return res.status(400).json({
        ok: false,
        error: "VALIDATION_ERROR",
        message: "Request validation failed",
        statusCode: 400,
        details: { issues: error.issues },
      });
    }

    // Fallback
    res.status(500).json({
      ok: false,
      error: "INTERNAL_ERROR",
      message: "Something went wrong",
      statusCode: 500,
    });
  });
}
```

**Execution Flow:**

1. Handler `execute()` calls `handler()` → executes business logic
2. Handler throws error (any error type)
3. Global error handler **catches it**
4. Handler's `response()` method wraps the response (optional)
5. Global handler formats error response based on error type
6. Reply is sent with correct status code

**Key Pattern:**

```typescript
// Handler: just throw
class UserCreateHandler extends PostRouteHandler<User> {
  async handler(request, reply) {
    if (!request.body.email) {
      throw new BadRequestError("Email is required"); // statusCode 400 from CustomError
    }
    const user = await this.repository.create(request.body);
    return user; // Global or handler response() wraps it
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
- **Per-handler customization still possible** — override `response()` if needed, but not necessary

**Timeline**: Ship in v0.0.40

---

### Schema Validation Flexibility (v0.0.40+ / v0.1.0)

🎯 **Flexible Validation: Zod, Yup, or None**

**Goal**: Give users choice and control over request/response validation. Keep Zod as the recommended default, add Yup support for migration paths, and allow opt-out for maximum performance.

**Current State (v0.0.39)**:

- ✅ Zod validation built-in and recommended
- ✅ Strong type safety with TypeScript + Zod schemas
- ✅ Automatic validation errors with helpful messages
- ✅ Works seamlessly with Global Error Handler

**Planned Enhancements**:

**1. Yup Support for Express & Fastify**

Enable Yup as an alternative validation library:

```typescript
// Option A: Zod (default, recommended)
import { z } from "zod";
import { PostRouteHandler } from "@sentzunhat/zacatl";

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
import * as yup from "yup";
import { PostRouteHandler } from "@sentzunhat/zacatl";

const createUserSchema = yup.object({
  name: yup.string().required().min(3),
  email: yup.string().required().email(),
});

class CreateUserHandler extends PostRouteHandler<User, typeof createUserSchema> {
  schema = createUserSchema;
  validationLibrary = "yup"; // explicit opt-in

  async handler(request, reply) {
    // request.body is validated with Yup
    return await this.userService.create(request.body);
  }
}
```

**2. No Schema Validation (Opt-Out)**

For scenarios where validation isn't needed or is handled elsewhere:

```typescript
import { PostRouteHandler } from "@sentzunhat/zacatl";

// Option C: No validation (manual checks or pre-validated data)
class CreateUserHandler extends PostRouteHandler<User, CreateUserInput> {
  // No schema property = no automatic validation

  async handler(request, reply) {
    // Manual validation if needed
    if (!request.body?.email) {
      throw new BadRequestError("Email is required");
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
    library: "zod", // "zod" | "yup" | "none"
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

- **Phase 1** (v0.0.40+): No-validation opt-out, documentation
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

- **v0.0.40+**: Opt-out support and documentation
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
