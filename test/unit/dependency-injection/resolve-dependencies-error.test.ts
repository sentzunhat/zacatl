/**
 * Tests that resolveDependencies throws a descriptive error when a class
 * is not registered in the DI container, rather than silently auto-registering it.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import 'reflect-metadata';

import {
  clearContainer,
  registerSingleton,
  resolveDependencies,
} from '../../../src/dependency-injection/container';

// A class that is intentionally NOT decorated with @injectable
class UnregisteredService {
  doWork() {
    return 'work';
  }
}

// A class that IS decorated and will be manually registered
class RegisteredService {
  doWork() {
    return 'registered';
  }
}

describe('resolveDependencies — descriptive error on missing registration', () => {
  beforeEach(() => {
    clearContainer();
  });

  afterEach(() => {
    clearContainer();
  });

  it('throws an Error (not a silent default) when class is not registered', () => {
    expect(() => resolveDependencies([UnregisteredService])).toThrow();
  });

  it('error message names the missing class', () => {
    let thrown: Error | null = null;
    try {
      resolveDependencies([UnregisteredService]);
    } catch (e) {
      thrown = e as Error;
    }

    expect(thrown).not.toBeNull();
    expect(thrown!.message).toMatch(/UnregisteredService/);
  });

  it('error message hints at @injectable decorator', () => {
    let thrown: Error | null = null;
    try {
      resolveDependencies([UnregisteredService]);
    } catch (e) {
      thrown = e as Error;
    }

    // Check that error contains @injectable hint in reason field
    const errorWithReason = thrown as { reason?: string };
    expect(errorWithReason.reason).toBeDefined();
    expect(errorWithReason.reason).toMatch(/@injectable/);
  });

  it('error message mentions layers config paths', () => {
    let thrown: Error | null = null;
    try {
      resolveDependencies([UnregisteredService]);
    } catch (e) {
      thrown = e as Error;
    }

    // Check that error contains layers config hint in reason field
    const errorWithReason = thrown as { reason?: string };
    expect(errorWithReason.reason).toBeDefined();
    expect(errorWithReason.reason).toMatch(/layers\./);
  });

  it('resolves successfully when the class is properly registered', () => {
    registerSingleton(RegisteredService, RegisteredService);
    const results = resolveDependencies([RegisteredService]);
    expect(results).toHaveLength(1);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const service = results[0]!;
    expect(service).toBeInstanceOf(RegisteredService);
    expect(service.doWork()).toBe('registered');
  });

  it('stops at first failure — does not partially resolve a batch', () => {
    registerSingleton(RegisteredService, RegisteredService);

    // Mix of registered + unregistered in one call
    expect(() => resolveDependencies([RegisteredService, UnregisteredService])).toThrow(
      /UnregisteredService/,
    );
  });
});
