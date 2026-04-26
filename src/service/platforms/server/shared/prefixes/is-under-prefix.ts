import { normalizePrefix } from './normalize-prefix';

/** True when `url` is the prefix itself or a path under it (`/api`, `/api/users`, `/api?x=1`). */
export const isUnderPrefix = (url: string, prefix: string): boolean => {
  const normalized = normalizePrefix(prefix);

  if (normalized === '') {
    return false;
  }

  return url === normalized || url.startsWith(`${normalized}/`) || url.startsWith(`${normalized}?`);
};
