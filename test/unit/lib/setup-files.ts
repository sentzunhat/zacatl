import "reflect-metadata";

import { afterEach, beforeEach, vi } from "vitest";

// Mock the logger to avoid Pino diagnostics_channel issues in tests
vi.mock("../../../src/logs/logger", () => ({
  logger: {
    log: vi.fn(),
    info: vi.fn(),
    trace: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
  defaultLogger: {
    info: vi.fn(),
    trace: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

// Polyfill for File (needed by undici in Node.js environment)
if (typeof globalThis.File === "undefined") {
  globalThis.File = class File extends Blob {
    name: string;
    constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
      super(bits, options);
      this.name = name;
      Object.defineProperty(this, "name", {
        value: name,
        writable: false,
        enumerable: true,
        configurable: false,
      });
    }
  } as any;
}

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
