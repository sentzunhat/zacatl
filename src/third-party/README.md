# third-party

Re-exports for all third-party deps — import from here.

→ Full docs: ../../docs/third-party/README.md

## Exports

tsyringe, zod, uuid, i18n, js-yaml, fastify, express, http-proxy-middleware, reflect-metadata.

Database integrations are subpath-only optional peers:
`databases/mongoose`, `databases/sequelize`, `databases/sqlite3`, and `databases/nodesqlite`.

## Quick use

```typescript
import { z } from '@sentzunhat/zacatl/third-party';
const schema = z.object({ name: z.string() });
```
