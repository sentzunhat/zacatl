import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

import { loadStaticCatalog, mergeStaticCatalogs } from '@zacatl/localization/node/core';

describe('i18n-node core', () => {
  it('loadStaticCatalog reads available locale files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zacatl-l10n-'));
    const en = path.join(tmp, 'en.json');
    fs.writeFileSync(en, JSON.stringify({ hi: 'hello' }), 'utf-8');
    // leave es missing to verify skip behavior

    const catalog = loadStaticCatalog({ localesDir: tmp, supportedLocales: ['en', 'es'] }) as any;
    expect(catalog['en'] && catalog['en']['hi']).toBe('hello');
    expect(catalog['es']).toBeUndefined();

    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('mergeStaticCatalogs merges and respects overrideBuiltIn flag', () => {
    const base = { en: { a: 'base', nested: { x: 1 } }, fr: { z: 9 } };
    const addition1 = { en: { a: 'app', b: 'new' } };
    const addition2 = { en: { nested: { x: 2, y: 3 } }, es: { hello: 'hola' } };

    const mergedOverride = mergeStaticCatalogs({
      base: base as any,
      additions: [addition1 as any, addition2 as any],
      overrideBuiltIn: true,
    });
    // when overrideBuiltIn = true, base keys are overridden by additions
    expect((mergedOverride as any)['en']['a']).toBe('app');
    expect((mergedOverride as any)['en']['b']).toBe('new');
    expect((mergedOverride as any)['es']['hello']).toBe('hola');

    const mergedNoOverride = mergeStaticCatalogs({
      base: base as any,
      additions: [addition1 as any, addition2 as any],
      overrideBuiltIn: false,
    });
    // when overrideBuiltIn = false, base keys take precedence
    expect((mergedNoOverride as any)['en']['a']).toBe('base');
    expect((mergedNoOverride as any)['en']['b']).toBe('new');
  });
});
