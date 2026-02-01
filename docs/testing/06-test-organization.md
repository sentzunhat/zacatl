# Test Organization

Structure your test files for maintainability.

## Directory Structure

```
test/
├── unit/                      # Unit tests
│   ├── services/              # Service layer tests
│   ├── handlers/              # HTTP handler tests
│   └── repositories/          # Repository tests
├── integration/               # Integration tests
└── fixtures/                  # Shared test data
    ├── mocks/                 # Mock implementations
    └── data/                  # Sample data
```

## Naming Convention

Match test files to source files:

```
src/service/domain/services/user-service.ts
→ test/unit/services/user-service.test.ts

src/service/application/handlers/user-handler.ts
→ test/unit/handlers/user-handler.test.ts
```

## Group Related Tests

```typescript
describe("UserService", () => {
  describe("Email Validation", () => {
    it("should accept valid emails", () => {});
    it("should reject invalid emails", () => {});
  });

  describe("User Creation", () => {
    it("should create user with valid data", () => {});
    it("should hash password", () => {});
  });
});
```

---

**Next**: [Fixtures →](./07-fixtures.md)
