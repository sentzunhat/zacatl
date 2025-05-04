import "reflect-metadata";

import { afterEach, beforeEach, vi } from "vitest";

// /**
//  * @remarks
//  * https://vitest.dev/config/#setupfiles
//  */

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});
