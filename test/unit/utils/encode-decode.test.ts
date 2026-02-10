import { describe, it, expect } from "vitest";
import { encode, decode } from "../../../src/utils/encode-decode";

describe("Encode-Decode Utilities", () => {
  describe("encode()", () => {
    it("should encode string to base64 by default", () => {
      const result = encode({ input: "Hello World" });
      expect(result).toBe("SGVsbG8gV29ybGQ=");
    });

    it("should encode string to hex", () => {
      const result = encode({
        input: "Hello World",
        encoding: { output: "hex" },
      });
      expect(result).toBe("48656c6c6f20576f726c64");
    });

    it("should encode string to base64url", () => {
      const result = encode({
        input: "Hello World",
        encoding: { output: "base64url" },
      });
      expect(result).toBe("SGVsbG8gV29ybGQ");
    });

    it("should encode string from utf-8 to base64", () => {
      const result = encode({
        input: "Hello World",
        encoding: { input: "utf-8", output: "base64" },
      });
      expect(result).toBe("SGVsbG8gV29ybGQ=");
    });

    it("should encode string from utf8 (without dash) to base64", () => {
      const result = encode({
        input: "Hello World",
        encoding: { input: "utf8", output: "base64" },
      });
      expect(result).toBe("SGVsbG8gV29ybGQ=");
    });

    it("should handle empty string", () => {
      const result = encode({ input: "" });
      expect(result).toBe("");
    });

    it("should handle unicode characters", () => {
      const input = "Hello 世界 🌍";
      const result = encode({ input, encoding: { output: "base64" } });
      expect(result).toBeTruthy();
      // Verify it can be decoded back
      const decoded = decode({
        input: result,
        encoding: { input: "base64", output: "utf-8" },
      });
      expect(decoded).toBe(input);
    });

    it("should handle latin1 encoding", () => {
      const result = encode({
        input: "café",
        encoding: { input: "utf-8", output: "hex" },
      });
      expect(result).toBeTruthy();
    });

    it("should encode with ascii encoding", () => {
      const result = encode({
        input: "ABC",
        encoding: { input: "ascii", output: "hex" },
      });
      expect(result).toBe("414243");
    });

    it("should encode binary data", () => {
      const result = encode({
        input: "\x00\x01\x02",
        encoding: { input: "binary", output: "hex" },
      });
      expect(result).toBe("000102");
    });
  });

  describe("decode()", () => {
    it("should decode base64 to utf-8 by default", () => {
      const result = decode({ input: "SGVsbG8gV29ybGQ=" });
      expect(result).toBe("Hello World");
    });

    it("should decode hex to utf-8", () => {
      const result = decode({
        input: "48656c6c6f20576f726c64",
        encoding: { input: "hex", output: "utf-8" },
      });
      expect(result).toBe("Hello World");
    });

    it("should decode base64url to utf-8", () => {
      const result = decode({
        input: "SGVsbG8gV29ybGQ",
        encoding: { input: "base64url", output: "utf-8" },
      });
      expect(result).toBe("Hello World");
    });

    it("should decode base64 to utf8 (without dash)", () => {
      const result = decode({
        input: "SGVsbG8gV29ybGQ=",
        encoding: { input: "base64", output: "utf8" },
      });
      expect(result).toBe("Hello World");
    });

    it("should handle empty string", () => {
      const result = decode({ input: "" });
      expect(result).toBe("");
    });

    it("should decode unicode characters", () => {
      const original = "Hello 世界 🌍";
      const encoded = encode({
        input: original,
        encoding: { output: "base64" },
      });
      const result = decode({
        input: encoded,
        encoding: { input: "base64", output: "utf-8" },
      });
      expect(result).toBe(original);
    });

    it("should decode hex to ascii", () => {
      const result = decode({
        input: "414243",
        encoding: { input: "hex", output: "ascii" },
      });
      expect(result).toBe("ABC");
    });

    it("should decode binary data", () => {
      const result = decode({
        input: "000102",
        encoding: { input: "hex", output: "binary" },
      });
      expect(result).toBe("\x00\x01\x02");
    });

    it("should decode latin1", () => {
      const result = decode({
        input: "63616661cc81",
        encoding: { input: "hex", output: "latin1" },
      });
      expect(result).toBeTruthy();
    });
  });

  describe("Round-trip encoding/decoding", () => {
    it("should encode and decode utf-8 text", () => {
      const original = "Hello World";
      const encoded = encode({
        input: original,
        encoding: { output: "base64" },
      });
      const decoded = decode({
        input: encoded,
        encoding: { input: "base64", output: "utf-8" },
      });
      expect(decoded).toBe(original);
    });

    it("should encode and decode unicode text", () => {
      const original = "こんにちは世界";
      const encoded = encode({
        input: original,
        encoding: { output: "base64" },
      });
      const decoded = decode({
        input: encoded,
        encoding: { input: "base64", output: "utf-8" },
      });
      expect(decoded).toBe(original);
    });

    it("should encode and decode hex", () => {
      const original = "Test Data";
      const encoded = encode({
        input: original,
        encoding: { output: "hex" },
      });
      const decoded = decode({
        input: encoded,
        encoding: { input: "hex", output: "utf-8" },
      });
      expect(decoded).toBe(original);
    });

    it("should encode and decode complex strings", () => {
      const original = "Special chars: !@#$%^&*()_+-={}[]|:;<>?,./";
      const encoded = encode({
        input: original,
        encoding: { output: "base64" },
      });
      const decoded = decode({
        input: encoded,
        encoding: { input: "base64", output: "utf-8" },
      });
      expect(decoded).toBe(original);
    });

    it("should handle multi-format conversions", () => {
      const original = "Data";
      // utf-8 -> base64 -> hex -> binary -> utf-8
      const step1 = encode({
        input: original,
        encoding: { input: "utf-8", output: "base64" },
      });
      const step2 = encode({
        input: step1,
        encoding: { input: "utf-8", output: "hex" },
      });
      const step3 = decode({
        input: step2,
        encoding: { input: "hex", output: "utf-8" },
      });
      const final = decode({
        input: step3,
        encoding: { input: "base64", output: "utf-8" },
      });
      expect(final).toBe(original);
    });
  });
});
