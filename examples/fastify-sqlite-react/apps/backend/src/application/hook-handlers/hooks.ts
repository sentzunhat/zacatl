import type { HookHandler } from '@sentzunhat/zacatl';

import { SessionHookHandler } from './session/handler';

export const hookHandlers: Array<new () => HookHandler> = [SessionHookHandler];
