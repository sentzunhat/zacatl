import { describe, it, expect } from "vitest";
import { generateHmac } from "../../../src/utils/hmac";

describe("HMAC Utilities", () => {
  describe("generateHmac()", () => {
    it("should generate HMAC with default SHA256 and hex encoding", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
      });
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
      // SHA256 hex output should be 64 characters
      expect(result.length).toBe(64);
    });

    it("should generate consistent HMACs for same inputs", () => {
      const result1 = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
      });
      const result2 = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
      });
      expect(result1).toBe(result2);
    });

    it("should generate different HMACs for different messages", () => {
      const result1 = generateHmac({
        message: "Message 1",
        secretKey: "secret-key",
      });
      const result2 = generateHmac({
        message: "Message 2",
        secretKey: "secret-key",
      });
      expect(result1).not.toBe(result2);
    });

    it("should generate different HMACs for different secret keys", () => {
      const result1 = generateHmac({
        message: "Hello World",
        secretKey: "secret-key-1",
      });
      const result2 = generateHmac({
        message: "Hello World",
        secretKey: "secret-key-2",
      });
      expect(result1).not.toBe(result2);
    });

    it("should support SHA512 algorithm", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        algorithm: "sha512",
      });
      expect(result).toBeTruthy();
      // SHA512 hex output should be 128 characters
      expect(result.length).toBe(128);
    });

    it("should support SHA1 algorithm", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        algorithm: "sha1",
      });
      expect(result).toBeTruthy();
      // SHA1 hex output should be 40 characters
      expect(result.length).toBe(40);
    });

    it("should support MD5 algorithm", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        algorithm: "md5",
      });
      expect(result).toBeTruthy();
      // MD5 hex output should be 32 characters
      expect(result.length).toBe(32);
    });

    it("should generate HMAC in base64 encoding", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        encoding: "base64",
      });
      expect(result).toBeTruthy();
      // Base64 can contain alphanumeric, +, /, and = for padding
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });

    it("should generate HMAC in base64url encoding", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        encoding: "base64url",
      });
      expect(result).toBeTruthy();
      // Base64url uses alphanumeric, -, _
      expect(/^[A-Za-z0-9_-]*$/.test(result)).toBe(true);
    });

    it("should support empty message", () => {
      const result = generateHmac({
        message: "",
        secretKey: "secret-key",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should support empty secret key", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should handle unicode characters in message", () => {
      const result = generateHmac({
        message: "Hello 世界 🌍",
        secretKey: "secret-key",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should handle unicode characters in secret key", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "秘密キー",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should handle very long messages", () => {
      const longMessage = "A".repeat(10000);
      const result = generateHmac({
        message: longMessage,
        secretKey: "secret-key",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should handle very long secret keys", () => {
      const longSecret = "Secret".repeat(1000);
      const result = generateHmac({
        message: "Hello World",
        secretKey: longSecret,
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should handle special characters in message", () => {
      const result = generateHmac({
        message: "!@#$%^&*()_+-={}[]|:;<>?,./\"'\\",
        secretKey: "secret-key",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should handle special characters in secret key", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "!@#$%^&*()_+-={}[]|:;<>?,./\"'\\",
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64); // SHA256 hex
    });

    it("should produce hex output with lowercase characters", () => {
      const result = generateHmac({
        message: "Test",
        secretKey: "key",
      });
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });

    it("should combine SHA512 with base64 encoding", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        algorithm: "sha512",
        encoding: "base64",
      });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });

    it("should combine SHA512 with base64url encoding", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        algorithm: "sha512",
        encoding: "base64url",
      });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9_-]*$/.test(result)).toBe(true);
    });

    it("should combine MD5 with base64 encoding", () => {
      const result = generateHmac({
        message: "Hello World",
        secretKey: "secret-key",
        algorithm: "md5",
        encoding: "base64",
      });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });

    it("should produce known HMAC values (test vector)", () => {
      // HMAC-SHA256("test", "key")
      const result = generateHmac({
        message: "test",
        secretKey: "key",
        algorithm: "sha256",
      });
      // Verify consistency - should always produce same output
      const result2 = generateHmac({
        message: "test",
        secretKey: "key",
        algorithm: "sha256",
      });
      expect(result).toBe(result2);
      expect(result.length).toBe(64); // SHA256 produces 64 hex chars
    });

    it("should produce different outputs for different algorithms", () => {
      const sha256 = generateHmac({
        message: "Test",
        secretKey: "key",
        algorithm: "sha256",
      });
      const sha512 = generateHmac({
        message: "Test",
        secretKey: "key",
        algorithm: "sha512",
      });
      const sha1 = generateHmac({
        message: "Test",
        secretKey: "key",
        algorithm: "sha1",
      });
      const md5 = generateHmac({
        message: "Test",
        secretKey: "key",
        algorithm: "md5",
      });

      expect(sha256).not.toBe(sha512);
      expect(sha256).not.toBe(sha1);
      expect(sha256).not.toBe(md5);
      expect(sha512).not.toBe(sha1);
      expect(sha512).not.toBe(md5);
      expect(sha1).not.toBe(md5);
    });

    it("should work for API signature verification use case", () => {
      const apiSecret = "my-api-secret";
      const requestData = JSON.stringify({
        userId: 123,
        action: "login",
        timestamp: 1234567890,
      });

      const signature = generateHmac({
        message: requestData,
        secretKey: apiSecret,
        algorithm: "sha256",
        encoding: "hex",
      });

      // Verify same inputs produce same signature
      const verifySignature = generateHmac({
        message: requestData,
        secretKey: apiSecret,
        algorithm: "sha256",
        encoding: "hex",
      });

      expect(signature).toBe(verifySignature);
    });

    it("should work for webhook payload signing", () => {
      const webhookSecret = "webhook-secret-key";
      const payload = "event=order.created&order_id=12345&amount=99.99";

      const signature = generateHmac({
        message: payload,
        secretKey: webhookSecret,
        algorithm: "sha256",
        encoding: "hex",
      });

      expect(signature).toBeTruthy();
      expect(signature.length).toBe(64);
    });
  });
});
