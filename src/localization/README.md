# localization

i18n support with pluggable adapters and locale JSON files.

→ Full docs: ../../docs/localization/README.md

## Exports

configureI18nNode, loadCatalog, resolveBuiltInLocalesDir, mergeCatalogs

## Quick use

```typescript
import { configureI18nNode } from "@sentzunhat/zacatl/localization";
configureI18nNode({ locales: { default: "en", supported: ["en", "es"] } });
```
