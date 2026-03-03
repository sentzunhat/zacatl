# dependency-injection

DI container wiring via tsyringe.

→ Full docs: ../../docs/dependency-injection/README.md

## Exports

getContainer, registerDependency, registerSingleton, registerValue, resolveDependency, clearContainer, resolveDependencies, registerDependencies, registerAndResolve

## Quick use

```typescript
import { registerDependency, resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
registerDependency('MyService', { useClass: MyService });
const svc = resolveDependency<MyService>('MyService');
```
