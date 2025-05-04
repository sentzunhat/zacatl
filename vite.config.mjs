import { defineConfig } from "vitest/config";

// https://vitest.dev/config/#configuration
export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.test.ts"],
    environment: "node",
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

    isolate: true,

    poolOptions: {
      threads: {
        isolate: true,
      },
    },

    sequence: {
      hooks: "parallel",
    },
  },
});
