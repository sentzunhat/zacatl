import { container } from "tsyringe";
import {
  ConfigInfrastructure,
  Infrastructure,
} from "../../../../../src/service/layers/infrastructure";

class DummyRepository {}

const config: ConfigInfrastructure = {
  repositories: [DummyRepository],
};

describe("Infrastructure", () => {
  let infrastructure: Infrastructure;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should store the configuration passed in the constructor", () => {
    infrastructure = new Infrastructure(config);
    expect(infrastructure["config"]).toEqual(config);
  });

  it("should register dependencies on construction (new pattern)", () => {
    const registerSpy = vi.spyOn(container, "register");

    new Infrastructure({
      repositories: [DummyRepository],
    });

    expect(registerSpy).toHaveBeenCalledWith(
      DummyRepository,
      { useClass: DummyRepository },
      { lifecycle: 1 },
    );
  });

  it("start() method exists for interface compatibility", () => {
    infrastructure = new Infrastructure(config);

    // start() should exist and not throw
    expect(() => infrastructure.start()).not.toThrow();
  });
});
