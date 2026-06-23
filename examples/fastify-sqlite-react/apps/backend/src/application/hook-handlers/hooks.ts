import type { HookHandler } from '@zacatl/service';

import { SessionHookHandler } from './session/handler';

export const hookHandlers: Array<new () => HookHandler> = [SessionHookHandler];
