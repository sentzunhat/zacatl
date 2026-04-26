export const logger = {
  log: (input: {
    level: 'info' | 'error' | 'warn' | 'debug';
    action: string;
    msg: string;
  }): void => {
    const line = `🧪 [${input.action}] unit tests - ${input.msg}\n`;
    if (input.level === 'error' || input.level === 'warn') {
      process.stderr.write(line);
      return;
    }
    process.stdout.write(line);
  },
};
