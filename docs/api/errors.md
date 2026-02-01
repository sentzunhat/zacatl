# Error Handling API

Type-safe error classes with correlation IDs.

## Import

```typescript
import {
  CustomError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  InternalServerError,
  BadResourceError,
} from "@sentzunhat/zacatl";
```

## Error Classes

### NotFoundError (404)

```typescript
throw new NotFoundError("User not found");
throw new NotFoundError("Product not found", { productId: "123" });
```

### BadRequestError (400)

```typescript
throw new BadRequestError("Invalid request body");
```

### ValidationError (400)

```typescript
throw new ValidationError("Email is required", { field: "email" });
```

### UnauthorizedError (401)

```typescript
throw new UnauthorizedError("Invalid token");
```

### ForbiddenError (403)

```typescript
throw new ForbiddenError("Access denied");
```

### InternalServerError (500)

```typescript
throw new InternalServerError("Database connection failed");
```

### BadResourceError (422)

```typescript
throw new BadResourceError("Cannot process resource");
```

## Error Properties

```typescript
const error = new NotFoundError("User not found", { userId: 123 });

error.message; // "User not found"
error.statusCode; // 404
error.metadata; // { userId: 123 }
error.correlationId; // "uuid-v4"
```

## Custom Error

```typescript
import { CustomError } from "@sentzunhat/zacatl";

class PaymentError extends CustomError {
  constructor(message: string, metadata?: Record<string, any>) {
    super(message, 402, metadata);
    this.name = "PaymentError";
  }
}
```

---

**Next**: [Configuration →](./configuration.md)
