# Zacatl Framework Overview

Zacatl is a modular TypeScript framework built around layered composition.
`src/` is organized so each module can evolve independently while staying on a
stable public API surface.

## Current Implementation Status

- `ServiceType.SERVER`: implemented and runnable
- `ServiceType.CLI`: contract/stub exists, runtime start and entrypoint registration are not implemented yet
- `ServiceType.DESKTOP`: contract/stub exists, runtime start and entrypoint registration are not implemented yet

## What Exists in `src/`

```text
src/
├── index.ts
├── configuration/
├── dependency-injection/
├── error/
├── logs/
├── localization/
├── service/
│   ├── layers/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   │       ├── orm/{mongoose,nodesqlite,sequelize}/
│   │       └── repositories/{mongoose,nodesqlite,sequelize}/
│   └── platforms/
│       ├── server/
│       ├── cli/
│       ├── desktop/
│       └── context/
├── third-party/
└── utils/
```

## Architectural Patterns in Use

- Layered flow: `application -> domain <- infrastructure`, with `platforms` composing startup/runtime wiring
- Ports-and-adapters style in server and database modules (`port.ts`, `adapters.ts`, concrete adapter files)
- Runtime-safe composition in `Service`: validate config, pre-register database instances, then instantiate layers/platforms
- Barrel exports via `index.ts` files across modules to keep public imports stable

## Naming and File Organization Patterns

- Files/folders use kebab-case (`not-found.ts`, `dependency-injection/`)
- Common suffixes are responsibility-based: `*-adapter.ts`, `*-server.ts`, `*-handler.ts`, `types.ts`, `index.ts`
- Public exports are surfaced from module barrels first; deep imports are available but should be used intentionally
- Platform folders group API/page/database concerns under `src/service/platforms/server/`

## Data and Service Flow (Server)

1. `Service` receives `ConfigService` and validates required shape for the selected `ServiceType`.
2. Localization is configured early.
3. DB instances (when provided for Mongoose/Sequelize) are pre-registered in DI.
4. Layer classes are registered/resolved.
5. Platform entrypoints are registered.
6. Platform start is executed (`service.start(...)`), or auto-start runs when `run.auto` is enabled.

## How to Add New Features Consistently

- Add new domain logic under `src/service/layers/domain/` and keep framework-specific code out of domain modules.
- Add infrastructure implementations under `src/service/layers/infrastructure/` and bind through existing ports/types.
- Add new server-facing behavior under `src/service/layers/application/entry-points/rest/` (or matching entry-point family).
- Export through the closest barrel (`index.ts`) and keep docs aligned with the exported path.

## Known Gaps and Future Improvements

- CLI and Desktop platforms need runnable implementations beyond current contract stubs.
- Some docs still include deep import examples where stable package-level imports are preferred.
- DI docs should continue tightening around currently exported helpers only.

## Module Index

- Configuration: [configuration/README.md](../configuration/README.md)
- Dependency Injection: [dependency-injection/README.md](../dependency-injection/README.md)
- Errors: [error/README.md](../error/README.md)
- Logging: [logs/README.md](../logs/README.md)
- Localization: [localization/README.md](../localization/README.md)
- ORM Adapters: [third-party/orm/README.md](../third-party/orm/README.md)
- Service and Platforms: [service/README.md](../service/README.md)

## Skills and Procedures

- [Version Updates](../skills/version-updates.md) - versioning and release-note workflow
