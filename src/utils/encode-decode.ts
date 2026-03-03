import { Buffer } from 'buffer';

export type BufferEncodingInput =
  | 'utf8'
  | 'utf-8'
  | 'base64'
  | 'base64url'
  | 'hex'
  | 'ascii'
  | 'binary'
  | 'latin1';

export type BufferEncodingOutput =
  | 'utf8'
  | 'utf-8'
  | 'base64'
  | 'base64url'
  | 'hex'
  | 'ascii'
  | 'binary'
  | 'latin1';

export interface EncodeOptions {
  input: string;
  encoding?: {
    input?: BufferEncodingInput;
    output?: BufferEncodingOutput;
  };
}

export interface DecodeOptions {
  input: string;
  encoding?: {
    input?: BufferEncodingInput;
    output?: BufferEncodingOutput;
  };
}

/**
 * Encodes a string from one encoding to another.
 * @param options - Configuration options for encoding
 * @param options.input - The string to be encoded
 * @param options.encoding.input - The input encoding format (default: "utf-8")
 * @param options.encoding.output - The output encoding format (default: "base64")
 * @returns The encoded string
 *
 * @example
 * ```typescript
 * // Encode to Base64
 * const encoded = encode({
 *   input: "Hello World",
 *   encoding: {
 *     input: "utf-8",
 *     output: "base64"
 *   }
 * });
 *
 * // Encode to hex
 * const hexEncoded = encode({
 *   input: "Hello World",
 *   encoding: {
 *     output: "hex"
 *   }
 * });
 * ```
 */
export const encode = ({ input, encoding = {} }: EncodeOptions): string => {
  const { input: inputEncoding = 'utf-8', output: outputEncoding = 'base64' } = encoding;
  return Buffer.from(input, inputEncoding).toString(outputEncoding);
};

/**
 * Decodes a string from one encoding to another.
 * @param options - Configuration options for decoding
 * @param options.input - The string to be decoded
 * @param options.encoding.input - The input encoding format (default: "base64")
 * @param options.encoding.output - The output encoding format (default: "utf-8")
 * @returns The decoded string
 *
 * @example
 * ```typescript
 * // Decode from Base64
 * const decoded = decode({
 *   input: "SGVsbG8gV29ybGQ=",
 *   encoding: {
 *     input: "base64",
 *     output: "utf-8"
 *   }
 * });
 *
 * // Decode from hex
 * const hexDecoded = decode({
 *   input: "48656c6c6f20576f726c64",
 *   encoding: {
 *     input: "hex"
 *   }
 * });
 * ```
 */
export const decode = ({ input, encoding = {} }: DecodeOptions): string => {
  const { input: inputEncoding = 'base64', output: outputEncoding = 'utf-8' } = encoding;
  return Buffer.from(input, inputEncoding).toString(outputEncoding);
};
