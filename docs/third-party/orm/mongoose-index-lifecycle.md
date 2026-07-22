# Mongoose Index Lifecycle Controls

Zacatl 0.0.58 separates service boot from MongoDB index mutation.

This matters for staging and production databases. Creating a new index on a
large collection can scan many documents, use memory and temporary files, and
impact application performance. `syncIndexes()` is more dangerous because it can
drop indexes that are not declared in the current schema.

## Boot Policy

Configure Mongoose index behavior on the database config:

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl/service';

const isLocalIndexBoot =
  process.env.APP_ENV === 'local' ||
  process.env.APP_ENV === 'development' ||
  process.env.NODE_ENV === 'test';

databases: [
  {
    vendor: DatabaseVendor.MONGOOSE,
    instance: mongoose,
    connection: { url: process.env.MONGO_URI! },
    indexes: {
      bootMode: isLocalIndexBoot ? 'create' : 'off',
    },
  },
];
```

Boot modes:

| Mode     | Behavior                                                                  |
| -------- | ------------------------------------------------------------------------- |
| `off`    | Resolve/register models only. Do not call `createIndexes()` or sync/drop. |
| `create` | Create collections and missing declared indexes. Do not drop indexes.     |
| `sync`   | Run `syncIndexes()`. Dangerous; use only as explicit operator action.     |

If `indexes.bootMode` is omitted, Zacatl uses an environment-aware default:

- `create` for local/development/test
- `off` for staging/production

Set the mode explicitly in services where deployment environments are named
differently.

## Read-Only Diff

Use `MongooseIndexManager` to inspect what Mongoose would create or drop without
mutating the database:

```typescript
import { MongooseIndexManager } from '@sentzunhat/zacatl/service';

const indexManager = new MongooseIndexManager();
const diff = await indexManager.diff();

console.log(JSON.stringify(diff, null, 2));
```

Example output:

```json
[
  {
    "database": "MONGOOSE",
    "modelName": "Session",
    "collectionName": "sessions",
    "mode": "diff",
    "toCreate": [],
    "toDrop": []
  }
]
```

`diff()` uses Mongoose `Model.diffIndexes()` and does not create or drop
indexes.

## Create Missing Indexes

Create-only operations are explicit:

```typescript
const result = await indexManager.createMissing({
  models: ['Session'],
});
```

You can allowlist by model name or collection name:

```typescript
await indexManager.createMissing({
  collections: ['sessions'],
});
```

Create-only calls `createIndexes()` for selected models. It does not drop old
indexes.

## Sync / Drop Guard

`syncIndexes()` may drop indexes. Zacatl refuses to run it unless `force: true`
is passed:

```typescript
await indexManager.syncIndexes({
  force: true,
  models: ['Session'],
});
```

Run `diff()` first and review the `toDrop` list before using sync.

## Operator Strategy For Large Collections

Zacatl can report and invoke Mongoose index operations, but rolling index builds
are an operational MongoDB/Atlas concern.

Recommended production flow:

1. Run the app with `indexes.bootMode: 'off'`.
2. Run an index diff as a separate operator step.
3. Review `toCreate` and `toDrop`.
4. For missing indexes on large collections, use one of:
   - Atlas rolling index build, if available
   - a maintenance window
   - temporary cluster scaling
   - one collection at a time
5. Avoid `syncIndexes()` unless the drop list was reviewed and the operation is
   explicitly approved.

## CLI / Script Wrappers

Zacatl currently exposes library APIs for this flow. Services can wrap them in
their own scripts:

```json
{
  "scripts": {
    "indexes:diff": "tsx scripts/indexes-diff.ts",
    "indexes:create": "tsx scripts/indexes-create.ts",
    "indexes:sync": "tsx scripts/indexes-sync.ts --force"
  }
}
```

Keep `indexes:sync` force-gated and operator-only.
