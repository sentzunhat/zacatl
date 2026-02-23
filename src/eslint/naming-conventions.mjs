/**
 * ESLint naming convention rules for Zacatl ports/adapters.
 *
 * @returns Flat config object; no side effects.
 *
 * @example
 * import { namingConventions } from "@sentzunhat/zacatl/eslint";
 */

import tsEslintParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';

const namingConventionsConfig = {
  files: ['src/**/*.ts', '!src/**/*.d.ts'],
  languageOptions: {
    parser: tsEslintParser,
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  plugins: {
    '@typescript-eslint': tsEslintPlugin,
  },
  rules: {
    '@typescript-eslint/naming-convention': [
      'warn',
      // Type Aliases Naming Convention:
      // - PascalCase for all type aliases
      // - Common suffixes: Input, Output, Config, Options, Type, Document, Schema, Handler
      // - No prefix patterns (avoid T-prefix, I-prefix)
      // - Examples: CreateUserInput, UserOutput, ServerConfig, RouteHandler
      // Note: Suffix requirements are intentionally flexible to allow domain-specific naming

      // Exported interfaces - allow plain PascalCase names (no forced 'Port' suffix)
      {
        selector: 'interface',
        modifiers: ['exported'],
        format: ['PascalCase'],
      },
      // Configuration interfaces and data structures (no Port suffix)
      {
        selector: 'interface',
        modifiers: ['exported'],
        format: ['PascalCase'],
        suffix: ['Config', 'Options', 'Args', 'Info', 'Instance'],
        filter: {
          match: true,
          regex: '(Config|Options|Args|Info|Instance)$',
        },
      },
      // Error interfaces (Args suffix for error arguments)
      {
        selector: 'interface',
        modifiers: ['exported'],
        format: ['PascalCase'],
        suffix: ['Args'],
        filter: {
          match: true,
          regex: 'Error(s)?Args$',
        },
      },
      // Reject I-prefix pattern (anti-pattern)
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          match: false,
          regex: '^I[A-Z]',
        },
      },
      // Private/internal interfaces (allow more flexibility)
      {
        selector: 'interface',
        modifiers: [],
        format: ['PascalCase'],
      },

      // Classes (Adapters) - Hexagonal Architecture implementations
      // Adapters implementing Ports must have "Adapter" suffix
      {
        selector: 'class',
        modifiers: ['exported'],
        format: ['PascalCase'],
        suffix: ['Adapter'],
        filter: {
          match: true,
          regex:
            '(Fastify|Express|Mongoose|Sequelize|Pino|Console|Filesystem|Memory|Logger|Server|ORM|I18n|JSON|YAML|Config.*Loader).*Adapter$',
        },
      },
      // Abstract classes - allow Abstract prefix
      {
        selector: 'class',
        modifiers: ['abstract', 'exported'],
        format: ['PascalCase'],
        prefix: ['Abstract', 'Base'],
      },
      // Error classes - require Error suffix
      {
        selector: 'class',
        modifiers: ['exported'],
        format: ['PascalCase'],
        suffix: ['Error'],
        filter: {
          match: true,
          regex: 'Error$',
        },
      },
      // Service/Application/Infrastructure/Domain layers
      {
        selector: 'class',
        modifiers: ['exported'],
        format: ['PascalCase'],
        filter: {
          match: true,
          regex:
            '^(Service|Application|Infrastructure|Domain|CLI|Desktop|Server|PageModule|Provider)$',
        },
      },
      // Route handlers - require Handler suffix
      {
        selector: 'class',
        modifiers: ['exported'],
        format: ['PascalCase'],
        suffix: ['Handler'],
        filter: {
          match: true,
          regex: 'Handler$',
        },
      },
      // All other exported classes must follow PascalCase
      {
        selector: 'class',
        format: ['PascalCase'],
      },

      // Public methods - camelCase (Verb+Noun pattern allowed)
      {
        selector: ['method'],
        modifiers: ['public'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        filter: {
          match: false,
          regex: '^(constructor|readonly)',
        },
      },
      // Private methods - camelCase
      {
        selector: ['method'],
        modifiers: ['private'],
        format: ['camelCase'],
        filter: {
          match: false,
          regex: '^(constructor|readonly)',
        },
      },
      // Protected methods - same as public
      {
        selector: ['method'],
        modifiers: ['protected'],
        format: ['camelCase'],
      },

      // Function declarations - camelCase
      {
        selector: 'function',
        format: ['camelCase'],
      },

      // Variables and Parameters - camelCase
      {
        selector: ['variable', 'parameter'],
        format: ['camelCase'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
      },

      // Constants - camelCase or UPPER_CASE
      {
        selector: ['variable'],
        modifiers: ['const'],
        format: ['camelCase', 'UPPER_CASE'],
      },

      // Object properties - camelCase (allows underscores for destructured privates)
      {
        selector: 'objectLiteralProperty',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
        trailingUnderscore: 'allow',
        filter: {
          match: false,
          // Allow pure numeric keys (e.g. 200) and dotted keys consisting of
          // alphanumeric segments (e.g. "diego.beltran.is.best" or
          // "device.browser.fingerprint"). This keeps the rule strict for
          // normal identifiers while permitting status codes and dot-delimited
          // keys used as literal property names.
          regex: '(^\\d+$|^[A-Za-z0-9]+(\\.[A-Za-z0-9]+)+$)',
        },
      },

      // Enum members - UPPER_CASE
      {
        selector: 'enumMember',
        format: ['UPPER_CASE', 'PascalCase'],
      },

      // Type parameters (generics) - single uppercase letters or PascalCase
      {
        selector: 'typeParameter',
        format: ['PascalCase'],
      },
    ],

    // Additional rules to support method patterns
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],

    // Enforce consistent naming in imports
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
};

export default namingConventionsConfig;
export { namingConventionsConfig };
