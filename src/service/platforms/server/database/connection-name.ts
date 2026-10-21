/**
 * Normalize the omitted connection name and explicit vendor-default name to
 * the same identity used by the ORM token.
 */
export const normalizeConnectionName = (vendor: string, connectionName?: string): string =>
  connectionName == null || connectionName === vendor ? vendor : connectionName;
