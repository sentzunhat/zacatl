# utils

Encode/decode, HMAC, error type guards.

→ Full docs: ../../docs/utils/README.md

## Exports

encode, decode, generateHmac, isError, isZodError, isCustomError

## Quick use

```typescript
import { encode, generateHmac, isError } from '@sentzunhat/zacatl/utils';
const b64 = encode({ input: 'hello', encoding: { output: 'base64' } });
const sig = generateHmac({ message: 'data', secretKey: 'key' });
```
