import type { HookHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/hook-handlers/hook-handler';

import { SessionHookHandler } from './session/handler';

export const hookHandlers: Array<new () => HookHandler> = [SessionHookHandler];
