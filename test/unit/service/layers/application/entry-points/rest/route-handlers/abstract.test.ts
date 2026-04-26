import { describe, it, expect } from 'vitest';
import type { FastifyReply } from 'fastify';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../../../../../../../../src/error';
import type { Request } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import { AbstractRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import {
  createFakeFastifyReply,
  createFakeFastifyRequest,
} from '../../../../../../helpers/common/common';

type TestRequest = Request<void, Record<string, string>, void>;
type MockReply = {
  code: {
    (...args: unknown[]): unknown;
    mock: { calls: unknown[][] };
  };
  send: {
    (...args: unknown[]): unknown;
    mock: { calls: unknown[][] };
  };
};
type ExecuteReply = MockReply & FastifyReply;

class TestRouteHandler extends AbstractRouteHandler<
  void, // Body
  Record<string, string>, // Querystring
  { id: number; name: string }, // Response type
  void, // Params
  void // Headers
> {
  constructor() {
    super({
      url: '/test',
      schema: {},
      method: 'GET',
    });
  }

  async handler(
    _: Request<void, Record<string, string>, void>,
  ): Promise<{ id: number; name: string }> {
    return { id: 1, name: 'Test' };
  }
}

class HandlerThatThrowsNotFound extends TestRouteHandler {
  override async handler(_: Request<void, Record<string, string>, void>): Promise<{
    id: number;
    name: string;
  }> {
    throw new NotFoundError({
      message: 'Resource not found',
      reason: 'test',
    });
  }
}

class HandlerWithCustomErrorHandling extends TestRouteHandler {
  override async handler(_: Request<void, Record<string, string>, void>): Promise<{
    id: number;
    name: string;
  }> {
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

describe('AbstractRouteHandler', () => {
  it('auto-sends the handler response data directly', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new TestRouteHandler();
    const result = await handler.execute(fakeRequest, fakeReply);

    expect(result).toEqual({ id: 1, name: 'Test' });
    expect(fakeReply.send).toHaveBeenCalledWith({ id: 1, name: 'Test' });
  });

  it('handles NotFoundError with 404 status', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new HandlerThatThrowsNotFound();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow(NotFoundError);

    expect(fakeReply.code).toHaveBeenCalledWith(404);
    expect(fakeReply.send).toHaveBeenCalledWith({
      message: 'Resource not found',
    });
  });

  it('handles BadRequestError with 400 status', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new (class extends TestRouteHandler {
      override async handler(): Promise<{ id: number; name: string }> {
        throw new BadRequestError({
          message: 'Invalid request',
          reason: 'test',
        });
      }
    })();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow(BadRequestError);

    expect(fakeReply.code).toHaveBeenCalledWith(400);
    expect(fakeReply.send).toHaveBeenCalledWith({
      message: 'Invalid request',
    });
  });

  it('handles ValidationError with 422 status', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new (class extends TestRouteHandler {
      override async handler(): Promise<{ id: number; name: string }> {
        throw new ValidationError({
          message: 'Validation failed',
          reason: 'test',
        });
      }
    })();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow(ValidationError);

    expect(fakeReply.code).toHaveBeenCalledWith(422);
    expect(fakeReply.send).toHaveBeenCalledWith({
      message: 'Validation failed',
    });
  });

  it('handles UnauthorizedError with 401 status', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new (class extends TestRouteHandler {
      override async handler(): Promise<{ id: number; name: string }> {
        throw new UnauthorizedError({
          message: 'Unauthorized',
          reason: 'test',
        });
      }
    })();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow(UnauthorizedError);

    expect(fakeReply.code).toHaveBeenCalledWith(401);
    expect(fakeReply.send).toHaveBeenCalledWith({
      message: 'Unauthorized',
    });
  });

  it('handles ForbiddenError with 403 status', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new (class extends TestRouteHandler {
      override async handler(): Promise<{ id: number; name: string }> {
        throw new ForbiddenError({
          message: 'Forbidden',
          reason: 'test',
        });
      }
    })();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow(ForbiddenError);

    expect(fakeReply.code).toHaveBeenCalledWith(403);
    expect(fakeReply.send).toHaveBeenCalledWith({
      message: 'Forbidden',
    });
  });

  it('handles unknown errors with 500 status', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new (class extends TestRouteHandler {
      override async handler(): Promise<{ id: number; name: string }> {
        throw new Error('Unexpected error');
      }
    })();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow('Unexpected error');

    expect(fakeReply.code).toHaveBeenCalledWith(500);
    expect(fakeReply.send).toHaveBeenCalledWith({
      message: 'Something went wrong',
    });
  });

  it('allows overriding handleError() for custom error handling', async () => {
    const fakeRequest = createFakeFastifyRequest() as TestRequest;
    const fakeReply = createFakeFastifyReply() as ExecuteReply;

    const handler = new HandlerWithCustomErrorHandling();

    await expect(handler.execute(fakeRequest, fakeReply)).rejects.toThrow(BadRequestError);

    expect(fakeReply.code).toHaveBeenCalledWith(418);
    expect(fakeReply.send).toHaveBeenCalledWith({
      type: 'CUSTOM_ERROR',
      message: 'Custom message',
    });
  });
});
