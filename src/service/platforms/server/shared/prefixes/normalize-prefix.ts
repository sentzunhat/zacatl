/** Normalize a route prefix: ensure one leading slash, strip the trailing slash. `''` and `'/'` mean no prefix. */
export const normalizePrefix = (prefix: string): string => {
  if (prefix === '' || prefix === '/') {
    return '';
  }

  const withSlash = prefix.startsWith('/') ? prefix : `/${prefix}`;

  return withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
};
