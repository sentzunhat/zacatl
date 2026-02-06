---
title: Express REST integration roadmap
description: Plan for Express REST routing and middleware parity in Zacatl
version: 1.0
updated: 2026-02-04
---

# Express REST integration roadmap

**Plan for completing Express REST routing and middleware parity with Fastify in Zacatl.**

## Overview

This document captures the remaining work to ensure Express REST routes and middleware behave identically to the Fastify implementation in Zacatl. It is intended as a pickup-and-implement guide for a future sprint.

## Main Content

### Current State

- Express server vendor is supported by the Service runtime.
- Express adapter exists and can register routes.
- Examples are in progress but need full parity with Fastify behavior.

### Gaps to Confirm

1. **Route registration parity**
   - Confirm `AbstractRouteHandler` metadata maps to Express correctly.
   - Validate method, URL params, query, and body binding.

2. **Middleware / hooks parity**
   - Ensure the same hook pipeline used in Fastify is applied to Express.
   - Confirm ordering: global hooks → route-level hooks → handler.

3. **Error handling**
   - Ensure errors thrown by handlers are formatted consistently.
   - Confirm HTTP status mapping for domain errors.

4. **Request/response typing**
   - Verify Express adapter request/response types align with Zacatl `Request` type.

### Proposed Implementation Plan

1. **Review Express adapter**
   - File: src/service/platforms/server/server/adapters/express-adapter.ts
   - Ensure handler wiring mirrors Fastify adapter behavior.

2. **Hook pipeline**
   - Identify hook application in Fastify adapter and match in Express adapter.
   - Ensure hook execution order is deterministic.

3. **Error pipeline**
   - Standardize error output with existing error utilities.
   - Add tests for common error cases.

4. **Example validation**
   - Run Express examples and verify all 5 REST endpoints.
   - Confirm persistence for SQLite and MongoDB.

### Acceptance Criteria

- Express and Fastify route handling produce identical responses for the same handlers.
- Hooks/middleware behave consistently across both platforms.
- Error responses match the same structure and status codes.
- Examples run without manual wiring beyond Service configuration.

### Suggested Tasks

- Add focused unit tests for the Express adapter.
- Add an integration test that runs the same handler against both Express and Fastify.
- Document Express-specific caveats (if any) in the guides.

## Related

- [Roadmap](roadmap.md)
- [Adapter Pattern](adapter-pattern.md)
- [Dependency Injection Guide](../guides/dependency-injection.md)
- [HTTP Service Scaffold](../guides/http-service-scaffold.md)
