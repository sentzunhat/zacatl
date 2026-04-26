import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { describe, it, expect, vi } from 'vitest';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../../../../../../src/error';
import { AbstractRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/express/handlers/abstract';

/**
 * Express Route Handler Tests
 *
 * Tests for Express-specific route handler implementation.
 * Mirrors Fastify handler tests but uses Express Request/Response types.
 */

type TestResponse = { id: number; name: string };
type TestRequest = ExpressRequest<void, TestResponse, void, Record<string, string>>;
type MockReply = Pick<ExpressResponse, 'headersSent'> & {
  send: ReturnType<typeof vi.fn<(body?: unknown) => void>>;
  status: ReturnType<typeof vi.fn<(statusCode: number) => MockReply>>;
};
type ZacatlErrorCtor = new (args: { message: string; reason: string }) => Error;

const createMockRequest = (
  overrides: Partial<TestRequest> = {},
): TestRequest => ({
  params: undefined,
  query: {},
  headers: {},
  body: undefined,
  ...overrides,
}) as unknown as TestRequest;

const createMockReply = (
  overrides: Partial<MockReply> = {},
): MockReply => {
  const reply: MockReply = {
    headersSent: false,
    send: vi.fn<(body?: unknown) => void>(),
    status: vi.fn<(statusCode: number) => MockReply>(),
    ...overrides,
  };

  reply.status.mockReturnValue(reply);

  return reply;
};

class TestExpressRouteHandler extends AbstractRouteHandler<
  void, // Body
  Record<string, string>, // Querystring
  TestResponse, // Response type
  void, // Params
  void // Headers
> {
  constructor() {
    super({
      url: '/test',
      method: 'GET',
      schema: {},
    });
  }

  async handler(_request: TestRequest): Promise<TestResponse> {
    return { id: 1, name: 'Test' };
  }
}

class ExpressHandlerThatThrowsNotFound extends TestExpressRouteHandler {
  override async handler(_request: TestRequest): Promise<TestResponse> {
    throw new NotFoundError({
      message: 'Resource not found',
      reason: 'test',
    });
  }
}

class ExpressHandlerWithCustomErrorHandling extends TestExpressRouteHandler {
  override async handler(_request: TestRequest): Promise<TestResponse> {
    throw new BadRequestError({
      message: 'Invalid input',
      reason: 'test',
    });
  }

  protected override handleError(error: Error): {
    statusCode: number;
    [key: string]: unknown;
  } {
    if (error instanceof BadRequestError) {
      return {
        type: 'CUSTOM_ERROR',
        message: 'Custom message',
        statusCode: 418, // I'm a teapot
      };
    }
    return { type: 'UNKNOWN', message: 'Unknown error', statusCode: 500 };
  }
}

describe('Express AbstractRouteHandler', () => {
  it('auto-sends the handler response data directly', async () => {
    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new TestExpressRouteHandler();
    const result = await handler.execute(mockRequest, mockReply);

    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(mockReply.send).toHaveBeenCalledWith({ id: 1, name: 'Test' });
  });

  it('handles NotFoundError with 404 status', async () => {
    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new ExpressHandlerThatThrowsNotFound();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow(NotFoundError);

    expect(mockReply.status).toHaveBeenCalledWith(404);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Resource not found',
    });
  });

  it('handles BadRequestError with 400 status', async () => {
    class BadRequestHandler extends TestExpressRouteHandler {
      override async handler(_request: TestRequest): Promise<TestResponse> {
        throw new BadRequestError({
          message: 'Bad request',
          reason: 'test',
        });
      }
    }

    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new BadRequestHandler();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow(BadRequestError);

    expect(mockReply.status).toHaveBeenCalledWith(400);
  });

  it('handles ValidationError with 422 status', async () => {
    class ValidationErrorHandler extends TestExpressRouteHandler {
      override async handler(_request: TestRequest): Promise<TestResponse> {
        throw new ValidationError({
          message: 'Validation failed',
          reason: 'test',
        });
      }
    }

    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new ValidationErrorHandler();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow(ValidationError);

    expect(mockReply.status).toHaveBeenCalledWith(422);
  });

  it('handles UnauthorizedError with 401 status', async () => {
    class UnauthorizedHandler extends TestExpressRouteHandler {
      override async handler(_request: TestRequest): Promise<TestResponse> {
        throw new UnauthorizedError({
          message: 'Unauthorized',
          reason: 'test',
        });
      }
    }

    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new UnauthorizedHandler();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow(UnauthorizedError);

    expect(mockReply.status).toHaveBeenCalledWith(401);
  });

  it('handles ForbiddenError with 403 status', async () => {
    class ForbiddenHandler extends TestExpressRouteHandler {
      override async handler(_request: TestRequest): Promise<TestResponse> {
        throw new ForbiddenError({
          message: 'Forbidden',
          reason: 'test',
        });
      }
    }

    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new ForbiddenHandler();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow(ForbiddenError);

    expect(mockReply.status).toHaveBeenCalledWith(403);
  });

  it('automatically maps Zacatl error types to correct status codes', async () => {
    const testCases = [
      { errorType: NotFoundError, code: 404 },
      { errorType: BadRequestError, code: 400 },
      { errorType: ValidationError, code: 422 },
      { errorType: UnauthorizedError, code: 401 },
      { errorType: ForbiddenError, code: 403 },
    ];

    for (const testCase of testCases) {
      const handlerClass = class extends TestExpressRouteHandler {
        override async handler(_request: TestRequest): Promise<TestResponse> {
          throw new (testCase.errorType as ZacatlErrorCtor)({
            message: 'Error',
            reason: 'test',
          });
        }
      };

      const mockRequest = createMockRequest();
      const mockReply = createMockReply();

      const handler = new handlerClass();

      await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow();
      expect(mockReply.status).toHaveBeenCalledWith(testCase.code);
    }
  });

  it('allows custom error handling via handleError override', async () => {
    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new ExpressHandlerWithCustomErrorHandling();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow(BadRequestError);

    expect(mockReply.status).toHaveBeenCalledWith(418);
    expect(mockReply.send).toHaveBeenCalledWith({
      type: 'CUSTOM_ERROR',
      message: 'Custom message',
    });
  });

  it('removes statusCode from error response before sending', async () => {
    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new ExpressHandlerThatThrowsNotFound();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow();

    // Verify that statusCode was not included in the sent data
    const sendCall = mockReply.send.mock.calls[0][0];
    expect(sendCall).not.toHaveProperty('statusCode');
  });

  it('sends statusCode 500 for unrecognized error types', async () => {
    class UnrecognizedErrorHandler extends TestExpressRouteHandler {
      override async handler(_request: TestRequest): Promise<TestResponse> {
        throw new Error('Unrecognized error type');
      }
    }

    const mockRequest = createMockRequest();
    const mockReply = createMockReply();

    const handler = new UnrecognizedErrorHandler();

    await expect(handler.execute(mockRequest, mockReply)).rejects.toThrow();

    expect(mockReply.status).toHaveBeenCalledWith(500);
  });

  it('does not send twice when response already sent', async () => {
    const mockRequest = createMockRequest();
    const mockReply = createMockReply({ headersSent: true });

    const handler = new TestExpressRouteHandler();

    await handler.execute(mockRequest, mockReply);

    // Should not call send since headersSent is true
    expect(mockReply.send).not.toHaveBeenCalled();
  });

  it('passes request to handler with correct context', async () => {
    const handlerSpy = vi.fn<(request: TestRequest) => void>();

    class SpyingHandler extends TestExpressRouteHandler {
      override async handler(request: TestRequest): Promise<TestResponse> {
        handlerSpy(request);
        return { id: 1, name: 'Test' };
      }
    }

    const mockRequest = createMockRequest({
      params: undefined,
      query: { search: 'test' },
      headers: { authorization: 'Bearer token' },
      body: undefined,
    });
    const mockReply = createMockReply();

    const handler = new SpyingHandler();

    await handler.execute(mockRequest, mockReply);

    expect(handlerSpy).toHaveBeenCalledWith(mockRequest);
  });

  describe('handler metadata', () => {
    it('should have correct url property', () => {
      const handler = new TestExpressRouteHandler();
      expect(handler.url).toBe('/test');
    });

    it('should have correct method property', () => {
      const handler = new TestExpressRouteHandler();
      expect(handler.method).toBe('GET');
    });

    it('should have schema property', () => {
      const handler = new TestExpressRouteHandler();
      expect(handler.schema).toBeDefined();
      expect(typeof handler.schema).toBe('object');
    });
  });
});
