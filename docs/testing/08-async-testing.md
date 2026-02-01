# Async Testing

Test promises, async/await, and timers.

## Testing Promises

```typescript
it("should resolve promise", async () => {
  const service = new AsyncService();
  const result = await service.asyncOperation();
  expect(result).toBeDefined();
});

it("should reject on error", async () => {
  const service = new AsyncService();
  await expect(service.failingOperation()).rejects.toThrow();
});
```

## Testing Timers

```typescript
import { vi } from "vitest";

it("should wait for timeout", () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);

  expect(callback).toHaveBeenCalled();

  vi.restoreAllMocks();
});
```

## Testing Callbacks

```typescript
it("should call callback", (done) => {
  const service = new CallbackService();

  service.doSomething((error, result) => {
    expect(error).toBeNull();
    expect(result).toBe("success");
    done();
  });
});
```

---

**Next**: [Coverage →](./09-coverage.md)
