import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitest.dev/config/#configuration
export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".mjs", ".json"],
    alias: {
      "@zacatl/error": path.resolve(__dirname, "./src/error"),
      "@zacatl/utils": path.resolve(__dirname, "./src/utils"),
      "@zacatl/logs": path.resolve(__dirname, "./src/logs"),
      "@zacatl/optionals": path.resolve(__dirname, "./src/optionals.ts"),
      "@zacatl/configuration": path.resolve(
        __dirname,
        "./src/configuration.ts",
      ),
      "@zacatl/infrastructure": path.resolve(
        __dirname,
        "./src/service/architecture/infrastructure",
      ),
      "@zacatl/domain": path.resolve(
        __dirname,
        "./src/service/architecture/domain",
      ),
      "@zacatl/application": path.resolve(
        __dirname,
        "./src/service/architecture/application",
      ),
      "@zacatl/platform": path.resolve(
        __dirname,
        "./src/service/architecture/platform",
      ),
    },
  },
  test: {
    globals: true,
    include: ["test/**/*.test.ts"],
    environment: "node",
    environmentOptions: {
      // Add Node.js globals to prevent undici issues
      nodeOptions: {
        experimentalGlobal: true,
      },
    },
    logHeapUsage: true,
    reporters: "verbose",
    globalSetup: "./test/unit/lib/global-setup.ts",
    setupFiles: ["./test/unit/lib/setup-files.ts"],
    coverage: {
      reporter: ["lcov", "text"],
      reportsDirectory: "./coverage",
      all: true,
      include: ["src/*"],
      provider: "istanbul",
      exclude: [
        // Generated files:
        "**/*.d.ts",
      ],
    },
    /*
     * When using threads you are unable to use process related APIs such as process.chdir().
     * Some libraries written in native languages, such as Prisma, bcrypt and canvas, have problems when running in multiple threads and run into segfaults.
     * In these cases it is advised to use forks pool instead.
     * https://vitest.dev/config/#pool
     */
    pool: "threads",
    // Move poolOptions to top-level (Vitest 4 migration)
    isolate: true,

    sequence: {
      hooks: "parallel",
    },
  },
});
