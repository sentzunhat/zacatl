import { describe, expect, it } from "vitest";

import { CustomError } from "../../../src/error/custom";

describe("CustomError", () => {
  class TestError extends CustomError {}

  it("should generate a correlationId if not provided", () => {
    const error = new TestError({ message: "Something went wrong" });

    expect(error.correlationId).toBeDefined();
    expect(typeof error.correlationId).toBe("string");
    expect(error.correlationId.length).toBeGreaterThan(0);
    // It should be different from id when generated
    expect(error.correlationId).not.toBe(error.id);
  });

  it("should use the provided correlationId", () => {
    const customCorrelationId = "req-12345";
    const error = new TestError({
      message: "Something went wrong",
      correlationId: customCorrelationId,
    });

    expect(error.correlationId).toBe(customCorrelationId);
    // Should not match ID since ID is always random uuid
    expect(error.correlationId).not.toBe(error.id);
  });

  it("toJSON() should include correlationId and structured metadata", () => {
    const metadata = { user: "u1" };
    const error = new TestError({
      message: "Test message",
      code: 400,
      reason: "Bad Input",
      metadata,
    });

    const json = error.toJSON();

    expect(json.message).toBe("Test message");
    expect(json.name).toBe("TestError");
    expect(json.code).toBe(400);
    expect(json.reason).toBe("Bad Input");
    expect(json.metadata).toEqual(metadata);
    expect(json.correlationId).toBeDefined();
    expect(json.time).toBeDefined();
    expect(json.custom).toBe(true);
  });

  it("toJSON() should include nested error info if present", () => {
    const originalError = new Error("Database failed");
    const error = new TestError({
      message: "Wrap error",
      error: originalError,
    });

    const json = error.toJSON();
    expect(json.error).toBeDefined();
    expect(json.error?.message).toBe("Database failed");
    expect(json.error?.name).toBe("Error");
    expect(json.error?.stack).toBeDefined();
  });

  it("toString() should be formatted correctly with all details", () => {
    const error = new TestError({
      message: "Test message",
      code: 500,
      correlationId: "123",
      metadata: { role: "admin" },
    });

    const str = error.toString();

    expect(str).toContain("TestError: Test message");
    expect(str).toContain("CorrelationId: 123");
    expect(str).toContain("Code: 500");
    expect(str).toContain('Metadata: {\n  "role": "admin"\n}');
    expect(str).toContain("["); // Timestamp bracket
    expect(str).toContain("]");
  });
});
