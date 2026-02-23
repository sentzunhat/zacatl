import { z } from '@zacatl/third-party/zod';

/**
 * Builds the standard API response envelope schema:
 * `{ ok: boolean; message: string; data: T }`
 *
 * Accepts **any** Zod type, compatible with Zod v4 and
 * `exactOptionalPropertyTypes: true`.
 *
 * ---
 *
 * ## Typical usage
 *
 * Define your **data** schema and set it as `schema.response` in a handler.
 * The framework wraps it in the envelope automatically — you do not need to
 * call `makeWithDefaultResponse` yourself unless you want Fastify to validate
 * the full response shape at the schema level.
 *
 * ```typescript
 * // ✅ Simplest — just describe the data your handler returns:
 * export class MyHandler extends PostRouteHandler<Input, MyData> {
 *   schema = {
 *     body: z.object({ name: z.string() }),
 *     response: z.object({ id: z.string(), name: z.string() }), // data shape only
 *   };
 *
 *   async handler({ body }: Request<Input>): Promise<MyData> {
 *     return { id: "1", name: body.name }; // return plain data — envelope is added automatically
 *   }
 * }
 * // HTTP response: { ok: true, message: "Success", data: { id: "1", name: "…" } }
 * ```
 *
 * ## Advanced — explicit envelope
 *
 * Use `makeWithDefaultResponse` when you want Fastify to **validate and
 * serialise** the full envelope in the schema definition:
 *
 * ```typescript
 * export const MyResponseSchema = makeWithDefaultResponse(
 *   z.object({ id: z.string(), name: z.string() }),
 * );
 * // type: { ok: boolean; message: string; data: { id: string; name: string } }
 * ```
 *
 * ## Custom envelope / no envelope
 *
 * Override `buildResponse` in your handler:
 *
 * ```typescript
 * protected buildResponse(data: MyData) {
 *   return data; // plain — no envelope
 * }
 * ```
 */
export const makeWithDefaultResponse = <T extends z.ZodTypeAny>(
  dataSchema: T,
): z.ZodObject<{
  ok: z.ZodBoolean;
  message: z.ZodString;
  data: T;
}> =>
  z.object({
    ok: z.boolean(),
    message: z.string(),
    data: dataSchema,
  });
