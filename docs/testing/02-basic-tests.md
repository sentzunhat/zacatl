# Basic Tests

Write your first unit tests with Vitest.

## Simple Unit Test

Create `test/unit/services/user-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { UserService } from "../../../src/service/domain/services/user-service";

describe("UserService", () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it("should initialize properly", () => {
    expect(userService).toBeDefined();
  });

  it("should validate user email", () => {
    const isValid = userService.isValidEmail("user@example.com");
    expect(isValid).toBe(true);
  });

  it("should reject invalid email", () => {
    const isValid = userService.isValidEmail("invalid-email");
    expect(isValid).toBe(false);
  });
});
```

## Test Structure

```typescript
describe("Component or Feature Name", () => {
  // Setup runs before each test
  beforeEach(() => {
    // Initialize test state
  });

  // Cleanup runs after each test
  afterEach(() => {
    // Clean up resources
  });

  it("should describe what it tests", () => {
    // Arrange: Set up test data
    const input = "test@example.com";

    // Act: Call the method
    const result = service.validateEmail(input);

    // Assert: Verify the result
    expect(result).toBe(true);
  });
});
```

## Common Assertions

```typescript
// Equality
expect(value).toBe(5); // Strict equality (===)
expect(obj).toEqual({ id: 1, name: "A" }); // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(10);
expect(value).toBeCloseTo(0.3); // Floating point

// Strings
expect(str).toMatch(/pattern/);
expect(str).toContain("substring");

// Arrays
expect(arr).toHaveLength(3);
expect(arr).toContain(item);
expect(arr).toContainEqual({ id: 1 });

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(Error);
expect(() => fn()).toThrow("message");
```

## Test Lifecycle Hooks

```typescript
describe("Test Suite", () => {
  beforeAll(() => {
    // Run once before all tests in this suite
    // Good for expensive setup (database connection, etc.)
  });

  afterAll(() => {
    // Run once after all tests complete
    // Good for cleanup (close connections, etc.)
  });

  beforeEach(() => {
    // Run before each test
    // Good for resetting state
  });

  afterEach(() => {
    // Run after each test
    // Good for cleanup between tests
  });

  it("test 1", () => {
    // Test code
  });

  it("test 2", () => {
    // Test code
  });
});
```

## Grouping Tests

```typescript
describe("UserService", () => {
  describe("Email Validation", () => {
    it("should accept valid emails", () => {
      // Test code
    });

    it("should reject invalid emails", () => {
      // Test code
    });
  });

  describe("User Creation", () => {
    it("should create a user", () => {
      // Test code
    });

    it("should hash password", () => {
      // Test code
    });
  });
});
```

## Skipping Tests

```typescript
// Skip a single test
it.skip("not ready yet", () => {
  // Won't run
});

// Skip a suite
describe.skip("Feature not ready", () => {
  // None of these will run
});

// Run only specific tests (for debugging)
it.only("debug this test", () => {
  // Only this test will run
});
```

## Running Tests

```bash
npm test                              # Run all tests
npm run test:watch                   # Watch mode (re-run on change)
npm test -- test/unit/services       # Run specific directory
npm test -- --grep "UserService"     # Run tests matching pattern
```

---

**Next**: [Mocking →](./03-mocking.md)
