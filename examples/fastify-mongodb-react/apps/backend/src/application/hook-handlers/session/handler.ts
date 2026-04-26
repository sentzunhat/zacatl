import { singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { HookHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/hook-handlers/hook-handler';

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
