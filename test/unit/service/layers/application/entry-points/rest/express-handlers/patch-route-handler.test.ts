import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { describe, it, expect, vi } from 'vitest';

import { PatchRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/express/handlers/patch-route-handler';

type TestResponse = { id: number; name: string };
type TestRequest = ExpressRequest<void, TestResponse, void, Record<string, string>>;
type MockReply = Pick<ExpressResponse, 'headersSent'> & {
  send: ReturnType<typeof vi.fn<(body?: unknown) => void>>;
  status: ReturnType<typeof vi.fn<(statusCode: number) => MockReply>>;
};
type ExecuteReply = MockReply & ExpressResponse;

const createMockRequest = (overrides: Partial<TestRequest> = {}): TestRequest =>
  ({
    params: undefined,
    query: {},
    headers: {},
    body: undefined,
    ...overrides,
  } as unknown as TestRequest);

const createMockReply = (overrides: Partial<MockReply> = {}): MockReply => {
  const reply = {
    headersSent: false,
    send: vi.fn<(body?: unknown) => void>(),
    status: vi.fn<(statusCode: number) => MockReply>(),
    ...overrides,
  } as unknown as MockReply;

  reply.status.mockReturnValue(reply);

  return reply;
};

class TestPatchRouteHandler extends PatchRouteHandler<void, Record<string, string>, TestResponse> {
  async handler(_request: TestRequest): Promise<TestResponse> {
    return { id: 1, name: 'Test' };
  }
}

describe('Express PatchRouteHandler', () => {
  it('should send the handler response when execute succeeds', async () => {
    const handler = new TestPatchRouteHandler({ url: '/patch-test', schema: {} });
    const mockRequest = createMockRequest();
    const mockReply = createMockReply() as ExecuteReply;

    await handler.execute(mockRequest, mockReply);

    expect(mockReply.send).toHaveBeenCalledWith({ id: 1, name: 'Test' });
  });
});
