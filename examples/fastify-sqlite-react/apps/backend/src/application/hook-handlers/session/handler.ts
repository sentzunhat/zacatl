import { singleton } from '@sentzunhat/zacatl/third-party/tsyringe';
import type { HookHandler } from '@sentzunhat/zacatl';

/**
 * Minimal session hook example.
 *
 * Adds a stable response header for request/session correlation.
 */
@singleton()
export class SessionHookHandler implements HookHandler {
  public readonly name = 'onRequest' as const;

  public execute: HookHandler['execute'] = async (request, reply) => {
    reply.header('x-session-id', request.id);
  };
}
