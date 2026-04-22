import { describe, expect, it } from 'vitest';

import {
  AbstractFastifyRouteHandler,
  DeleteFastifyRouteHandler,
  FastifyAbstractRouteHandler,
  FastifyDeleteRouteHandler,
  FastifyGetRouteHandler,
  FastifyPatchRouteHandler,
  FastifyPostRouteHandler,
  FastifyPutRouteHandler,
  GetFastifyRouteHandler,
  PatchFastifyRouteHandler,
  PostFastifyRouteHandler,
  PutFastifyRouteHandler,
} from '../../../../../../../../src/service/layers/application/entry-points/rest';
import {
  AbstractRouteHandler,
  DeleteRouteHandler,
  GetRouteHandler,
  PatchRouteHandler,
  PostRouteHandler,
  PutRouteHandler,
} from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers';

describe('Fastify prefixed aliases', () => {
  it('maps alias exports to the same Fastify handler classes', () => {
    expect(AbstractFastifyRouteHandler).toBe(AbstractRouteHandler);
    expect(FastifyAbstractRouteHandler).toBe(AbstractRouteHandler);
    expect(GetFastifyRouteHandler).toBe(GetRouteHandler);
    expect(FastifyGetRouteHandler).toBe(GetRouteHandler);
    expect(PostFastifyRouteHandler).toBe(PostRouteHandler);
    expect(FastifyPostRouteHandler).toBe(PostRouteHandler);
    expect(PutFastifyRouteHandler).toBe(PutRouteHandler);
    expect(FastifyPutRouteHandler).toBe(PutRouteHandler);
    expect(PatchFastifyRouteHandler).toBe(PatchRouteHandler);
    expect(FastifyPatchRouteHandler).toBe(PatchRouteHandler);
    expect(DeleteFastifyRouteHandler).toBe(DeleteRouteHandler);
    expect(FastifyDeleteRouteHandler).toBe(DeleteRouteHandler);
  });
});
