/**
 * Encodes a string to Base64 format.
 * @param input - The string to be encoded.
 * @returns The Base64-encoded string.
 */
export const encodeBase64 = (input: string): string => {
  return Buffer.from(input, "utf-8").toString("base64");
};

/**
 * Decodes a Base64-encoded string.
 * @param input - The Base64 string to be decoded.
 * @returns The decoded string.
 */
export const decodeBase64 = (input: string): string => {
  return Buffer.from(input, "base64").toString("utf-8");
};
