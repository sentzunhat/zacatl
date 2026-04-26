import type { FastifyRequest } from '@zacatl/third-party/fastify';

export const createFakeFastifyRequest = (): Partial<FastifyRequest> => ({
  id: 'req-1',
  params: {},
  // raw: {},
  query: {},
  headers: {},
  // log: {
  //   info: vi.fn(),
  //   error: vi.fn(),
  // },
  server: {} as unknown as FastifyRequest['server'],
  body: {},
  // If your code calls these methods, stub them as needed.
  getValidationFunction: vi.fn(),
  compileValidationSchema: vi.fn(),
  validateInput: vi.fn(),
});

// Create a fake FastifyReply object. It mocks the 'code' and 'send' methods.
export const createFakeFastifyReply = (): unknown => {
  const reply: Record<string, unknown> = {
    code: vi.fn().mockImplementation(function (this: Record<string, unknown>, code: number) {
      // Save the code for potential additional assertions.
      this['calledCode'] = code;
      return this;
    }),
    send: vi.fn().mockResolvedValue(undefined),
  };
  return reply;
};
