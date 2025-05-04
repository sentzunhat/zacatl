import { describe, it, expect } from "vitest";
import { container } from "tsyringe";

import {
  Domain,
  ConfigDomain,
} from "../../../../../src/micro-service/architecture/domain";

class DummyProvider {
  public value = "dummy";
}

class AnotherDummyProvider {
  public name = "AnotherDummy";
}

describe("Domain", () => {
  it("should register the provided domain providers in the DI container", () => {
    const config: ConfigDomain = {
      providers: [DummyProvider, AnotherDummyProvider],
    };

    const domain = new Domain(config);

    domain.start();

    const resolvedDummy = container.resolve(DummyProvider);
    const resolvedAnother = container.resolve(AnotherDummyProvider);

    expect(resolvedDummy).toBeInstanceOf(DummyProvider);
    expect(resolvedAnother).toBeInstanceOf(AnotherDummyProvider);
    expect(resolvedDummy.value).toBe("dummy");
    expect(resolvedAnother.name).toBe("AnotherDummy");
  });
});
