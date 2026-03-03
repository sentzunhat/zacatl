# Optional Types

Type utilities for values that may or may not be present.

**File:** `src/utils/optionals.ts`

## API

- `Optional<T>` — Represents `T | undefined`
- `Nullable<T>` — Represents `T | null`
- `Maybe<T>` — Represents `T | null | undefined`

## Example

```typescript
import type { Optional, Nullable, Maybe } from '@sentzunhat/zacatl';

// Optional: undefined is allowed
function greet(name?: Optional<string>) {
  console.log(name ?? 'Guest');
}

// Nullable: null is allowed (e.g., form inputs)
const email: Nullable<string> = null;

// Maybe: both null and undefined are allowed
const value: Maybe<number> = undefined;
```
