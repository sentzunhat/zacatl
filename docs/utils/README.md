# Utils

Shared utility helpers that are independent of services and platform wiring.

## Included Helpers

- **[optionals](optionals.md)** - Type utilities for optional, nullable, and maybe values
- encode-decode (base64 and string helpers)
- error-guards (type guards for errors)
- hmac (HMAC helpers)

## Optional Types

Utilities for handling values that may or may not be present.

```typescript
import { Optional, Nullable, Maybe } from '@sentzunhat/zacatl';

// Optional<T> = T | undefined (regular JS optional)
const opt: Optional<string> = undefined;

// Nullable<T> = T | null (explicitly null)
const nul: Nullable<string> = null;

// Maybe<T> = T | null | undefined (both cases)
const maybe: Maybe<string> = null;
```

- `Optional<T>`: Use for standard JS optional parameters and properties
- `Nullable<T>`: Use when `null` has semantic meaning (form fields, DB nullable columns)
- `Maybe<T>`: Use when both `null` and `undefined` are valid (API responses, merged data)

## Related

- Path aliases: see [path-aliases.md](path-aliases.md)
