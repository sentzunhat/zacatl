# Security Guide

Security requirements and patterns for all TypeScript/Node.js projects.

> **Related:** [code-style.md § Type Safety](code-style.md#type-safety) — `unknown` typing and Zod at boundaries. [architecture.md § Configuration & Environment](architecture.md#configuration--environment) — startup secret validation pattern.

These rules are **non-negotiable**. They cannot be relaxed by professional judgment the way style or naming preferences can.

## Table of Contents

1. [Input Validation](#input-validation)
2. [Authentication & Secrets](#authentication--secrets)
3. [HTTP Headers & Transport](#http-headers--transport)
4. [Logging & Observability](#logging--observability)
5. [Dependency Hygiene](#dependency-hygiene)
6. [Error Handling](#error-handling)

---

## Input Validation

Validate **at every system boundary** — HTTP requests, queue messages, CLI arguments, config files, and environment variables. Internal domain logic assumes trusted, already-validated input.

**Use Zod for schema validation:**

```typescript
// ✅ Good — validate at the HTTP boundary, not inside the service
const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).default("user"),
});

const handler = async (req: Request, res: Response) => {
  const body = createUserSchema.parse(req.body); // throws ZodError on invalid input
  await userService.create(body);
};

// ❌ Avoid — trusting raw request data inside the service
const handler = async (req: Request, res: Response) => {
  await userService.create(req.body as CreateUserInput);
};
```

**Rules:**

- Use `unknown` for all untrusted input; never cast directly to a typed interface.
- Never trust `req.body`, `req.params`, `req.query`, or `req.headers` without parsing.
- Reject malformed input with a `400 Bad Request` before it reaches domain logic.
- For environment variables, validate at startup using a config schema (see [architecture.md §7](architecture.md)).

---

## Authentication & Secrets

**Secrets management:**

- Never hardcode secrets, tokens, or keys in source code.
- Never commit `.env` files or secrets to version control.
- Load secrets exclusively from environment variables validated at startup.
- Use distinct secrets per environment (development, staging, production).

```typescript
// ✅ Good — validated at startup, typed config object used throughout
const envSchema = z.object({
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);

// ❌ Avoid — hardcoded or inline fallback
const secret = process.env.JWT_SECRET || "my-secret-key";
```

**Token & session rules:**

- Tokens must have a defined expiry (`exp` claim for JWT).
- Rotate refresh tokens on use (refresh token rotation).
- Store session tokens in `HttpOnly`, `Secure`, `SameSite=Strict` cookies when browser-facing.
- Never log tokens, passwords, or sensitive PII — see [Logging & Observability](#logging--observability).

**Password handling:**

- Hash passwords with `bcrypt` or `argon2` (minimum cost factor 12 for bcrypt).
- Apply a consistent application-level pepper before hashing.
- Never store or compare plaintext passwords anywhere.

---

## HTTP Headers & Transport

Use a security header middleware (e.g., `helmet` for Express/Fastify) with at minimum:

| Header                      | Recommended Value                           |
| --------------------------- | ------------------------------------------- |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`       |
| `X-Content-Type-Options`    | `nosniff`                                   |
| `X-Frame-Options`           | `DENY`                                      |
| `Content-Security-Policy`   | Project-specific; restrict to known origins |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`           |

**Additional rules:**

- Always enforce HTTPS in production; reject plain HTTP connections.
- Set CORS origins explicitly — never use `Access-Control-Allow-Origin: *` in production.
- Validate `Content-Type` on all endpoints that accept a request body.
- Implement rate limiting on authentication and sensitive endpoints.

---

## Logging & Observability

**Never log sensitive data:**

- Passwords, hashes, tokens, API keys, or secrets.
- Full credit card numbers, SSNs, or government IDs.
- PII beyond what is operationally required (prefer user ID over email in logs).

```typescript
// ✅ Good — log identifier only
logger.info("User login attempt", { userId: user.id, ip: req.ip });

// ❌ Avoid — logs PII and token
logger.info("User login", { email: user.email, token: session.token });
```

**Error logging:**

- Log the full error stack server-side for debugging.
- Return a **generic error message** to clients — never expose stack traces, database errors, or internal paths in HTTP responses.

```typescript
// ✅ Good — generic client response, detailed server log
catch (err) {
  logger.error("Unhandled error in createUser", err);
  res.status(500).json({ message: "Internal server error" });
}

// ❌ Avoid — exposes internals
catch (err) {
  res.status(500).json({ message: err.message, stack: err.stack });
}
```

---

## Dependency Hygiene

- Run `npm audit` in CI and fail on high/critical severity vulnerabilities.
- Pin direct dependencies to exact or narrow ranges; do not use `*` or bare `^` in `dependencies`.
- Regularly update dependencies — at minimum, review `npm outdated` each sprint.
- Remove unused dependencies; they are attack surface.
- Vet new dependencies before adding: check download count, maintenance status, license, and CVE history.

```jsonc
// ✅ Good — exact version for production dependency
{
  "dependencies": {
    "zod": "3.24.4"
  }
}

// ❌ Avoid — unconstrained minor/patch updates
{
  "dependencies": {
    "zod": "*"
  }
}
```

---

## Error Handling

- Use a custom error hierarchy (e.g., `AppError → BadRequestError | UnauthorizedError | ForbiddenError | NotFoundError | InternalServerError`) so error codes and HTTP status codes stay consistent.
- Catch errors at the HTTP boundary; let domain logic throw typed errors.
- Never swallow errors silently — log and re-throw or convert to a typed error.
- Use `unknown` for caught errors in TypeScript; narrow with `instanceof` before accessing properties.

```typescript
// ✅ Good — type-safe error narrowing
try {
  await service.create(input);
} catch (err: unknown) {
  if (err instanceof BadRequestError) {
    return res.status(400).json({ message: err.message, code: err.code });
  }
  logger.error("Unexpected error", err);
  return res.status(500).json({ message: "Internal server error" });
}

// ❌ Avoid — untyped catch and implicit any
try {
  await service.create(input);
} catch (err) {
  return res.status(500).json({ message: err.message });
}
```

**Standard level:** Required — all rules in this document are mandatory.
