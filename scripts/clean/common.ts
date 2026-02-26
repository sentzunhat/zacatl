#!/usr/bin/env -S node
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { spawnSync } from 'child_process';

export function removeDir(target: string) {
  try {
    fs.rmSync(target, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
}

export function walk(dir: string, cb: (filePath: string, stat: fs.Stats) => void) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    const stat = fs.statSync(full);
    cb(full, stat);
    if (stat.isDirectory()) walk(full, cb);
  }
}

export function confirm(prompt: string) {
  return new Promise<boolean>((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, (ans) => {
      rl.close();
      resolve(ans === 'yes' || ans === 'y');
    });
  });
}

export function runQuiet(command: string, args: string[] = []) {
  try {
    spawnSync([command, ...args].join(' '), { stdio: 'ignore', shell: true });
  } catch (_) {
    // ignore
  }
}

export function ensureDir(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export default {
  removeDir,
  walk,
  confirm,
  runQuiet,
  ensureDir,
};
