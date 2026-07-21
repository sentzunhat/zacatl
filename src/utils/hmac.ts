import { createHmac, timingSafeEqual } from 'crypto';

export type HmacAlgorithm = 'sha256' | 'sha512';
export type HmacEncoding = 'hex' | 'base64' | 'base64url';

export interface GenerateHmacOptions {
  message: string;
  secretKey: string;
  algorithm?: HmacAlgorithm;
  encoding?: HmacEncoding;
}

export interface VerifyHmacOptions {
  message: string;
  signature: string;
  secretKey: string;
  algorithm?: HmacAlgorithm;
  encoding?: HmacEncoding;
}

/**
 * Generate an HMAC digest using SHA-256 (default) or SHA-512.
 */
export const generateHmac = ({
  message,
  secretKey,
  algorithm = 'sha256',
  encoding = 'hex',
}: GenerateHmacOptions): string => {
  const hmac = createHmac(algorithm, secretKey);
  hmac.update(message);
  return hmac.digest(encoding);
};

/**
 * Timing-safe HMAC verification. Computes the expected signature and compares
 * it to the provided signature using `crypto.timingSafeEqual` to prevent
 * timing side-channel attacks.
 *
 * @returns `true` if the signature is valid, `false` otherwise.
 *
 * @example
 * ```typescript
 * const valid = verifyHmac({
 *   message: payload,
 *   signature: incomingSignature,
 *   secretKey: webhookSecret,
 *   algorithm: 'sha256',
 *   encoding: 'hex',
 * });
 * ```
 */
export const verifyHmac = ({
  message,
  signature,
  secretKey,
  algorithm = 'sha256',
  encoding = 'hex',
}: VerifyHmacOptions): boolean => {
  const expected = generateHmac({ message, secretKey, algorithm, encoding });
  // Compare byte lengths, not string lengths: multi-byte UTF-8 characters in
  // an attacker-supplied signature would otherwise pass the length guard and
  // make timingSafeEqual throw RangeError on mismatched buffer sizes.
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== signatureBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, signatureBuffer);
};
