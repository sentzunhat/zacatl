import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPino, mockPinoInstance } = vi.hoisted(() => {
  const instance = {
    info: vi.fn(),
    trace: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  };

  const pinoFn = vi.fn().mockReturnValue(instance);

  return { mockPino: pinoFn, mockPinoInstance: instance };
});

vi.mock("pino", () => ({
  __esModule: true,
  default: mockPino,
}));

import { PinoLoggerAdapter } from "../../../src/logs/adapters/pino-adapter";

describe("PinoLoggerAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPino.mockReturnValue(mockPinoInstance);
  });

  it("initializes pino with provided config", () => {
    const config = { level: "debug" };
    new PinoLoggerAdapter(config);
    expect(mockPino).toHaveBeenCalledWith(config, undefined);
  });

  it("initializes pino with default config if none provided", () => {
    new PinoLoggerAdapter();
    expect(mockPino).toHaveBeenCalled();
  });

  it("initializes pino with destination if provided", () => {
    const dest: any = {};
    new PinoLoggerAdapter(undefined, dest);
    expect(mockPino).toHaveBeenCalledWith(expect.anything(), dest);
  });

  it("forwards structured payloads to pino", () => {
    const adapter = new PinoLoggerAdapter();
    const message = "test msg";
    const input = { data: { foo: "bar" }, details: "some details" };

    adapter.info(message, input);

    expect(mockPinoInstance.info).toHaveBeenCalledWith(
      { data: input.data, details: input.details },
      message,
    );
  });

  it("log calls info", () => {
    const adapter = new PinoLoggerAdapter();
    const message = "test msg";

    adapter.log(message);

    expect(mockPinoInstance.info).toHaveBeenCalledWith(
      { data: undefined, details: undefined },
      message,
    );
  });

  it("trace calls pino trace", () => {
    const adapter = new PinoLoggerAdapter();
    adapter.trace("trace msg");
    expect(mockPinoInstance.trace).toHaveBeenCalledWith(
      { data: undefined, details: undefined },
      "trace msg",
    );
  });

  it("warn calls pino warn", () => {
    const adapter = new PinoLoggerAdapter();
    adapter.warn("warn msg");
    expect(mockPinoInstance.warn).toHaveBeenCalledWith(
      { data: undefined, details: undefined },
      "warn msg",
    );
  });

  it("error calls pino error", () => {
    const adapter = new PinoLoggerAdapter();
    adapter.error("error msg");
    expect(mockPinoInstance.error).toHaveBeenCalledWith(
      { data: undefined, details: undefined },
      "error msg",
    );
  });

  it("fatal calls pino fatal", () => {
    const adapter = new PinoLoggerAdapter();
    adapter.fatal("fatal msg");
    expect(mockPinoInstance.fatal).toHaveBeenCalledWith(
      { data: undefined, details: undefined },
      "fatal msg",
    );
  });

  it("returns underlying pino instance", () => {
    const adapter = new PinoLoggerAdapter();
    expect(adapter.getPinoInstance()).toBe(mockPinoInstance);
  });
});
