import fs from 'fs';
import os from 'os';
import path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import i18n from '@zacatl/third-party/i18n';

import { configureI18nNode, resolveBuiltInLocalesDir } from '../../../src/localization/i18n-node';

describe('configureI18nNode', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    i18n.setLocale('en');
  });

  it('uses builtInLocalesDir when provided', () => {
    const localesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-i18n-locales-'));

    fs.writeFileSync(
      path.join(localesDir, 'en.json'),
      JSON.stringify({ customOnly: 'custom-value' }),
      'utf-8',
    );

    try {
      configureI18nNode({
        builtInLocalesDir: localesDir,
        locales: {
          default: 'en',
          supported: ['en'],
        },
      });

      expect(i18n.__('customOnly')).toBe('custom-value');
    } finally {
      fs.rmSync(localesDir, { recursive: true, force: true });
    }
  });

  it('resolves project-level localization/locales from cwd', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-project-'));
    const localesDir = path.join(projectRoot, 'localization', 'locales');

    fs.mkdirSync(localesDir, { recursive: true });

    try {
      const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectRoot);
      const existsSpy = vi.spyOn(fs, 'existsSync').mockImplementation((candidate) => {
        return typeof candidate === 'string' && candidate === localesDir;
      });
      const statSpy = vi.spyOn(fs, 'statSync').mockImplementation((candidate) => {
        const isTarget = typeof candidate === 'string' && candidate === localesDir;
        return { isDirectory: () => isTarget } as unknown as fs.Stats;
      });

      const resolved = resolveBuiltInLocalesDir();

      expect(resolved).toBe(localesDir);

      cwdSpy.mockRestore();
      existsSpy.mockRestore();
      statSpy.mockRestore();
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('prefers project locale keys over built-in keys by default', () => {
    const builtInDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-built-in-'));
    const projectDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-project-locales-'));

    fs.writeFileSync(
      path.join(builtInDir, 'en.json'),
      JSON.stringify({ greeting: 'Hello', nested: { tone: 'formal' } }),
      'utf-8',
    );

    fs.writeFileSync(
      path.join(projectDir, 'en.json'),
      JSON.stringify({ greeting: 'Howdy', nested: { tone: 'casual' } }),
      'utf-8',
    );

    try {
      configureI18nNode({
        builtInLocalesDir: builtInDir,
        locales: {
          default: 'en',
          supported: ['en'],
          directories: [projectDir],
        },
      });

      expect(i18n.__('greeting')).toBe('Howdy');
      expect(i18n.__('nested.tone')).toBe('casual');
    } finally {
      fs.rmSync(builtInDir, { recursive: true, force: true });
      fs.rmSync(projectDir, { recursive: true, force: true });
    }
  });

  it('loads and merges nested locale files discovered across services', () => {
    const projectRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-services-root-'));
    const builtInDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-built-in-locales-'));
    const serviceALocales = path.join(projectRoot, 'services', 'alpha', 'locales');
    const serviceBLocales = path.join(projectRoot, 'services', 'beta', 'src', 'locales');

    fs.mkdirSync(serviceALocales, { recursive: true });
    fs.mkdirSync(serviceBLocales, { recursive: true });
    fs.mkdirSync(path.join(serviceALocales, 'en', 'errors'), { recursive: true });
    fs.mkdirSync(path.join(serviceBLocales, 'en', 'messages'), { recursive: true });

    fs.writeFileSync(
      path.join(builtInDir, 'en.json'),
      JSON.stringify({ fallback: 'built-in-value', greeting: 'Hello' }),
      'utf-8',
    );
    fs.writeFileSync(
      path.join(serviceALocales, 'en', 'errors', 'index.json'),
      JSON.stringify({ notFound: 'Not found from alpha' }),
      'utf-8',
    );
    fs.writeFileSync(
      path.join(serviceBLocales, 'en', 'messages', 'welcome.json'),
      JSON.stringify({ title: 'Welcome from beta' }),
      'utf-8',
    );

    try {
      const cwdSpy = vi.spyOn(process, 'cwd').mockReturnValue(projectRoot);

      configureI18nNode({
        builtInLocalesDir: builtInDir,
        locales: {
          default: 'en',
          supported: ['en'],
        },
      });

      expect(i18n.__('fallback')).toBe('built-in-value');
      expect(i18n.__('errors.notFound')).toBe('Not found from alpha');
      expect(i18n.__('messages.welcome.title')).toBe('Welcome from beta');

      cwdSpy.mockRestore();
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
      fs.rmSync(builtInDir, { recursive: true, force: true });
    }
  });

  it('uses explicit service locales even when built-in locales are missing', () => {
    const serviceLocales = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-service-locales-'));

    fs.writeFileSync(
      path.join(serviceLocales, 'en.json'),
      JSON.stringify({ fromService: 'service-value' }),
      'utf-8',
    );

    try {
      configureI18nNode({
        builtInLocalesDir: path.join(serviceLocales, 'missing-built-in'),
        locales: {
          default: 'en',
          supported: ['en'],
          directories: [serviceLocales],
        },
      });

      expect(i18n.__('fromService')).toBe('service-value');
    } finally {
      fs.rmSync(serviceLocales, { recursive: true, force: true });
    }
  });
});
