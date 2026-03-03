/**
 * SOLID Principles ESLint Configuration for Zacatl
 *
 * Enforces architectural constraints that directly map to SOLID principles:
 *
 * SRP  (Single Responsibility)  — one class per file
 * ISP  (Interface Segregation)  — named exports only; callers import what they need
 * DIP  (Dependency Inversion)   — no circular imports, no undeclared dependencies
 *
 * OCP and LSP are supported structurally by the naming-conventions config (Abstract/Port
 * patterns) and by TypeScript's type system rather than lint rules here.
 *
 * Usage:
 * import { solidConfig } from "@sentzunhat/zacatl/eslint";
 * // or
 * import solidConfig from "@sentzunhat/zacatl/eslint/solid";
 *
 * export default [
 *   ...solidConfig,
 *   // ... additional configs
 * ];
 */

const solidConfig = [
  {
    files: ['src/**/*.ts'],
    rules: {
      // SRP — each file owns exactly one primary class responsibility
      'max-classes-per-file': ['error', 1],

      // ISP — named exports force callers to import only what they use;
      //        default exports make it too easy to import everything implicitly
      'import/no-default-export': 'error',

      // DIP — circular imports create tight coupling; all dependencies must flow one way
      'import/no-cycle': ['error', { maxDepth: Infinity }],

      // DIP — only declared dependencies may be used; transitive packages must be explicit
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
    },
  },

  // Relaxations for internal tooling modules that must use default exports
  // (third-party re-export files and .mjs ESLint configs are not consumer-facing classes)
  {
    files: ['src/third-party/**/*.ts', 'src/eslint/**/*.mjs'],
    rules: {
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, optionalDependencies: false, peerDependencies: true },
      ],
    },
  },
];

export default solidConfig;
export { solidConfig };
