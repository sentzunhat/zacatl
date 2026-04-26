import { describe, it, expect } from 'vitest';

import { makeWithDefaultResponse } from '@zacatl/service/layers/application/entry-points/rest/common/schema';
import { z } from '@zacatl/third-party/zod';

import {
  greetingDataSchema,
  validGreetingEnvelope,
} from '../../../../../../helpers/rest/schema-fixtures';

describe('makeWithDefaultResponse()', () => {
  const envelopeSchema = makeWithDefaultResponse(greetingDataSchema);

  it('accepts a valid default API envelope', () => {
    expect(envelopeSchema.parse(validGreetingEnvelope)).toEqual(validGreetingEnvelope);
  });

  it('rejects payloads missing the ok flag', () => {
    const { ok: _ok, ...withoutOk } = validGreetingEnvelope;
    expect(envelopeSchema.safeParse(withoutOk).success).toBe(false);
  });

  it('rejects payloads with a non-boolean ok flag', () => {
    expect(
      envelopeSchema.safeParse({ ...validGreetingEnvelope, ok: 'yes' }).success,
    ).toBe(false);
  });

  it('rejects payloads missing message', () => {
    const { message: _message, ...withoutMessage } = validGreetingEnvelope;
    expect(envelopeSchema.safeParse(withoutMessage).success).toBe(false);
  });

  it('rejects data that fails the inner schema', () => {
    expect(
      envelopeSchema.safeParse({
        ok: true,
        message: 'Success',
        data: { id: 1, name: 'Zacatl' },
      }).success,
    ).toBe(false);
  });

  it('works with nested object data schemas', () => {
    const nestedSchema = makeWithDefaultResponse(
      z.object({
        user: z.object({ email: z.string().email() }),
        tags: z.array(z.string()),
      }),
    );

    const payload = {
      ok: false,
      message: 'Partial',
      data: { user: { email: 'dev@zacatl.dev' }, tags: ['api'] },
    };

    expect(nestedSchema.parse(payload)).toEqual(payload);
  });

  it('works with primitive data schemas', () => {
    const countSchema = makeWithDefaultResponse(z.number().int().nonnegative());

    expect(
      countSchema.parse({
        ok: true,
        message: 'Counted',
        data: 42,
      }),
    ).toEqual({ ok: true, message: 'Counted', data: 42 });
  });

  it('preserves optional fields defined on the inner data schema', () => {
    const optionalFieldSchema = makeWithDefaultResponse(
      z.object({
        id: z.string(),
        nickname: z.string().optional(),
      }),
    );

    expect(
      optionalFieldSchema.parse({
        ok: true,
        message: 'Success',
        data: { id: '1' },
      }),
    ).toEqual({
      ok: true,
      message: 'Success',
      data: { id: '1' },
    });
  });
});
