import { GreetingRepositoryAdapter } from "./greeting/adapter";

export const repositories = [GreetingRepositoryAdapter] as unknown as Array<
  new () => unknown
>;
