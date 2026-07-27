# 4b7e2c91 — NodeNext declaration-barrel compatibility

input: |
A fresh packed Zacatl consumer can import @sentzunhat/zacatl/service at runtime, but a tiny TypeScript 6 consumer using moduleResolution: NodeNext reports that @sentzunhat/zacatl/service has no exported member Service.

context: |
Zacatl's generated ESM declaration barrels currently use extensionless relative re-exports such as export * from './service'. Runtime ESM import works, and TypeScript Bundler resolution compiles, but NodeNext declaration resolution does not see the re-exported Service symbol through the package subpath.

mission: |
Make published declaration barrels compatible with TypeScript NodeNext consumers without changing runtime import behavior.

constraints: |
Keep this separate from the Sequelize optional-peer audit-chain fix. Preserve the existing package subpath contract. Verify against a packed throwaway consumer, not only the repo-local file: link.

output: |
Updated declaration generation or barrel source, plus packed-consumer TypeScript proof for moduleResolution: NodeNext and Bundler.

## Result

Updated `scripts/build/fix-esm.ts` so the existing ESM fix step also processes
generated `.d.ts` files, not only `.js` files.

The fix:

- keeps Zacatl source imports unchanged
- keeps consumer package imports unchanged
- rewrites generated declaration relative imports/exports to runtime `.js`
  specifiers, matching the generated ESM JavaScript
- supports `import type`, `export type`, barrel re-exports, side-effect imports,
  and dynamic imports in generated output

Example generated declaration change:

```typescript
// before
export * from './service';

// after
export * from './service.js';
```

Consumers still import the package subpath normally:

```typescript
import { Service, ServiceType, DatabaseVendor } from '@sentzunhat/zacatl/service';
```

## Direct Verification

Run under Node 26.3.0:

- `npm run type:check:scripts` passed.
- `npm run build` passed.
- Build output showed `fix-esm` fixed ESM imports in 183 source build files.
- Inspected generated declarations:
  - `build-src-esm/service/index.d.ts` now has `export * from './service.js';`
  - `build-src-esm/service/service.d.ts` now uses `.js` specifiers for local
    imports/exports.
- `npm run prepare-publish` passed and wrote `publish/package.json`.
- `npm run smoke:consumers` passed with the consumer fixture matrix using
  TypeScript `module: "NodeNext"` and `moduleResolution: "NodeNext"`.
