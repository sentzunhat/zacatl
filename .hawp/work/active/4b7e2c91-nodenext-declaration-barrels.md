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
