/**
 * ProcessProvider
 * Handles execution of shell commands and scripts
 * Useful for CLI tools that need to execute system commands (SSH, Docker, etc.)
 */
import { exec, spawn } from "child_process";
import { promisify } from "util";
import { CustomError } from "../../error";

const execAsync = promisify(exec);

export interface ProcessProviderConfig {
  shell?: string;
  timeout?: number; // milliseconds
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  success: boolean;
}

export class ProcessProvider {
  private shell: string;
  private timeout: number;

  constructor(config: ProcessProviderConfig = {}) {
    this.shell = config.shell || "/bin/bash";
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Execute a shell command and return result
   */
  async execute(command: string): Promise<CommandResult> {
    try {
      const { stdout, stderr } = await execAsync(command, {
        timeout: this.timeout,
        shell: this.shell,
      });

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        exitCode: 0,
        success: true,
      };
    } catch (error: unknown) {
      const err = error as any;

      throw new CustomError({
        message: `Command execution failed: ${command}`,
        code: 500,
        reason: "process execution error",
        error: err,
        metadata: {
          command,
          stdout: err.stdout || "",
          stderr: err.stderr || "",
        },
      });
    }
  }

  /**
   * Execute a command and return result with exit code
   */
  async executeWithStatus(command: string): Promise<CommandResult> {
    return new Promise((resolve) => {
      exec(
        command,
        { timeout: this.timeout, shell: this.shell },
        (error, stdout, stderr) => {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: error?.code || 0,
            success: !error,
          });
        },
      );
    });
  }

  /**
   * Stream output from a long-running command
   * Useful for real-time output from deployments
   */
  async executeStream(
    command: string,
    onStdout?: (data: string) => void,
    onStderr?: (data: string) => void,
  ): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      try {
        const child = spawn(command, [], {
          shell: this.shell,
          timeout: this.timeout,
        });

        let stdout = "";
        let stderr = "";

        child.stdout.on("data", (data) => {
          const text = data.toString();
          stdout += text;
          onStdout?.(text);
        });

        child.stderr.on("data", (data) => {
          const text = data.toString();
          stderr += text;
          onStderr?.(text);
        });

        child.on("close", (code) => {
          resolve({
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            exitCode: code || 0,
            success: code === 0,
          });
        });

        child.on("error", (error) => {
          reject(
            new CustomError({
              message: `Process error: ${command}`,
              code: 500,
              reason: "process stream error",
              error,
              metadata: { command, stderr },
            }),
          );
        });
      } catch (error: unknown) {
        reject(
          new CustomError({
            message: `Failed to spawn process: ${command}`,
            code: 500,
            reason: "process spawn error",
            error: error as Error,
            metadata: { command },
          }),
        );
      }
    });
  }
}
