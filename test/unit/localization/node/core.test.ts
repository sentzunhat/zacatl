import fs from 'fs';
import os from 'os';
import path from 'path';

import { describe, it, expect } from 'vitest';

import {
  loadStaticCatalog,
  mergeStaticCatalogs,
} from '../../../../src/localization/node/core';
import type { I18nStaticCatalogType } from '../../../../src/localization/node/types';

describe('i18n-node core', () => {
  it('loadStaticCatalog reads available locale files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-l10n-'));
    const en = path.join(tmp, 'en.json');
    fs.writeFileSync(en, JSON.stringify({ hi: 'hello' }), 'utf-8');
    // leave es missing to verify skip behavior

    const catalog = loadStaticCatalog({ localesDir: tmp, supportedLocales: ['en', 'es'] });
    expect(catalog['en']?.['hi']).toBe('hello');
    expect(catalog['es']).toBeUndefined();

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('mergeStaticCatalogs merges and respects overrideBuiltIn flag', () => {
    const base: I18nStaticCatalogType = { en: { a: 'base', nested: { x: 1 } }, fr: { z: 9 } };
    const addition1: I18nStaticCatalogType = { en: { a: 'app', b: 'new' } };
    const addition2: I18nStaticCatalogType = {
      en: { nested: { x: 2, y: 3 } },
      es: { hello: 'hola' },
    };

    const mergedOverride = mergeStaticCatalogs({
      base,
      additions: [addition1, addition2],
      overrideBuiltIn: true,
    });
    // when overrideBuiltIn = true, base keys are overridden by additions
    expect(mergedOverride['en']?.['a']).toBe('app');
    expect(mergedOverride['en']?.['b']).toBe('new');
    expect(mergedOverride['es']?.['hello']).toBe('hola');

    const mergedNoOverride = mergeStaticCatalogs({
      base,
      additions: [addition1, addition2],
      overrideBuiltIn: false,
    });
    // when overrideBuiltIn = false, base keys take precedence
    expect(mergedNoOverride['en']?.['a']).toBe('base');
    expect(mergedNoOverride['en']?.['b']).toBe('new');
  });
});
