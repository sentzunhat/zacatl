import { createHmac } from "crypto";

/**
 * Function to generate HMAC using a secret key
 * @param message - The message to be hashed
 * @param secretKey - The secret key used for HMAC
 * @returns The HMAC digest in hexadecimal format
 */
export const generateHmac = (message: string, secretKey: string): string => {
  const hmac = createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("hex");
};
