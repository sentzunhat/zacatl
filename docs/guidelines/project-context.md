# Project Context

Comprehensive reference for the zacatl repository structure, conventions, tech stack, and file inventory.

## stack

- Languages: TypeScript (ESM), JavaScript/MJS (tooling), Markdown, YAML, JSON.
- Runtime/build: Node.js 24+, npm, TypeScript compiler, tsc-alias, fix-esm.mjs.
- Frameworks/libs: Fastify + Express adapters, tsyringe (DI), Zod, Sequelize, Mongoose, Pino, i18n, UUID, js-yaml.
- Testing/linting: Vitest, ESLint (flat config).
- Architecture: layered/hexagonal with ports/adapters, DI container, repositories, REST handlers.

## conventions

- Naming: PascalCase for classes/interfaces/types/enums; camelCase for functions/variables; UPPER_SNAKE_CASE for constants; kebab-case for files/folders; enum values UPPER_SNAKE_CASE.
- Patterns: port-adapter naming (Adapter/Port/Repository/Service), DI with decorators, repository pattern for ORM integration.
- Module style: ESM only; barrel exports via index.ts; path aliases resolved at build.

## doc_style

- JSDoc required for public APIs; examples embedded in docs; comments explain intent.
- Changelog uses Keep a Changelog format with emoji section headers and version/date line.
- Templates: Quick Start and minimal templates in service docs; AI agent prompt template in HTTP scaffold guide.
- README mostly links to module docs and examples (no extra doc formatting rules beyond guideline docs).

## gaps_and_complexity

- Most complex: service layer REST entry-points (fastify/express handlers), server platform adapters, ORM adapters, DI container.
- Lighter coverage: CLI/desktop platform internals, build tooling scripts, and ESLint config internals (documented but less walkthrough-style).

## quirks

- ESM-only output; no bundler; build pipeline relies on tsc + tsc-alias + fix-esm.mjs.
- Dependency re-exports under @sentzunhat/zacatl/third-party/\* subpaths.

## files_src

- src/index.ts
- src/optionals.ts
- src/configuration/index.ts
- src/configuration/json.ts
- src/configuration/yml.ts
- src/dependency-injection/container.ts
- src/dependency-injection/index.ts
- src/error/bad-request.ts
- src/error/bad-resource.ts
- src/error/custom.ts
- src/error/forbidden.ts
- src/error/index.ts
- src/error/internal-server.ts
- src/error/not-found.ts
- src/error/unauthorized.ts
- src/error/validation.ts
- src/eslint/README.md
- src/eslint/base.mjs
- src/eslint/file-naming.mjs
- src/eslint/imports.mjs
- src/eslint/index.mjs
- src/eslint/naming-conventions.mjs
- src/localization/i18n-node.ts
- src/localization/index.ts
- src/localization/locales/en.json
- src/localization/locales/es.json
- src/localization/node/core.ts
- src/localization/node/helpers.ts
- src/localization/node/types.ts
- src/logs/adapters/console.ts
- src/logs/adapters/pino.ts
- src/logs/config.ts
- src/logs/index.ts
- src/logs/logger.ts
- src/logs/types.ts
- src/service/index.ts
- src/service/service.ts
- src/service/layers/application/application.ts
- src/service/layers/application/entry-points/index.ts
- src/service/layers/application/entry-points/rest/common/handler.ts
- src/service/layers/application/entry-points/rest/common/http-methods.ts
- src/service/layers/application/entry-points/rest/common/index.ts
- src/service/layers/application/entry-points/rest/common/request.ts
- src/service/layers/application/entry-points/rest/express/index.ts
- src/service/layers/application/entry-points/rest/express/handlers/abstract.ts
- src/service/layers/application/entry-points/rest/express/handlers/delete-route-handler.ts
- src/service/layers/application/entry-points/rest/express/handlers/get-route-handler.ts
- src/service/layers/application/entry-points/rest/express/handlers/index.ts
- src/service/layers/application/entry-points/rest/express/handlers/patch-route-handler.ts
- src/service/layers/application/entry-points/rest/express/handlers/post-route-handler.ts
- src/service/layers/application/entry-points/rest/express/handlers/put-route-handler.ts
- src/service/layers/application/entry-points/rest/fastify/index.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/abstract.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/delete-route-handler.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/generics.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/get-route-handler.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/index.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/patch-route-handler.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/put-route-handler.ts
- src/service/layers/application/entry-points/rest/fastify/handlers/route-handler.ts
- src/service/layers/application/entry-points/rest/hook-handlers/hook-handler.ts
- src/service/layers/application/entry-points/rest/hook-handlers/index.ts
- src/service/layers/application/entry-points/rest/index.ts
- src/service/layers/application/index.ts
- src/service/layers/application/types/index.ts
- src/service/layers/domain/domain.ts
- src/service/layers/domain/index.ts
- src/service/layers/domain/ports/domain.ts
- src/service/layers/domain/ports/index.ts
- src/service/layers/domain/ports/provider.ts
- src/service/layers/domain/ports/service.ts
- src/service/layers/domain/types/index.ts
- src/service/layers/index.ts
- src/service/layers/infrastructure/index.ts
- src/service/layers/infrastructure/infrastructure.ts
- src/service/layers/infrastructure/orm/adapter-loader.ts
- src/service/layers/infrastructure/orm/index.ts
- src/service/layers/infrastructure/orm/mongoose-adapter.ts
- src/service/layers/infrastructure/orm/sequelize-adapter.ts
- src/service/layers/infrastructure/repositories/abstract.ts
- src/service/layers/infrastructure/repositories/index.ts
- src/service/layers/infrastructure/repositories/mongoose/index.ts
- src/service/layers/infrastructure/repositories/mongoose/repository.ts
- src/service/layers/infrastructure/repositories/mongoose/types.ts
- src/service/layers/infrastructure/repositories/sequelize/index.ts
- src/service/layers/infrastructure/repositories/sequelize/repository.ts
- src/service/layers/infrastructure/repositories/sequelize/types.ts
- src/service/layers/infrastructure/repositories/types.ts
- src/service/layers/infrastructure/types/index.ts
- src/service/layers/layers.ts
- src/service/layers/types/index.ts
- src/service/platforms/cli/cli.ts
- src/service/platforms/cli/index.ts
- src/service/platforms/cli/types.ts
- src/service/platforms/desktop/desktop.ts
- src/service/platforms/desktop/index.ts
- src/service/platforms/desktop/types.ts
- src/service/platforms/index.ts
- src/service/platforms/platforms.ts
- src/service/platforms/server/api/adapters.ts
- src/service/platforms/server/api/api-server.ts
- src/service/platforms/server/api/index.ts
- src/service/platforms/server/api/port.ts
- src/service/platforms/server/database/adapters.ts
- src/service/platforms/server/database/database-server.ts
- src/service/platforms/server/database/index.ts
- src/service/platforms/server/database/port.ts
- src/service/platforms/server/index.ts
- src/service/platforms/server/page/adapters.ts
- src/service/platforms/server/page/index.ts
- src/service/platforms/server/page/page-server.ts
- src/service/platforms/server/page/port.ts
- src/service/platforms/server/server.ts
- src/service/platforms/server/types/index.ts
- src/service/platforms/server/types/server-config.ts
- src/service/platforms/types/index.ts
- src/service/types/index.ts
- src/third-party/eslint.ts
- src/third-party/express.ts
- src/third-party/fastify.ts
- src/third-party/http-proxy-middleware.ts
- src/third-party/i18n.ts
- src/third-party/index.ts
- src/third-party/js-yaml.ts
- src/third-party/mongoose.ts
- src/third-party/pino.ts
- src/third-party/reflect-metadata.ts
- src/third-party/sequelize.ts
- src/third-party/tsyringe.ts
- src/third-party/uuid.ts
- src/third-party/zod.ts
- src/utils/encode-decode.ts
- src/utils/error-guards.ts
- src/utils/hmac.ts
- src/utils/index.ts

