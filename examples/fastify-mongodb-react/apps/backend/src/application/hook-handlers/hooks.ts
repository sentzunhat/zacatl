import type { HookHandler } from '@sentzunhat/zacatl/service';

import { SessionHookHandler } from './session/handler';

export const hookHandlers: Array<new () => HookHandler> = [SessionHookHandler];
