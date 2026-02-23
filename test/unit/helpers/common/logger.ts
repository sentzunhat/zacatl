export const logger = {
  log: (input: { level: 'info' | 'error' | 'warn' | 'debug'; action: string; msg: string }): void =>
    console[input.level](`🧪 [${input.action}] unit tests - ${input.msg}`),
};
