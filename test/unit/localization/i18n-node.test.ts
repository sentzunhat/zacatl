import fs from 'fs';
import os from 'os';
import path from 'path';

import i18n from '@zacatl/third-party/i18n';
import { configureI18nNode } from '../../../src/localization/i18n-node';
import { afterEach, describe, expect, it } from 'vitest';

describe('configureI18nNode', () => {
  afterEach(() => {
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
});
