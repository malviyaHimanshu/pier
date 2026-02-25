const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "preact"
  },
  test: {
    globals: true,
    projects: [
      {
        test: {
          name: "node",
          globals: true,
          include: [
            "tests/**/*.test.js",
            "tests/**/*.test.ts",
            "tests/**/*.test.tsx"
          ],
          exclude: [
            "tests/extension/**/*.test.js",
            "tests/extension/**/*.test.ts",
            "tests/extension/**/*.test.tsx"
          ]
        }
      },
      {
        test: {
          name: "extension",
          globals: true,
          include: [
            "tests/extension/**/*.test.js",
            "tests/extension/**/*.test.ts",
            "tests/extension/**/*.test.tsx"
          ],
          environment: "jsdom"
        }
      }
    ],
    coverage: {
      enabled: false
    }
  }
});