## files_docs

- docs/guidelines/framework-overview.md
- docs/changelog.md
- docs/configuration/README.md
- docs/configuration/api.md
- docs/configuration/context.md
- docs/configuration/guidelines.yaml
- docs/configuration/mongodb.yaml
- docs/configuration/patterns.yaml
- docs/dependency-injection/README.md
- docs/dependency-injection/patterns.md
- docs/error/README.md
- docs/eslint/README.md
- docs/eslint/naming-conventions-guide.md
- docs/guidelines/QUICK_REFERENCE.md
- docs/guidelines/README.md
- docs/guidelines/architecture.md
- docs/guidelines/code-style.md
- docs/guidelines/documentation.md
- docs/guidelines/git-workflow.md
- docs/guidelines/project-context.md
- docs/guidelines/testing.md
- docs/localization/README.md
- docs/localization/api.md
- docs/logs/README.md
- docs/roadmap/qa-testing-guide.md
- docs/roadmap/index.md
- docs/service/README.md
- docs/service/agent-implementation-guide.md
- docs/service/api-overview.md
- docs/service/api.md
- docs/service/dependency-exports.md
- docs/service/express.md
- docs/service/handler-bookshelf-pattern.md
- docs/service/handler-registration.md
- docs/service/http-service-scaffold.md
- docs/service/infrastructure-usage.md
- docs/service/layer-registration.md
- docs/service/non-http-elegant.md
- docs/service/non-http-setup.md
- docs/service/repository.md
- docs/service/rest-handlers.md
- docs/service/service-adapter-pattern.md
- docs/skills/version-updates.md
- docs/roadmap/testing-roadmap.md
- docs/third-party/README.md
- docs/third-party/dependencies-reference.md
- docs/third-party/imports.md
- docs/third-party/orm/README.md
- docs/third-party/orm/architecture.md
- docs/third-party/orm/database-setup.md
- docs/third-party/orm/multi-orm-setup.md
- docs/third-party/orm/orm-import-strategies.md
- docs/third-party/orm/orm-lazy-loading.md
- docs/third-party/orm/overview.md
- docs/third-party/orm/working-with-databases.md
- docs/third-party/single-import.md
- docs/utils/README.md
- docs/utils/path-aliases.md

## updates

- Added concise JSDoc for CLI, Desktop, and Server platform stubs.
- Shortened ESLint config module docs to match the required doc format.
