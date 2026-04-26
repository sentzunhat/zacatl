# Build and Environment Configuration

**Audience:** Node.js/TypeScript developers
**Status:** Standard level - Required

This guide explains how to build a Node.js application, configure environment variables, and validate configuration at startup.

## Build Modes

### Development (Watch Mode)

```bash
npm run dev
```

- Watches for file changes and rebuilds on save
- Restarts server automatically
- Uses development environment file
- Not optimized for production

**Use case:** Local development iteration
**Standard level:** Required

---

### Production Build

```bash
npm run build
```

**Output:**

- Backend: `dist/backend/` (compiled TypeScript)
- Frontend: `dist/frontend/` (bundled and minified)

- Full optimization and tree-shaking
- Minification enabled
- Production-ready artifacts

**Use case:** Deployment
**Standard level:** Required

---

### Local Production-Like Testing

```bash
npm run build && npm run start:local-prod
```

**Process:**

1. Builds both backend and frontend (production mode)
2. Starts backend with production-like configuration
3. Serves frontend via backend

**Use case:** Verify build artifacts before deploying
**Standard level:** Recommended

---

## Environment Files and Precedence

Environment variables are loaded in priority order (highest to lowest):

1. **`.env.local-prod`** — Local production-like testing
2. **`.env.development`** — Development overrides
3. **`.env.production`** — Production deployment
4. **`.env.template`** — Reference documentation (not loaded)

The first file found in this order is used. Later files do not override earlier ones.

**Standard level:** Required

---

## Environment Variables Reference

### Required Variables (Fatal if Missing)

#### BACKEND_PORT

```bash
BACKEND_PORT=3000
```

- **Type:** Number
- **Purpose:** Port where backend HTTP server listens
- **Example:** `http://localhost:3000/api/v1/...`
- **Standard level:** Required

---

#### DATABASE_URL

```bash
DATABASE_URL="mongodb://localhost:27017/myapp"
```

- **Type:** URL string
- **Purpose:** Database connection string
- **Examples:**
  - Local: `mongodb://localhost:27017/myapp`
  - Cloud: `mongodb+srv://user:pass@cluster.mongodb.net/myapp`
- **Standard level:** Required

---

### Conditional Variables

#### Authentication Service (At Least One Required)

```bash
# Option 1: Full service URL
AUTH_SERVICE_URL="http://localhost:9000"

# OR Option 2: JWKS endpoint only
AUTH_JWKS_URL="http://localhost:9000/.well-known/jwks.json"
```

- **Type:** URL string
- **Required:** At least one must be defined
- **Purpose:** Authentication service connection
- **Standard level:** Required

---

#### Strict Token Validation

```bash
AUTH_STRICT_JWKS="true"   # Default: true
AUTH_ISSUER="https://auth.example.com"  # Required if AUTH_STRICT_JWKS=true
```

- **Purpose:** Enable strict token validation
- **Issuer:** Expected JWT issuer claim value
- **Standard level:** Required (when using strict validation)

---

### Optional Variables

#### NODE_ENV

```bash
NODE_ENV="development"  # or: production, test, staging
```

- **Type:** String
- **Default:** development
- **Purpose:** Environment designation
- **Standard level:** Optional

---

#### Frontend API URL

```bash
VITE_API_URL="http://localhost:3000/api"
```

- **Type:** URL string
- **Default:** undefined
- **Purpose:** API endpoint for frontend (build-time only)
- **Important:** Must be prefixed with `VITE_` to be exposed by Vite
- **Standard level:** Optional

---

## Configuration Validation

The application validates configuration at startup. Fatal errors prevent the server from starting:

**Fatal errors:**

- Neither `AUTH_SERVICE_URL` nor `AUTH_JWKS_URL` is defined
- Strict JWKS enabled but `AUTH_ISSUER` is missing
- Invalid or unreachable `DATABASE_URL`
- `BACKEND_PORT` is not a valid number

**Warnings (logged, app continues):**

- `AUTH_API_KEY` is missing
- Backend port conflicts with existing process

---

## Configuration Scenarios

### Local Development

```bash
# .env.development
BACKEND_PORT=3000
DATABASE_URL="mongodb://localhost:27017/myapp"
AUTH_SERVICE_URL="http://localhost:9000"
AUTH_STRICT_JWKS="false"
NODE_ENV="development"
VITE_API_URL="http://localhost:3000/api"
```

**Run:** `npm run dev`

**Standard level:** Recommended

---

### Production Deployment

```bash
# .env.production (do not commit secrets)
BACKEND_PORT=3000
DATABASE_URL="mongodb+srv://prod-user:prod-pass@cluster.mongodb.net/myapp"
AUTH_SERVICE_URL="https://auth.example.com"
AUTH_ISSUER="https://auth.example.com"
AUTH_STRICT_JWKS="true"
NODE_ENV="production"
VITE_API_URL="https://api.example.com"
```

**Deploy:** Use secrets manager for API keys (GitHub Secrets, Kubernetes, etc.)

**Standard level:** Required

---

### Docker Deployment

```bash
docker run -p 3000:3000 \
  -e BACKEND_PORT=3000 \
  -e DATABASE_URL="mongodb://mongo:27017/myapp" \
  -e AUTH_SERVICE_URL="http://auth:9000" \
  myapp:latest
```

Or via `docker-compose.yml`:

```yaml
services:
  app:
    image: myapp:latest
    environment:
      BACKEND_PORT: 3000
      DATABASE_URL: "mongodb://mongo:27017/myapp"
      AUTH_SERVICE_URL: "http://auth:9000"
```

**Standard level:** Recommended

---

## Environment Variable Summary

| Variable         | Required | Type   | Default     | Notes                    |
| ---------------- | -------- | ------ | ----------- | ------------------------ |
| BACKEND_PORT     | Yes      | Number | 3000        | HTTP server port         |
| DATABASE_URL     | Yes      | String | —           | Database connection      |
| AUTH_SERVICE_URL | Yes\*    | String | —           | \*Or AUTH_JWKS_URL       |
| AUTH_JWKS_URL    | Yes\*    | String | —           | \*Or AUTH_SERVICE_URL    |
| AUTH_STRICT_JWKS | No       | String | "true"      | Token validation         |
| AUTH_ISSUER      | Yes\*\*  | String | —           | \*\*If strict validation |
| NODE_ENV         | No       | String | development | Environment name         |
| VITE_API_URL     | No       | String | undefined   | Frontend API URL         |

---

## Key Principles

1. **Fail fast** — Validate all required variables at startup
2. **Precedence is explicit** — Higher-priority files override lower-priority files
3. **Secrets are never committed** — Production secrets come from CI/CD or secrets manager
4. **Frontend variables are build-time** — Set `VITE_` variables before build
5. **Configs differ by environment** — Use separate env files for different targets

**Standard level:** Required
