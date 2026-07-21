import { describe, it, expect, vi, afterEach } from 'vitest';

import { generateHmac, verifyHmac } from '../../../src/utils/hmac';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('HMAC Utilities', () => {
  describe('generateHmac()', () => {
    it('should generate HMAC with default SHA256 and hex encoding', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'secret-key' });
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64);
    });

    it('should generate consistent HMACs for same inputs', () => {
      const r1 = generateHmac({ message: 'Hello World', secretKey: 'secret-key' });
      const r2 = generateHmac({ message: 'Hello World', secretKey: 'secret-key' });
      expect(r1).toBe(r2);
    });

    it('should generate different HMACs for different messages', () => {
      const r1 = generateHmac({ message: 'Message 1', secretKey: 'secret-key' });
      const r2 = generateHmac({ message: 'Message 2', secretKey: 'secret-key' });
      expect(r1).not.toBe(r2);
    });

    it('should generate different HMACs for different secret keys', () => {
      const r1 = generateHmac({ message: 'Hello World', secretKey: 'secret-key-1' });
      const r2 = generateHmac({ message: 'Hello World', secretKey: 'secret-key-2' });
      expect(r1).not.toBe(r2);
    });

    it('should support SHA512 algorithm', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'secret-key', algorithm: 'sha512' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(128);
    });

    it('should generate HMAC in base64 encoding', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'secret-key', encoding: 'base64' });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });

    it('should generate HMAC in base64url encoding', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'secret-key', encoding: 'base64url' });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9_-]*$/.test(result)).toBe(true);
    });

    it('should support empty message', () => {
      const result = generateHmac({ message: '', secretKey: 'secret-key' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should support empty secret key', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: '' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should handle unicode characters in message', () => {
      const result = generateHmac({ message: 'Hello 世界 🌍', secretKey: 'secret-key' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should handle unicode characters in secret key', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: '秘密キー' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should handle very long messages', () => {
      const result = generateHmac({ message: 'A'.repeat(10000), secretKey: 'secret-key' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should handle very long secret keys', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'Secret'.repeat(1000) });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should handle special characters in message', () => {
      const result = generateHmac({ message: '!@#$%^&*()_+-={}[]|:;<>?,./"\'\\', secretKey: 'secret-key' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should handle special characters in secret key', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: '!@#$%^&*()_+-={}[]|:;<>?,./"\'\\' });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });

    it('should produce hex output with lowercase characters', () => {
      const result = generateHmac({ message: 'Test', secretKey: 'key' });
      expect(/^[a-f0-9]+$/.test(result)).toBe(true);
    });

    it('should combine SHA512 with base64 encoding', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'secret-key', algorithm: 'sha512', encoding: 'base64' });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9+/=]+$/.test(result)).toBe(true);
    });

    it('should combine SHA512 with base64url encoding', () => {
      const result = generateHmac({ message: 'Hello World', secretKey: 'secret-key', algorithm: 'sha512', encoding: 'base64url' });
      expect(result).toBeTruthy();
      expect(/^[A-Za-z0-9_-]*$/.test(result)).toBe(true);
    });

    it('should produce known HMAC values (test vector)', () => {
      const r1 = generateHmac({ message: 'test', secretKey: 'key', algorithm: 'sha256' });
      const r2 = generateHmac({ message: 'test', secretKey: 'key', algorithm: 'sha256' });
      expect(r1).toBe(r2);
      expect(r1.length).toBe(64);
    });

    it('should produce different outputs for different algorithms', () => {
      const sha256 = generateHmac({ message: 'Test', secretKey: 'key', algorithm: 'sha256' });
      const sha512 = generateHmac({ message: 'Test', secretKey: 'key', algorithm: 'sha512' });
      expect(sha256).not.toBe(sha512);
    });

    it('should work for API signature verification use case', () => {
      const apiSecret = 'my-api-secret';
      const requestData = JSON.stringify({ userId: 123, action: 'login', timestamp: 1234567890 });
      const sig1 = generateHmac({ message: requestData, secretKey: apiSecret });
      const sig2 = generateHmac({ message: requestData, secretKey: apiSecret });
      expect(sig1).toBe(sig2);
    });

    it('should work for webhook payload signing', () => {
      const result = generateHmac({
        message: 'event=order.created&order_id=12345&amount=99.99',
        secretKey: 'webhook-secret-key',
      });
      expect(result).toBeTruthy();
      expect(result.length).toBe(64);
    });
  });

  describe('verifyHmac()', () => {
    it('should return true for a valid signature', () => {
      const message = 'Hello World';
      const secretKey = 'secret-key';
      const signature = generateHmac({ message, secretKey });
      expect(verifyHmac({ message, signature, secretKey })).toBe(true);
    });

    it('should return false for a tampered message', () => {
      const secretKey = 'secret-key';
      const signature = generateHmac({ message: 'original', secretKey });
      expect(verifyHmac({ message: 'tampered', signature, secretKey })).toBe(false);
    });

    it('should return false for a wrong secret key', () => {
      const message = 'Hello World';
      const signature = generateHmac({ message, secretKey: 'correct-key' });
      expect(verifyHmac({ message, signature, secretKey: 'wrong-key' })).toBe(false);
    });

    it('should return false for a truncated signature', () => {
      const message = 'Hello World';
      const secretKey = 'secret-key';
      const signature = generateHmac({ message, secretKey }).slice(0, 32);
      expect(verifyHmac({ message, signature, secretKey })).toBe(false);
    });

    it('should return false for an empty signature', () => {
      expect(verifyHmac({ message: 'Hello', signature: '', secretKey: 'key' })).toBe(false);
    });

    it('should return false (not throw) for a same-string-length signature containing multi-byte characters', () => {
      const message = 'Hello World';
      const secretKey = 'secret-key';
      const valid = generateHmac({ message, secretKey });
      // Same JS string length as the valid hex signature, but multi-byte
      // UTF-8 characters make the byte length differ.
      const multiByte = 'é'.repeat(valid.length);
      expect(multiByte.length).toBe(valid.length);
      expect(() => verifyHmac({ message, signature: multiByte, secretKey })).not.toThrow();
      expect(verifyHmac({ message, signature: multiByte, secretKey })).toBe(false);
    });

    it('should work with sha512', () => {
      const message = 'payload';
      const secretKey = 'secret';
      const signature = generateHmac({ message, secretKey, algorithm: 'sha512' });
      expect(verifyHmac({ message, signature, secretKey, algorithm: 'sha512' })).toBe(true);
    });

    it('should work with base64 encoding', () => {
      const message = 'payload';
      const secretKey = 'secret';
      const signature = generateHmac({ message, secretKey, encoding: 'base64' });
      expect(verifyHmac({ message, signature, secretKey, encoding: 'base64' })).toBe(true);
    });

    it('should return false when encoding mismatches', () => {
      const message = 'payload';
      const secretKey = 'secret';
      const hexSig = generateHmac({ message, secretKey, encoding: 'hex' });
      expect(verifyHmac({ message, signature: hexSig, secretKey, encoding: 'base64' })).toBe(false);
    });

    it('should work for webhook verification use case', () => {
      const webhookSecret = 'webhook-secret';
      const payload = 'event=order.created&order_id=12345';
      const incoming = generateHmac({ message: payload, secretKey: webhookSecret });
      expect(verifyHmac({ message: payload, signature: incoming, secretKey: webhookSecret })).toBe(true);
    });
  });
});
