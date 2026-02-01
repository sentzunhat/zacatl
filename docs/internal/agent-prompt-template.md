# Agent Prompt Template for Zacatl Integration

Copy and paste this prompt to another AI agent when you want to integrate Zacatl framework into a project. Fill in the placeholders marked with `[...]`.

---

## Prompt Template

```
I need you to integrate the Zacatl microservice framework into this project. Zacatl is a modular TypeScript framework with layered architecture (Application/Domain/Infrastructure/Platform), dependency injection via tsyringe, structured logging via pino, and built-in adapters.

**Framework Reference:**
Read the integration spec at: https://github.com/sentzunhat/zacatl/blob/main/docs/AGENT_INTEGRATION_SPEC.md

**Project Requirements:**
- HTTP Server: [Express OR Fastify]
- Database: [MongoDB with Mongoose OR SQL with Sequelize OR None]
- Port: [3000 or specify]
- Service Name: [your-service-name]

**What to implement:**

1. **Install Zacatl**
   - Add @sentzunhat/zacatl as dependency
   - Ensure Node.js >= 22 and TypeScript 5.9+
   - Install tsyringe and reflect-metadata

2. **Configuration Setup**
   - Create config/ directory with default.json, production.json, test.json
   - Required config keys: SERVICE_NAME, NODE_ENV, APP_VERSION, APP_ENV, CONNECTION_STRING, LOG_LEVEL
   - Create .env.example documenting all environment variables

3. **Project Structure**
   - Create src/architecture/ with Application/Domain/Infrastructure/Platform layers
   - Application: Use cases/handlers
   - Domain: Entities, value objects, domain services
   - Infrastructure: Repositories, database adapters
   - Platform: HTTP routes, controllers, server adapter

4. **Main Service Class**
   - Create main microservice class extending AbstractArchitecture
   - Implement start() method to:
     - Register all dependencies using this.registerDependencies()
     - Initialize database connection
     - Set up HTTP server adapter ([Express OR Fastify])
     - Register routes and middleware
     - Start listening on configured port

5. **Routes to implement:**
   [List your routes here, e.g.:
   - POST /api/users - Create user (validate with zod)
   - GET /api/users/:id - Get user by ID
   - PUT /api/users/:id - Update user
   - DELETE /api/users/:id - Delete user
   - GET /health - Health check endpoint
   ]

6. **Entities and Repositories:**
   [List your domain entities, e.g.:
   - User entity with fields: id, email, name, createdAt, updatedAt
   - UserRepository interface with CRUD methods
   - Implement repository using [Mongoose OR Sequelize] base class from Zacatl
   ]

7. **Error Handling**
   - Use CustomError and specialized errors (ValidationError, NotFoundError, etc.) from Zacatl
   - Implement error mapping middleware to convert errors to HTTP responses
   - Add proper error logging with logger.error()

8. **Logging**
   - Replace all console.log with logger.info/warn/error from Zacatl
   - Include structured data: logger.info("Message", { data, details })

9. **Validation**
   - Use zod schemas for request/response validation
   - Throw ValidationError on schema failures
   - [If Fastify: Use fastify-type-provider-zod for typed routes]

10. **Testing**
    - Set up vitest with proper test configuration
    - Create unit tests for repositories, handlers, and services
    - Create integration tests for HTTP endpoints
    - Use in-memory database for tests

**Implementation priorities:**
1. Basic structure and DI setup
2. Database connection and repositories
3. HTTP server and routes
4. Error handling and validation
5. Tests and documentation

**Additional features to include:**
- Health and readiness endpoints (/health, /ready)
- Graceful shutdown handling
- Request correlation IDs in logs
- [Add any other specific requirements]

Please implement this step-by-step, run tests after each major component, and ensure the service is production-ready.
```

---

## Quick Start Prompt (Minimal)

If you want a faster, minimal integration, use this shorter version:

```
Integrate @sentzunhat/zacatl microservice framework into this project.

Reference: https://github.com/sentzunhat/zacatl/blob/main/docs/AGENT_INTEGRATION_SPEC.md

Setup:
- HTTP: [Express/Fastify], Port: [3000]
- DB: [MongoDB/SQL/None]
- Service: [your-service-name]

Implement:
1. Install zacatl + tsyringe + reflect-metadata
2. Create config/ with default.json (SERVICE_NAME, NODE_ENV, APP_VERSION, CONNECTION_STRING, LOG_LEVEL)
3. Create layered architecture: Application/Domain/Infrastructure/Platform
4. Main service extending AbstractArchitecture with start() method
5. Routes: [list your endpoints]
6. Error handling using CustomError types
7. Logging with logger from zacatl (replace console.*)
8. Tests with vitest

Make it production-ready with health checks and graceful shutdown.
```

---

## Example with Specific Project

Here's a filled example for a User Management API:

```
Integrate @sentzunhat/zacatl microservice framework into this User Management API.

Reference: https://github.com/sentzunhat/zacatl/blob/main/docs/AGENT_INTEGRATION_SPEC.md

**Setup:**
- HTTP: Fastify with zod validation
- Database: MongoDB with Mongoose
- Port: 3000
- Service Name: user-management-service

**Routes:**
- POST /api/v1/users - Create user (body: email, name, password)
- GET /api/v1/users/:id - Get user
- GET /api/v1/users - List users (query: page, limit)
- PUT /api/v1/users/:id - Update user
- DELETE /api/v1/users/:id - Delete user
- GET /health - Health check
- GET /ready - Readiness check

**Entities:**
- User: id (UUID), email (unique), name, passwordHash, createdAt, updatedAt
- UserRepository with CRUD + findByEmail method

**Implementation:**
1. Install @sentzunhat/zacatl, tsyringe, reflect-metadata
2. Create config/ with MongoDB connection string
3. Architecture layers:
   - Application: CreateUserHandler, GetUserHandler, UpdateUserHandler, DeleteUserHandler
   - Domain: User entity, UserRepository interface
   - Infrastructure: MongooseUserRepository extending base repository
   - Platform: FastifyAdapter, user routes with zod schemas
4. Main UserManagementService extending AbstractArchitecture
5. Use ValidationError for schema failures, NotFoundError for missing users
6. Hash passwords with bcrypt, validate email format
7. Full test suite with mongodb-memory-server
8. Correlation IDs in all logs

Make it production-ready with proper error handling, graceful shutdown, and >80% test coverage.
```

---

## Tips for Best Results

1. **Be specific about your stack:** Clearly state Express vs Fastify, MongoDB vs SQL
2. **List all routes and entities:** The more detail you provide, the better the implementation
3. **Include validation rules:** Mention required fields, formats, constraints
4. **Specify auth requirements:** If you need JWT, API keys, etc., mention it
5. **Mention external services:** If integrating with other APIs, list them
6. **Test coverage goals:** State your coverage target (e.g., >80%)

## Follow-up Prompts

After initial implementation, you can ask:

- "Add OpenTelemetry tracing to all HTTP requests and database queries"
- "Implement rate limiting middleware using Redis"
- "Add Prometheus metrics for request count, duration, and error rates"
- "Create a CLI tool to seed the database with test data"
- "Add WebSocket support for real-time notifications"
- "Implement pagination, filtering, and sorting for list endpoints"
- "Add comprehensive API documentation with OpenAPI/Swagger"
