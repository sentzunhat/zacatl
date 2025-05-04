import { container } from "tsyringe";

type Architecture = {
  start: () => void;
};

export abstract class AbstractArchitecture implements Architecture {
  /**
   * A generic helper method to register an array of handler classes.
   * @param handlers - An array of class constructors that implement the handler functionality.
   */
  protected registerDependencies<T>(dependencies: Array<new () => T>): void {
    for (const dependency of dependencies) {
      const instance = new dependency();

      container.register<typeof instance>(dependency.name, {
        useClass: dependency,
      });
    }
  }

  /**
   * A generic helper method to register an array of handler classes.
   * @param handlers - An array of class constructors that implement the handler functionality.
   * @param storage - An array where the resolved instances of handlers will be stored.
   */
  protected registerAndStoreDependencies<T>(
    dependencies: Array<new () => T>,
    storage: Array<T>
  ): void {
    for (const dependency of dependencies) {
      container.register(dependency.name, { useClass: dependency });

      const instance = new dependency();

      const routeHandler = container.resolve<typeof instance>(dependency.name);

      storage.push(routeHandler);
    }
  }

  // Abstract start method, to be implemented by subclasses.
  public abstract start(): void;
}
