export abstract class Provider<T = unknown> {
  protected config: T;

  constructor(config: T) {
    this.config = config;
  }

  public abstract start(): Promise<void>;
}
