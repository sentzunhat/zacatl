import { container } from "tsyringe";

import { AbstractArchitecture } from "../../../../src/service/architecture/architecture";

class TestArchitecture extends AbstractArchitecture {
  public start(): void {}

  public testRegisterDependencies<T>(dependencies: Array<new () => T>): void {
    this.registerDependencies(dependencies);
  }

  public testRegisterAndStoreDependencies<T>(
    dependencies: Array<new () => T>,
    storage: Array<T>,
  ): void {
    this.registerAndStoreDependencies(dependencies, storage);
  }
}

class DummyDependency {
  public value = "dummy";
}

describe("AbstractArchitecture", () => {
  const testArch: TestArchitecture = new TestArchitecture();

  describe("registerDependencies", () => {
    it("should register each dependency with the container", () => {
      const spyFunction = vi.spyOn(container, "register");

      testArch.testRegisterDependencies([DummyDependency]);

      expect(spyFunction).toHaveBeenCalledTimes(1);
      expect(spyFunction).toHaveBeenCalledWith(DummyDependency.name, {
        useClass: DummyDependency,
      });
    });
  });

  describe("registerAndStoreDependencies", () => {
    it("should register each dependency and store the resolved instance", () => {
      const storage: DummyDependency[] = [];

      const spyResolveFunction = vi.spyOn(container, "resolve");
      const spyRegisterFunction = vi.spyOn(container, "register");

      const dummyInstance = new DummyDependency();

      spyResolveFunction.mockReturnValue(dummyInstance);

      testArch.testRegisterAndStoreDependencies([DummyDependency], storage);

      expect(spyRegisterFunction).toHaveBeenCalledTimes(1);
      expect(spyRegisterFunction).toHaveBeenCalledWith(DummyDependency.name, {
        useClass: DummyDependency,
      });

      expect(spyResolveFunction).toHaveBeenCalledTimes(1);
      expect(spyResolveFunction).toHaveBeenCalledWith(DummyDependency.name);
      expect(storage).toHaveLength(1);
      expect(storage[0]).toBe(dummyInstance);
    });
  });
});
