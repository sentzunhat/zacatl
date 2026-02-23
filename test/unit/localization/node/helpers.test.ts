import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { BadRequestError } from '@zacatl/error';
import {
  isPlainObject,
  deepMerge,
  readJsonFile,
  findExistingDir,
} from '@zacatl/localization/node/helpers';

describe('i18n-node helpers', () => {
  it('isPlainObject detects plain objects correctly', () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject('string')).toBe(false);
    expect(isPlainObject(123)).toBe(false);
  });

  it('deepMerge merges nested objects and overrides primitives', () => {
    const base = { a: 1, b: { x: 1, y: 2 }, c: { nested: { val: 1 } } };
    const override = { a: 2, b: { y: 3 }, c: { nested: { val: 2 } }, d: 4 };

    const merged = deepMerge(base as any, override as any) as any;
    expect(merged['a']).toBe(2);
    expect(merged['b']['x']).toBe(1);
    expect(merged['b']['y']).toBe(3);
    expect(merged['c']['nested']['val']).toBe(2);
    expect(merged['d']).toBe(4);
  });

  it('readJsonFile returns object when JSON file contains an object', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-test-'));
    const file = path.join(tmp, 'en.json');
    fs.writeFileSync(file, JSON.stringify({ hello: 'world' }), 'utf-8');

    const parsed = readJsonFile(file) as any;
    expect(parsed['hello']).toBe('world');

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('readJsonFile throws BadRequestError for non-object JSON', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-test-'));
    const file = path.join(tmp, 'arr.json');
    fs.writeFileSync(file, JSON.stringify([1, 2, 3]), 'utf-8');

    expect(() => readJsonFile(file)).toThrow(BadRequestError);

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('findExistingDir returns first existing directory or null', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-test-'));
    const other = path.join(tmp, 'other');
    fs.mkdirSync(other);

    const candidates = [path.join(tmp, 'nope'), other, tmp];
    const found = findExistingDir(candidates);
    expect(found).toBe(other);

    fs.rmSync(tmp, { recursive: true, force: true });
  });
});
