/**
 * File Naming Convention Rules for Zacatl
 *
 * Enforces Hexagonal Architecture naming patterns for files:
 * - Port files: *-port.ts (e.g., user-repository-port.ts, email-service-port.ts)
 * - Adapter files: *-adapter.ts (e.g., mongo-user-repository-adapter.ts)
 * - Regular files: kebab-case (e.g., user-service.ts, greeting-handler.ts)
 *
 * Usage:
 * import fileNamingRules from "@sentzunhat/zacatl/eslint/file-naming";
 *
 * export default [
 *   fileNamingRules,
 *   // ... other configs
 * ];
 */

/**
 * File naming convention rules using regex patterns
 * Custom rule implementation for ESLint
 */
const fileNamingRules = {
  files: ["src/**/*.ts", "!src/**/*.d.ts"],
  rules: {
    /**
     * Enforce: Files containing Port interface/type must end with -port.ts
     *
     * Example patterns:
     * ✅ user-repository-port.ts (contains: UserRepositoryPort)
     * ✅ email-service-port.ts (contains: EmailServicePort)
     * ❌ user-repository.ts (contains: UserRepositoryPort) - WRONG!
     *
     * NOTE: This rule requires a custom ESLint rule plugin.
     * If your project uses eslint-plugin-filenames or similar, configure:
     */
    "filenames/match-regex": [
      "off", // Disabled by default - requires external plugin
      "^[a-z]([a-z0-9-]*[a-z0-9])?(\\.port|\\.adapter)?\\.ts$",
      true,
    ],
  },
};

/**
 * Alternative: Manual documentation comment for file patterns
 * Add to .eslintignore or project documentation:
 *
 * FILE NAMING RULES
 *
 * 1. Port/Interface files must end with: -port.ts
 *    Pattern: *-port.ts
 *    Contains: interface NamePort, interface NameRepositoryPort
 *    Examples: user-repository-port.ts, email-service-port.ts
 *
 * 2. Adapter/Implementation files must end with: -adapter.ts
 *    Pattern: *-adapter.ts
 *    Contains: class NameAdapter, class MongoUserRepositoryAdapter
 *    Examples: mongo-user-repository-adapter.ts, sendgrid-email-adapter.ts
 *
 * 3. Regular implementation files: kebab-case
 *    Pattern: *.ts
 *    Examples: user-service.ts, greeting-handler.ts, config.ts
 *
 * 4. Type/Model files: kebab-case
 *    Pattern: *.ts
 *    Examples: user-types.ts, greeting-model.ts
 *
 * ENFORCEMENT:
 * - ESLint rule: @zacatl/file-naming (custom rule)
 * - IDE plugins: Path Intellisense, ESLint extension
 * - Pre-commit: husky + lint-staged
 */

export default fileNamingRules;
export { fileNamingRules };
