import {
  ConfigInfrastructure,
  Infrastructure,
} from "../../../../../src/micro-service/architecture/infrastructure";

class DummyRepository {}

const config: ConfigInfrastructure = {
  repositories: [DummyRepository],
};

describe("Infrastructure", () => {
  let infrastructure: Infrastructure;

  beforeEach(() => {
    infrastructure = new Infrastructure(config);
  });

  it("should store the configuration passed in the constructor", () => {
    expect(infrastructure["config"]).toEqual(config);
  });

  it("should call registerDependencies with provided repositories when start() is called", () => {
    const registerSpy = vi.spyOn(
      Object.getPrototypeOf(infrastructure),
      "registerDependencies"
    );

    infrastructure.start();

    expect(registerSpy).toHaveBeenCalledWith(config.repositories);
  });
});
