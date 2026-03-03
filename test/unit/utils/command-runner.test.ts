import { describe, it, expect } from 'vitest';

import {
  commandSpecSchema,
  runnerPolicySchema,
  validateCommandSpec,
  runCommand,
  executeCommands,
} from '../../../src/utils/command-runner';
import type { RunnerPolicy } from '../../../src/utils/command-runner';

const defaultPolicy = (): RunnerPolicy =>
  runnerPolicySchema.parse({
    timeoutMs: 5_000,
    maxOutputBytes: 64_000,
    inheritEnv: true,
  });

describe('commandSpecSchema', () => {
  it('should accept a minimal valid spec', () => {
    const result = commandSpecSchema.safeParse({ cmd: 'echo', args: ['hello'] });
    expect(result.success).toBe(true);
  });

  it('should default args to an empty array', () => {
    const result = commandSpecSchema.safeParse({ cmd: 'node' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.args).toEqual([]);
  });

  it('should reject an empty cmd', () => {
    const result = commandSpecSchema.safeParse({ cmd: '' });
    expect(result.success).toBe(false);
  });
});

describe('runnerPolicySchema', () => {
  it('should fill safe defaults', () => {
    const policy = runnerPolicySchema.parse({});
    expect(policy.timeoutMs).toBe(30_000);
    expect(policy.maxOutputBytes).toBe(1_048_576);
    expect(policy.maxConcurrency).toBe(4);
    expect(policy.inheritEnv).toBe(false);
  });

  it('should reject maxConcurrency below 1', () => {
    const result = runnerPolicySchema.safeParse({ maxConcurrency: 0 });
    expect(result.success).toBe(false);
  });
});

describe('validateCommandSpec()', () => {
  it('should pass for an allowed command', () => {
    const policy = defaultPolicy();
    policy.allowlist = ['echo', 'node'];
    expect(() => validateCommandSpec({ cmd: 'echo', args: ['hi'] }, policy)).not.toThrow();
  });

  it('should throw when cmd is not in the allowlist', () => {
    const policy = defaultPolicy();
    policy.allowlist = ['echo'];
    expect(() => validateCommandSpec({ cmd: 'rm', args: ['-rf'] }, policy)).toThrow();
  });

  it('should throw when an argument matches a deny pattern', () => {
    const policy = defaultPolicy();
    policy.denyPatterns = ['--upload-pack'];
    expect(() =>
      validateCommandSpec({ cmd: 'git', args: ['--upload-pack', '/tmp'] }, policy),
    ).toThrow();
  });

  it('should throw when an argument contains a shell metacharacter', () => {
    const policy = defaultPolicy();
    expect(() => validateCommandSpec({ cmd: 'echo', args: ['hello;world'] }, policy)).toThrow();
  });

  it('should throw when cwd violates cwdPrefix', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = '/safe/prefix';
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: '/tmp/evil' }, policy),
    ).toThrow();
  });

  it('should pass when cwd satisfies cwdPrefix', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = '/safe/prefix';
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: '/safe/prefix/project' }, policy),
    ).not.toThrow();
  });
});

describe('runCommand()', () => {
  it('should capture stdout', async () => {
    const result = await runCommand({ cmd: 'echo', args: ['hello'] }, defaultPolicy());
    expect(result.stdout.trim()).toBe('hello');
    expect(result.exitCode).toBe(0);
    expect(result.timedOut).toBe(false);
  });

  it('should capture a non-zero exit code', async () => {
    const result = await runCommand(
      { cmd: 'node', args: ['-e', 'process.exit(42)'] },
      defaultPolicy(),
    );
    expect(result.exitCode).toBe(42);
    expect(result.timedOut).toBe(false);
  });

  it('should capture stderr', async () => {
    const result = await runCommand(
      { cmd: 'node', args: ['-e', 'process.stderr.write("err-output")'] },
      defaultPolicy(),
    );
    expect(result.stderr).toContain('err-output');
  });

  it('should resolve with exitCode null for an unknown binary', async () => {
    const result = await runCommand(
      { cmd: '__nonexistent_binary_xyz__', args: [] },
      defaultPolicy(),
    );
    expect(result.exitCode).toBeNull();
  });

  it('should enforce timeout and set timedOut to true', async () => {
    const policy = runnerPolicySchema.parse({ timeoutMs: 200, inheritEnv: true });
    const result = await runCommand(
      { cmd: 'node', args: ['-e', 'setTimeout(function(){},10000)'] },
      policy,
    );
    expect(result.timedOut).toBe(true);
  }, 8_000);

  it('should reject when cmd is blocked by allowlist', async () => {
    const policy = runnerPolicySchema.parse({ allowlist: ['echo'], inheritEnv: true });
    await expect(runCommand({ cmd: 'rm', args: [] }, policy)).rejects.toThrow();
  });
});

describe('executeCommands()', () => {
  it('should return an empty array for no commands', async () => {
    const results = await executeCommands([], {});
    expect(results).toEqual([]);
  });

  it('should return results in input order', async () => {
    const cmds = [
      { cmd: 'echo', args: ['first'] },
      { cmd: 'echo', args: ['second'] },
      { cmd: 'echo', args: ['third'] },
    ];
    const results = await executeCommands(cmds, { inheritEnv: true });
    expect(results[0]?.stdout.trim()).toBe('first');
    expect(results[1]?.stdout.trim()).toBe('second');
    expect(results[2]?.stdout.trim()).toBe('third');
  });

  it('should complete all commands when bounded by maxConcurrency', async () => {
    const cmds = Array.from({ length: 6 }, (_, i) => ({
      cmd: 'echo',
      args: [String(i)],
    }));
    const results = await executeCommands(cmds, { maxConcurrency: 2, inheritEnv: true });
    expect(results).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(results[i]?.exitCode).toBe(0);
    }
  });

  it('should apply policy defaults when an empty policy object is given', async () => {
    const results = await executeCommands([{ cmd: 'echo', args: ['ok'] }], {});
    expect(results[0]?.exitCode).toBe(0);
  });
});
