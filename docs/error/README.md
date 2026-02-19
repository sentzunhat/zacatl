# Error Handling API

Type-safe error classes with correlation IDs.

## Import

```typescript
import { CustomError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ValidationError, InternalServerError, BadResourceError } from "@sentzunhat/zacatl";
```

## Error Classes

### NotFoundError (404)

```typescript
throw new NotFoundError({ message: "User not found" });
throw new NotFoundError({ message: "Product not found", metadata: { productId: "123" } });
```

### BadRequestError (400)

```typescript
throw new BadRequestError({ message: "Invalid request body" });
```

### ValidationError (400)

```typescript
throw new ValidationError({ message: "Email is required", metadata: { field: "email" } });
```

### UnauthorizedError (401)

```typescript
throw new UnauthorizedError({ message: "Invalid token" });
```

### ForbiddenError (403)

```typescript
throw new ForbiddenError({ message: "Access denied" });
```

### InternalServerError (500)

```typescript
throw new InternalServerError({ message: "Database connection failed" });
```

### BadResourceError (422)

```typescript
throw new BadResourceError({ message: "Cannot process resource" });
```

## Error Properties

```typescript
const error = new NotFoundError({ message: "User not found", metadata: { userId: 123 } });

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

**Next**: [Configuration →](../configuration/README.md)
