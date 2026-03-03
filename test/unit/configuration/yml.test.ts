import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { describe, it, expect, afterEach } from 'vitest';


import { loadYML, loadYAML } from '@zacatl/configuration';
import { BadRequestError, NotFoundError, ValidationError } from '@zacatl/error';
import { z } from '@zacatl/third-party/zod';

const tmp = (name: string): string => join(tmpdir(), `zacatl-yml-test-${name}`);

describe('loadYML()', () => {
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

  it('parses a valid YAML file and returns its data', () => {
    const path = write('valid.yml', 'name: zacatl\nversion: 1\n');
    expect(loadYML(path)).toEqual({ name: 'zacatl', version: 1 });
  });

  it('parses nested YAML structures', () => {
    const path = write('nested.yml', 'server:\n  port: 3000\n  host: localhost\n');
    expect(loadYML(path)).toEqual({ server: { port: 3000, host: 'localhost' } });
  });

  it('validates data against a Zod schema and returns typed result', () => {
    const schema = z.object({ port: z.number() });
    const path = write('schema-valid.yml', 'port: 8080\n');
    const result = loadYML(path, schema);
    expect(result).toEqual({ port: 8080 });
  });

  it('throws ValidationError when data fails Zod schema', () => {
    const schema = z.object({ port: z.number() });
    const path = write('schema-fail.yml', 'port: "not-a-number"\n');
    expect(() => loadYML(path, schema)).toThrowError(ValidationError);
  });

  it('throws NotFoundError for a non-existent file', () => {
    expect(() => loadYML('/no/such/file.yml')).toThrowError(NotFoundError);
  });

  it('throws BadRequestError for malformed YAML', () => {
    const path = write('bad.yml', 'key: [\nbad yaml\n');
    expect(() => loadYML(path)).toThrowError(BadRequestError);
  });
});

describe('loadYAML()', () => {
  it('is an alias for loadYML', () => {
    expect(loadYAML).toBe(loadYML);
  });
});
