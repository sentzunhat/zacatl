import { ServerAdapter } from "../server/server-adapter";
import path from "path";
import fs from "fs";
import { logger } from "../../../../logs";

export type PageModuleConfig = {
  root: string;
  page: {
    devServerUrl?: string;
    staticDir?: string;
    customRegister?: (server: unknown) => Promise<void> | void;
  };
  apiPrefix?: string;
};

export class PageModule {
  constructor(private config: PageModuleConfig) {}

  public async register(adapter: ServerAdapter): Promise<void> {
    const { devServerUrl, staticDir, customRegister } = this.config.page;
    const apiPrefix = this.config.apiPrefix || "/api";

    if (customRegister) {
      await customRegister(adapter.getRawServer());
      return;
    }

    if (devServerUrl) {
      adapter.registerProxy({
        upstream: devServerUrl,
        prefix: "/",
        rewritePrefix: "/",
        http2: false,
      });
    } else if (staticDir) {
      const absoluteStaticDir = path.resolve(this.config.root, staticDir);
      if (!fs.existsSync(absoluteStaticDir)) {
        logger.warn(
          `Static directory ${absoluteStaticDir} does not exist. Skipping static file serving.`,
        );
        return;
      }

      adapter.serveStatic({
        root: absoluteStaticDir,
        prefix: "/",
      });

      adapter.registerSpaFallback(apiPrefix, absoluteStaticDir);
    }
  }
}
