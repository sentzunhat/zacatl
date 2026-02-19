import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      "@zacatl": path.resolve(__dirname, "../../../../../src/index.ts"),
      "@zacatl/service": path.resolve(__dirname, "../../../../../src/service"),
      "@zacatl/configuration": path.resolve(
        __dirname,
        "../../../../../src/configuration",
      ),
      "@zacatl/dependency-injection": path.resolve(
        __dirname,
        "../../../../../src/dependency-injection",
      ),
      "@zacatl/error": path.resolve(__dirname, "../../../../../src/error"),
      "@zacatl/localization": path.resolve(
        __dirname,
        "../../../../../src/localization",
      ),
      "@zacatl/logs": path.resolve(__dirname, "../../../../../src/logs"),
      "@zacatl/utils": path.resolve(__dirname, "../../../../../src/utils"),
      "@zacatl/optionals": path.resolve(
        __dirname,
        "../../../../../src/optionals.ts",
      ),
      "@zacatl/third-party": path.resolve(
        __dirname,
        "../../../../../src/third-party",
      ),
      "@zacatl/third-party/tsyringe": path.resolve(
        __dirname,
        "../../../../../src/third-party/tsyringe.ts",
      ),
      "@zacatl/third-party/fastify": path.resolve(
        __dirname,
        "../../../../../src/third-party/fastify.ts",
      ),
      "@zacatl/third-party/sequelize": path.resolve(
        __dirname,
        "../../../../../src/third-party/sequelize.ts",
      ),
      "@zacatl/infrastructure": path.resolve(
        __dirname,
        "../../../../../src/service/layers/infrastructure",
      ),
      "@zacatl/domain": path.resolve(
        __dirname,
        "../../../../../src/service/layers/domain",
      ),
      "@zacatl/application": path.resolve(
        __dirname,
        "../../../../../src/service/layers/application",
      ),
      "@zacatl/platform": path.resolve(
        __dirname,
        "../../../../../src/service/platforms",
      ),
      "@sentzunhat/zacatl": path.resolve(
        __dirname,
        "../../../../../src/index.ts",
      ),
      "@sentzunhat/zacatl/service": path.resolve(
        __dirname,
        "../../../../../src/service",
      ),
      "@sentzunhat/zacatl/third-party/fastify": path.resolve(
        __dirname,
        "../../../../../src/third-party/fastify.ts",
      ),
      "@sentzunhat/zacatl/third-party/sequelize": path.resolve(
        __dirname,
        "../../../../../src/third-party/sequelize.ts",
      ),
    },
  },
  test: {
    globals: true,
    environment: "node",
  },
});
