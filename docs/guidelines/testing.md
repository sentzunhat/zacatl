# Testing Guide

This guide covers test structure, naming conventions, test framework setup, and coverage expectations.

## Table of Contents

1. [Test Framework Setup](#test-framework-setup)
2. [Test File Organization](#test-file-organization)
3. [Naming Conventions](#naming-conventions)
4. [Test Structure & Patterns](#test-structure--patterns)
5. [Testing Best Practices](#testing-best-practices)
6. [Coverage Targets](#coverage-targets)

---

## Test Framework Setup

### Framework Choice: Vitest

```toml
[Tech Stack Specific] — Vitest is chosen for:
- Fast execution with Vite integration
- Jest-compatible API (familiar for teams)
- Native ESM support
- Excellent TypeScript support
```

### Vite Configuration for Tests

```javascript
// vite.config.mjs
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enable describe, it, expect without imports
    include: ['test/**/*.test.ts'],
    environment: 'node', // Test in Node.js environment
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/'],
    },
  },
});
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Running Tests

```bash
npm test              # Run all tests once
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report
```

---

## Test File Organization

### Directory Structure

```
test/
├── unit/                    # Unit tests (majority)
│   ├── service/
│   │   └── service.test.ts
│   ├── error/
│   │   ├── bad-request.test.ts
│   │   └── unauthorized.test.ts
│   ├── dependency-injection/
│   │   └── container.test.ts
│   └── logs/
│       └── logger.test.ts
├── integration/             # Integration tests (optional)
│   └── api.test.ts
└── helpers/                 # Test utilities
    ├── test-data.ts
    └── test-container.ts
```

**Mirrored Structure:** Test folders should mirror `src/` structure for easy navigation.

```
src/
├── service/
│   └── service.ts
├── error/
│   └── bad-request.ts
└── logs/
    └── logger.ts

test/unit/
├── service/
│   └── service.test.ts     # Tests src/service/service.ts
├── error/
│   └── bad-request.test.ts # Tests src/error/bad-request.ts
└── logs/
    └── logger.test.ts      # Tests src/logs/logger.ts
```

---

## Naming Conventions

### Test File Naming

**Pattern:** `<module>.test.ts`

```
// ✅ Good
user-service.test.ts
bad-request.test.ts
get-greeting-handler.test.ts
container.test.ts

// ❌ Avoid
userServiceTest.ts        // Wrong case
service_test.ts           // snake_case
test-user-service.ts      // Prefix instead of suffix
userService.spec.ts       // .spec conflict with Jasmine
```

### Test Suite Naming

**Pattern:** Descriptive sentence starting with "should" or noun describing what's tested

```typescript
// ✅ Good
describe("GreetingService", () => {
  describe("create", () => {
    it("should throw BadRequestError when message is empty", () => { });
    it("should save greeting with timestamp", () => { });
  });
});

// ❌ Avoid
describe("test greeting service", () => {    // Lowercase
describe("greetingService tests", () => {     // Too generic
describe("GreetingService.create()", () => {  // avoid code syntax in text
```

### Test Case Naming

**Pattern:** "should [expected behavior] [when condition]"

```typescript
// ✅ Good — clear, specific, actionable
it('should return all greetings sorted by date', () => {});
it('should throw BadRequestError when message is empty', () => {});
it('should auto-register provider on construction', () => {});
it('should create new instance on each resolution when transient', () => {});

// ❌ Avoid
it('greetings work', () => {}); // Too vague
it('test create function', () => {}); // Not specific
it('when message is empty', () => {}); // Missing "should"
```

---

## Test Structure & Patterns

### Basic Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Test Auto-Registration Without Service
 *
 * Verifies that infrastructure, application, and domain layers
 * can auto-register dependencies without needing Service orchestration.
 */
describe('Auto-Registration', () => {
  beforeEach(() => {
    // Setup: initialize test fixtures
    clearContainer();
  });

  afterEach(() => {
    // Cleanup: reset state
    vi.clearAllMocks();
  });

  it('should auto-register domain providers on construction', () => {
    // Arrange: set up test conditions
    class MyService {
      getName() {
        return 'MyService';
      }
    }

    // Act: call the code under test
    new Domain({ providers: [MyService] });
    const service = resolveDependency(MyService);

    // Assert: verify result
    expect(service).toBeDefined();
    expect(service.getName()).toBe('MyService');
  });
});
```

### AAA Pattern (Arrange-Act-Assert)

1. **Arrange:** Set up test data and fixtures
2. **Act:** Call the function/method being tested
3. **Assert:** Verify the result

```typescript
it('should create greeting with timestamp', async () => {
  // Arrange
  const input = { message: 'Hello world' };
  const service = new GreetingService(mockRepository);

  // Act
  const result = await service.create(input);

  // Assert
  expect(result.message).toBe('Hello world');
  expect(result.createdAt).toBeDefined();
});
```

### Testing Different Concerns

#### Unit Testing a Service

```typescript
describe('GreetingService', () => {
  let service: GreetingService;
  let mockRepository: GreetingPort;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn().mockResolvedValue([]),
      save: vi.fn(),
    };
    service = new GreetingService(mockRepository);
  });

  describe('getAll', () => {
    it('should return all greetings from repository', async () => {
      // Arrange
      const expected = [
        { id: '1', message: 'Hello' },
        { id: '2', message: 'World' },
      ];
      mockRepository.findAll = vi.fn().mockResolvedValue(expected);

      // Act
      const result = await service.getAll();

      // Assert
      expect(result).toEqual(expected);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });

    it('should throw ValidationError when repository fails', async () => {
      // Arrange
      mockRepository.findAll = vi.fn().mockRejectedValue(new Error('DB connection failed'));

      // Act & Assert
      await expect(service.getAll()).rejects.toThrow();
    });
  });
});
```

#### Unit Testing an Error Class

```typescript
describe('BadRequestError', () => {
  it('should set code to 400', () => {
    // Arrange & Act
    const error = new BadRequestError({
      message: 'Invalid input',
      reason: 'Email is required',
    });

    // Assert
    expect(error.code).toBe(400);
    expect(error.message).toBe('Invalid input');
    expect(error.reason).toBe('Email is required');
  });

  it('should include metadata when provided', () => {
    // Arrange & Act
    const error = new BadRequestError({
      message: 'Invalid input',
      metadata: { field: 'email' },
    });

    // Assert
    expect(error.metadata).toEqual({ field: 'email' });
  });
});
```

#### Testing DI Container

```typescript
describe('Dependency Injection Container', () => {
  beforeEach(() => {
    clearContainer();
  });

  it('should register and resolve a dependency', () => {
    // Arrange
    class MyService {
      getName() {
        return 'MyService';
      }
    }
    container.register(MyService, { useClass: MyService });

    // Act
    const resolved = container.resolve(MyService);

    // Assert
    expect(resolved).toBeDefined();
    expect(resolved.getName()).toBe('MyService');
  });

  it('should handle circular dependencies', () => {
    // Arrange
    class ServiceA {
      constructor(private b: ServiceB) {}
    }
    class ServiceB {
      constructor(private a: ServiceA) {}
    }

    // Act & Assert
    expect(() => {
      container.register(ServiceA, { useClass: ServiceA });
      container.register(ServiceB, { useClass: ServiceB });
      container.resolve(ServiceA);
    }).toThrow();
  });
});
```

---

## Testing Best Practices

### 1. One Assertion Per Test (or Logical Group)

**✅ Preferred:**

```typescript
it('should set code to 400', () => {
  const error = new BadRequestError({ message: 'Invalid' });
  expect(error.code).toBe(400);
});

it('should include message', () => {
  const error = new BadRequestError({ message: 'Invalid' });
  expect(error.message).toBe('Invalid');
});
```

**❌ Avoid:**

```typescript
it("should create error with all properties", () => {
  const error = new BadRequestError({ message: "Invalid" });
  expect(error.code).toBe(400);
  expect(error.message).toBe("Invalid");
  expect(error.reason).toBe(...);
  expect(error.metadata).toBe(...);  // Too many assertions
});
```

> **Rationale:** Multiple assertions make it hard to identify exactly what failed.

### 2. Test Behavior, Not Implementation

**✅ Good:**

```typescript
it('should return all greetings sorted by creation date', async () => {
  const result = await service.getAll();
  expect(result[0].createdAt).toBeLessThanOrEqual(result[1].createdAt);
});
```

**❌ Avoid:**

```typescript
it('should call repository.findAll() once', async () => {
  await service.getAll();
  expect(mockRepository.findAll).toHaveBeenCalledTimes(1); // Testing internals
});
```

### 3. Clear Test Fixtures

Use helper functions for repeated test setup:

```typescript
// test/helpers/test-data.ts
export function createTestGreeting(overrides?: Partial<Greeting>): Greeting {
  return {
    id: 'test-id',
    message: 'Test greeting',
    createdAt: new Date(),
    ...overrides,
  };
}

// In tests
it('should update greeting message', async () => {
  const greeting = createTestGreeting({ message: 'Original' });
  const updated = await service.update(greeting.id, { message: 'Updated' });
  expect(updated.message).toBe('Updated');
});
```

### 4. Use Test Spies Carefully

Spy on dependencies, not subjects under test:

```typescript
// ✅ Good — spying on a dependency
it('should log when greeting is created', async () => {
  const logSpy = vi.spyOn(logger, 'info');
  await service.create({ message: 'Test' });
  expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('created'));
});

// ❌ Avoid — spying on the service itself
it('should call internal helper', async () => {
  const spy = vi.spyOn(service as any, 'validateInput');
  await service.create({ message: 'Test' });
  expect(spy).toHaveBeenCalled(); // Testing internals
});
```

### 5. Test Error Cases

Always test both happy path and error scenarios:

```typescript
describe('GreetingService.create', () => {
  it('should create greeting with valid input', async () => {
    // Happy path
    const result = await service.create({ message: 'Hello' });
    expect(result.id).toBeDefined();
  });

  it('should throw BadRequestError when message is empty', async () => {
    // Error case
    await expect(service.create({ message: '' })).rejects.toThrow(BadRequestError);
  });

  it('should throw InternalServerError on database failure', async () => {
    // External error case
    mockRepository.save = vi.fn().mockRejectedValue(new Error('DB down'));
    await expect(service.create({ message: 'Test' })).rejects.toThrow();
  });
});
```

### 6. Use Descriptive Assertions

```typescript
// ✅ Clear
expect(result).toEqual({
  id: expect.any(String),
  message: 'Hello',
  createdAt: expect.any(Date),
});

// ✅ With custom matchers
expect(error).toBeInstanceOf(BadRequestError);
expect(error.code).toBe(400);

// ❌ Vague
expect(result).toBeTruthy();
expect(result.length > 0).toBe(true);
```

---

## Real-World Test Examples from Codebase

### Example 1: Testing Custom Errors

```typescript
// test/unit/error/custom.test.ts
import { describe, expect, it } from 'vitest';
import { CustomError } from '../../../src/error/custom';

describe('CustomError', () => {
  class TestError extends CustomError {}

  it('should generate a correlationId if not provided', () => {
    const error = new TestError({ message: 'Something went wrong' });

    expect(error.correlationId).toBeDefined();
    expect(typeof error.correlationId).toBe('string');
    expect(error.correlationId.length).toBeGreaterThan(0);
    expect(error.correlationId).not.toBe(error.id);
  });

  it('should use the provided correlationId', () => {
    const customCorrelationId = 'req-12345';
    const error = new TestError({
      message: 'Something went wrong',
      correlationId: customCorrelationId,
    });

    expect(error.correlationId).toBe(customCorrelationId);
    expect(error.correlationId).not.toBe(error.id);
  });

  it('toJSON() should include correlationId and structured metadata', () => {
    const metadata = { user: 'u1' };
    const error = new TestError({
      message: 'Test message',
      code: 400,
      reason: 'Bad Input',
      metadata,
    });

    const json = error.toJSON();

    expect(json.message).toBe('Test message');
    expect(json.name).toBe('TestError');
    expect(json.code).toBe(400);
    expect(json.reason).toBe('Bad Input');
    expect(json.metadata).toEqual(metadata);
    expect(json.correlationId).toBeDefined();
  });
});
```

### Example 2: Testing Dependency Injection

```typescript
// test/unit/dependency-injection/container.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  clearContainer,
  registerDependency,
  registerSingleton,
  resolveDependency,
} from '../../../src/dependency-injection/container';

class TestService {
  public id = Math.random();

  public getMessage(): string {
    return 'Hello from TestService';
  }
}

describe('Dependency Injection Container', () => {
  beforeEach(() => {
    clearContainer();
  });

  afterEach(() => {
    clearContainer();
  });

  it('should register and resolve a dependency', () => {
    registerDependency('TestService', TestService);

    const service = resolveDependency<TestService>('TestService');

    expect(service).toBeInstanceOf(TestService);
    expect(service.getMessage()).toBe('Hello from TestService');
  });

  it('should register and resolve a singleton (shared instance)', () => {
    registerSingleton('TestService', TestService);

    const instance1 = resolveDependency<TestService>('TestService');
    const instance2 = resolveDependency<TestService>('TestService');

    expect(instance1).toBe(instance2); // Same instance
    expect(instance1.id).toBe(instance2.id);
  });

  it('should create new instances for non-singleton registrations', () => {
    registerDependency('TestService', TestService);

    const instance1 = resolveDependency<TestService>('TestService');
    const instance2 = resolveDependency<TestService>('TestService');

    expect(instance1).toBeInstanceOf(TestService);
    expect(instance2).toBeInstanceOf(TestService);
    expect(instance1.id).not.toBe(instance2.id); // Different instances
  });
});
```

### Example 3: Testing with Mocks

```typescript
// Example pattern for testing services with mocked repositories
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('GreetingService', () => {
  let service: GreetingService;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findAll: vi.fn(),
      findById: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };

    service = new GreetingService(mockRepository);
  });

  it('should return all greetings', async () => {
    const mockGreetings = [
      { id: '1', message: 'Hello' },
      { id: '2', message: 'Hi' },
    ];
    mockRepository.findAll.mockResolvedValue(mockGreetings);

    const result = await service.getAll();

    expect(result).toEqual(mockGreetings);
    expect(mockRepository.findAll).toHaveBeenCalledOnce();
  });

  it('should throw NotFoundError when greeting not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(service.getById('999')).rejects.toThrow(NotFoundError);
    expect(mockRepository.findById).toHaveBeenCalledWith('999');
  });
});
```

### Example 4: Testing Async Operations

```typescript
describe('Configuration Loading', () => {
  it('should load and validate JSON configuration', async () => {
    const schema = z.object({
      port: z.number(),
      host: z.string(),
    });

    const config = loadJSON('./test/fixtures/config.json', schema);

    expect(config.port).toBe(3000);
    expect(config.host).toBe('localhost');
  });

  it('should throw ValidationError on invalid schema', () => {
    const schema = z.object({
      port: z.number().min(1).max(65535),
    });

    expect(() => {
      loadJSON('./test/fixtures/invalid-config.json', schema);
    }).toThrow(ValidationError);
  });

  it('should throw BadResourceError when file not found', () => {
    const schema = z.object({});

    expect(() => {
      loadJSON('./nonexistent.json', schema);
    }).toThrow(BadResourceError);
  });
});
```

---

## Coverage Targets

| Metric     | Target |
| ---------- | ------ |
| Statements | 70%+   |
| Branches   | 60%+   |
| Functions  | 75%+   |
| Lines      | 70%+   |

> Inferred from codebase — Zacatl targets ~52% coverage; adjust for your project

### Coverage Configuration

```javascript
// vite.config.mjs
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/index.ts', // Barrel exports
        'src/optionals.ts', // Optional APIs
      ],
      lines: 70,
      functions: 75,
      branches: 60,
      statements: 70,
    },
  },
});
```

### Viewing Coverage Reports

```bash
npm run test:coverage

# Coverage HTML report at ./coverage/index.html
open coverage/index.html
```

### Excluding Code from Coverage

```typescript
// Mark lines as intentionally untested
/* c8 ignore start */
if (process.env.NODE_ENV === 'development') {
  // Debug-only code
}
/* c8 ignore end */
```

---

## Summary

| Aspect       | Rule                                 |
| ------------ | ------------------------------------ |
| Framework    | Vitest                               |
| File Naming  | `<module>.test.ts`                   |
| Structure    | Mirror `src/` layout                 |
| Organization | Arrange-Act-Assert                   |
| Naming       | "should [behavior] when [condition]" |
| Assertions   | One per test logically               |
| Test Scope   | Behavior, not implementation         |
| Coverage     | 70%+ statements, 75%+ functions      |
