# STAB-028 — Service.stop() + graceful shutdown

**Backlog ID:** STAB-028
**Type:** improvement
**Closed:** 2026-07-09

## What was done

Added `Service.stop()` for clean process shutdown: closes the HTTP server and disconnects all databases.

### Changes

- `ApiServerPort` interface: added `close(): Promise<void>`
- `fastify/api-adapter.ts`: `close()` calls `server.close()`
- `express/api-adapter.ts`: captures `http.Server` from `listen()`, `close()` wraps it in a Promise
- `ApiServer`: `close()` delegates to adapter
- `Server`: `stop()` calls `apiServer.close()` then `databaseServer.disconnect()`
- `Platforms`: `stop()` delegates to `Server.stop()`
- `Service`: `stop()` delegates to `Platforms.stop()`
- `MongooseAdapter.disconnect()`: now calls `mongoose.disconnect()` (was a no-op)
- `SequelizeAdapter.disconnect()`: now calls `sequelize.close()` (was a no-op)
- All 8 example `index.ts` files: wire `activeService.stop()` in SIGTERM/SIGINT handlers
- Test mock updated with `close: vi.fn()`
- Changelog updated

## Usage

```typescript
const service = new Service(config);
await service.start({ port: 3000 });

process.on('SIGTERM', () => {
  service.stop().finally(() => process.exit(0));
});
```
