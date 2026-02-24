const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");

module.exports = [
  {
    ignores: ["node_modules/**", "extension/vendor/**", "coverage/**", "*.tgz"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off"
    }
  },
  {
    files: ["extension/**/*.js", "packages/extension-src/**/*.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        chrome: "readonly",
        browser: "readonly",
        Terminal: "readonly",
        FitAddon: "readonly",
        WebLinksAddon: "readonly",
        Unicode11Addon: "readonly",
        WebglAddon: "readonly"
      }
    }
  },
  {
    files: ["tests/**/*.test.js"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly"
      }
    }
  },
  prettier
];
