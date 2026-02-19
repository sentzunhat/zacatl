# service

Main orchestration: application, domain, infrastructure, platforms.

→ Full docs: ../../docs/service/README.md

## Exports

Service, Layers, Platforms, ServiceType, DatabaseVendor, ServerVendor, ServerType

## Quick use

```typescript
import { Service } from "@sentzunhat/zacatl/service";
const svc = new Service(config);
await svc.start();
```
