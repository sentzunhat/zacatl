# Testing Best Practices

Guidelines for writing effective tests.

## ✅ Do

- **Test behaviors, not implementation** - Focus on what, not how
- **Mock external dependencies** - Database, APIs, filesystem
- **Use fixtures** - Reusable test data
- **Test error cases** - Don't just test happy paths
- **Keep tests focused** - One behavior per test
- **Use descriptive names** - `it("should create user with valid email")`
- **Clean up resources** - Use `afterEach` to reset state

## ❌ Don't

- **Skip error testing** - Test failure scenarios
- **Create test dependencies** - Each test should be independent
- **Use hardcoded data** - Use fixtures instead
- **Test third-party code** - Trust your dependencies
- **Write slow tests** - Mock expensive operations
- **Ignore warnings** - Fix deprecation warnings

## Testing Pattern

```typescript
describe("Feature", () => {
  it("should do something", () => {
    // Arrange: Set up test data
    const input = "test data";

    // Act: Execute the code
    const result = service.process(input);

    // Assert: Verify the result
    expect(result).toBe("expected output");
  });
});
```

## Common Mistakes

**❌ Testing implementation**

```typescript
it("should call repository.findById", async () => {
  await service.getUser("1");
  expect(repo.findById).toHaveBeenCalled(); // Too specific
});
```

**✅ Testing behavior**

```typescript
it("should return user by ID", async () => {
  const user = await service.getUser("1");
  expect(user.id).toBe("1"); // Tests outcome
});
```

---

**Complete Testing Guide**: [← Back to Testing](./README.md)
