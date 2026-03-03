# error

Typed HTTP error classes extending CustomError.

→ Full docs: ../../docs/error/README.md

## Exports

BadRequestError, BadResourceError, CustomError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError, ValidationError

## Quick use

```typescript
import { NotFoundError } from '@sentzunhat/zacatl/error';
throw new NotFoundError('User not found');
```
