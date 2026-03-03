import { createHmac } from 'crypto';

export type HmacAlgorithm = 'sha256' | 'sha512' | 'sha1' | 'md5';
export type HmacEncoding = 'hex' | 'base64' | 'base64url';

export interface GenerateHmacOptions {
  message: string;
  secretKey: string;
  algorithm?: HmacAlgorithm;
  encoding?: HmacEncoding;
}

/**
 * Function to generate HMAC using a secret key
 * @param options - Configuration options for HMAC generation
 * @param options.message - The message to be hashed
 * @param options.secretKey - The secret key used for HMAC
 * @param options.algorithm - Hash algorithm (default: "sha256")
 * @param options.encoding - Output encoding format (default: "hex")
 * @returns The HMAC digest in the specified encoding format
 *
 * @example
 * ```typescript
 * const hmac = generateHmac({
 *   message: "Hello World",
 *   secretKey: "my-secret-key",
 *   algorithm: "sha256",
 *   encoding: "hex"
 * });
 * ```
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
