/**
 * Shared HTTP methods supported by both Fastify and Express
 */
export const HTTP_METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

export type HTTPMethod = (typeof HTTP_METHODS)[number];
