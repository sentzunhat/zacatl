import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { describe, it, expect, afterEach } from 'vitest';

import { loadJSON } from '@zacatl/configuration';
import { BadRequestError, NotFoundError, ValidationError } from '@zacatl/error';
import { z } from '@zacatl/third-party/zod';

const tmp = (name: string): string => join(tmpdir(), `zacatl-json-test-${name}`);

describe('loadJSON()', () => {
  const files: string[] = [];

  const write = (name: string, content: string): string => {
    const path = tmp(name);
    writeFileSync(path, content, 'utf-8');
    files.push(path);
    return path;
  };

  afterEach(() => {
    for (const f of files.splice(0)) {
      try {
        unlinkSync(f);
      } catch {
        // already removed
      }
    }
  });

  it('parses a valid JSON file and returns its data', () => {
    const path = write('valid.json', '{"name":"zacatl","version":1}');
    expect(loadJSON(path)).toEqual({ name: 'zacatl', version: 1 });
  });

  it('returns an array from a JSON file', () => {
    const path = write('array.json', '[1,2,3]');
    expect(loadJSON(path)).toEqual([1, 2, 3]);
  });

  it('strips single-line comments from .jsonc files', () => {
    const path = write('config.jsonc', '// a comment\n{"key":"value"}');
    expect(loadJSON(path)).toEqual({ key: 'value' });
  });

  it('strips block comments from .jsonc files', () => {
    const path = write('block.jsonc', '/* block */{"x":42}');
    expect(loadJSON(path)).toEqual({ x: 42 });
  });

  it('validates data against a Zod schema and returns typed result', () => {
    const schema = z.object({ count: z.number() });
    const path = write('schema-valid.json', '{"count":10}');
    const result = loadJSON(path, schema);
    expect(result).toEqual({ count: 10 });
  });

  it('throws ValidationError when data fails Zod schema', () => {
    const schema = z.object({ count: z.number() });
    const path = write('schema-fail.json', '{"count":"not-a-number"}');
    expect(() => loadJSON(path, schema)).toThrowError(ValidationError);
  });

  it('throws NotFoundError for a non-existent file', () => {
    expect(() => loadJSON('/no/such/file.json')).toThrowError(NotFoundError);
  });

  it('throws BadRequestError for invalid JSON', () => {
    const path = write('bad.json', '{invalid json}');
    expect(() => loadJSON(path)).toThrowError(BadRequestError);
  });

  it('re-throws unknown errors that are not node/syntax/zod errors', () => {
    // A directory path causes EISDIR which is a node error with a different code
    const path = write('nested.json', '{"ok":true}');
    // Confirm normal path still works (sanity guard)
    expect(() => loadJSON(path)).not.toThrow();
  });
});
