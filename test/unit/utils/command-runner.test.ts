import { mkdtempSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { commandSpecSchema, runnerPolicySchema } from '../../../src/utils/command-runner/types';
import type { RunnerPolicy } from '../../../src/utils/command-runner/types';
import { validateCommandSpec } from '../../../src/utils/command-runner/policy';
import { runCommand } from '../../../src/utils/command-runner/runner';
import { executeCommands } from '../../../src/utils/command-runner/execute-commands';

const defaultPolicy = (): RunnerPolicy =>
  runnerPolicySchema.parse({
    timeoutMs: 5_000,
    maxOutputBytes: 64_000,
    inheritEnv: true,
    allowlist: ['echo', 'node', 'git', '__nonexistent_binary_xyz__'],
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
    expect(policy.allowUnrestrictedCommands).toBe(false);
  });

  it('should reject maxConcurrency below 1', () => {
    const result = runnerPolicySchema.safeParse({ maxConcurrency: 0 });
    expect(result.success).toBe(false);
  });
});

describe('validateCommandSpec()', () => {
  let allowedRoot: string;
  let allowedChild: string;
  let siblingRoot: string;
  let symlinkEscape: string;
  let testRoot: string;

  beforeAll(() => {
    testRoot = mkdtempSync(join(tmpdir(), 'zacatl-command-runner-'));
    allowedRoot = join(testRoot, 'allowed');
    allowedChild = join(allowedRoot, 'child');
    siblingRoot = join(testRoot, 'allowed-sibling');
    symlinkEscape = join(allowedRoot, 'escape-link');
    mkdirSync(allowedChild, { recursive: true });
    mkdirSync(siblingRoot);
    symlinkSync(siblingRoot, symlinkEscape, 'dir');
  });

  afterAll(() => {
    rmSync(testRoot, { recursive: true, force: true });
  });

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

  it('should throw when the allowlist is missing', () => {
    const policy = runnerPolicySchema.parse({});
    expect(() => validateCommandSpec({ cmd: 'echo', args: [] }, policy)).toThrow(
      'requires a non-empty allowlist',
    );
  });

  it('should throw when the allowlist is empty', () => {
    const policy = runnerPolicySchema.parse({ allowlist: [] });
    expect(() => validateCommandSpec({ cmd: 'echo', args: [] }, policy)).toThrow(
      'requires a non-empty allowlist',
    );
  });

  it('should permit trusted callers to opt into unrestricted executables', () => {
    const policy = runnerPolicySchema.parse({ allowUnrestrictedCommands: true });
    expect(() => validateCommandSpec({ cmd: 'echo', args: ['safe'] }, policy)).not.toThrow();
  });

  it('should still enforce argument checks in unrestricted mode', () => {
    const policy = runnerPolicySchema.parse({ allowUnrestrictedCommands: true });
    expect(() => validateCommandSpec({ cmd: 'echo', args: ['unsafe;arg'] }, policy)).toThrow();
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
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: siblingRoot }, policy),
    ).toThrow();
  });

  it('should pass when cwd satisfies cwdPrefix', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: allowedChild }, policy),
    ).not.toThrow();
  });

  it('should pass when cwd is the exact allowed root', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: allowedRoot }, policy),
    ).not.toThrow();
  });

  it('should reject sibling paths sharing the allowed root prefix', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: siblingRoot }, policy),
    ).toThrow('outside the allowed root');
  });

  it('should reject traversal outside the allowed root', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: join(allowedRoot, '..') }, policy),
    ).toThrow('outside the allowed root');
  });

  it('should resolve relative cwd values before checking containment', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    const relativeChild = relative(process.cwd(), allowedChild);
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: relativeChild }, policy),
    ).not.toThrow();
  });

  it('should reject symlinks that escape the allowed root', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: symlinkEscape }, policy),
    ).toThrow('outside the allowed root');
  });

  it('should reject cwd values whose containment cannot be verified', () => {
    const policy = defaultPolicy();
    policy.cwdPrefix = allowedRoot;
    expect(() =>
      validateCommandSpec({ cmd: 'echo', args: [], cwd: join(allowedRoot, 'missing') }, policy),
    ).toThrow('containment could not be verified');
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
    const policy = runnerPolicySchema.parse({
      timeoutMs: 200,
      inheritEnv: true,
      allowlist: ['node'],
    });
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
    const results = await executeCommands(cmds, { allowlist: ['echo'], inheritEnv: true });
    expect(results[0]?.stdout.trim()).toBe('first');
    expect(results[1]?.stdout.trim()).toBe('second');
    expect(results[2]?.stdout.trim()).toBe('third');
  });

  it('should complete all commands when bounded by maxConcurrency', async () => {
    const cmds = Array.from({ length: 6 }, (_, i) => ({
      cmd: 'echo',
      args: [String(i)],
    }));
    const results = await executeCommands(cmds, {
      allowlist: ['echo'],
      maxConcurrency: 2,
      inheritEnv: true,
    });
    expect(results).toHaveLength(6);
    for (let i = 0; i < 6; i++) {
      expect(results[i]?.exitCode).toBe(0);
    }
  });

  it('should reject execution when the allowlist is missing', async () => {
    await expect(executeCommands([{ cmd: 'echo', args: ['blocked'] }], {})).rejects.toThrow(
      'requires a non-empty allowlist',
    );
  });

  it('should execute when unrestricted mode is explicitly enabled', async () => {
    const results = await executeCommands(
      [{ cmd: 'echo', args: ['ok'] }],
      { allowUnrestrictedCommands: true },
    );
    expect(results[0]?.exitCode).toBe(0);
  });
});
