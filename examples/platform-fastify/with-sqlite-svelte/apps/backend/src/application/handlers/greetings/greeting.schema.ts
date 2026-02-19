/**
 * Zod Validation Schemas for Greeting Endpoints
 *
 * These schemas provide:
 * - Runtime validation
 * - Type inference (TypeScript types auto-generated)
 * - Self-documenting API contracts
 */

import { z } from "zod";

// ===== Request Schemas =====

export const CreateGreetingBodySchema = z.object({
  message: z.string().min(1, "Message is required"),
  language: z.string().min(2, "Language code must be at least 2 characters"),
});

export const GreetingParamsSchema = z.object({
  language: z.string().min(2, "Language code is required"),
});

export const GreetingIdParamsSchema = z.object({
  id: z.string().min(1, "Greeting ID is required"),
});

// ===== Response Schemas =====

export const GreetingResponseSchema = z.object({
  id: z.string(),
  message: z.string(),
  language: z.string(),
  createdAt: z.string(), // ISO date string
});

export const GreetingListResponseSchema = z.array(GreetingResponseSchema);

// ===== TypeScript Types (inferred from schemas) =====

export type CreateGreetingBody = z.infer<typeof CreateGreetingBodySchema>;
export type GreetingParams = z.infer<typeof GreetingParamsSchema>;
export type GreetingIdParams = z.infer<typeof GreetingIdParamsSchema>;
export type GreetingResponse = z.infer<typeof GreetingResponseSchema>;
export type GreetingListResponse = z.infer<typeof GreetingListResponseSchema>;
