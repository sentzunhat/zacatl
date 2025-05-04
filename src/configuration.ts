import config from "config";

type ConfigInput = {
  SERVICE_NAME: string;
  NODE_ENV: string;
  APP_VERSION: string;
  APP_ENV: string;
  CONNECTION_STRING: string;
};

export const getConfigOrThrow = <T>(name: keyof ConfigInput): T => {
  return config.get<T>(name);
};
