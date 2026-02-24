const { defineConfig } = require("vitest/config");

module.exports = defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    globals: true,
    environmentMatchGlobs: [["tests/extension/**/*.test.js", "jsdom"]],
    coverage: {
      enabled: false
    }
  }
});
