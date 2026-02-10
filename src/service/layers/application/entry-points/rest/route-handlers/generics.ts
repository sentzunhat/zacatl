import { z } from "@zacatl/third-party/zod";

export const makeSchema = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): z.ZodObject<T> => {
  return schema;
};

export const makeWithDefaultResponse = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): z.ZodObject<{
  ok: z.ZodBoolean;
  message: z.ZodString;
  data: z.ZodObject<T>;
}> =>
  z.object({
    ok: z.boolean(),
    message: z.string(),
    data: makeSchema(schema),
  });
