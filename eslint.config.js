const js = require("@eslint/js");
const globals = require("globals");
const prettier = require("eslint-config-prettier");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "*.tgz",
      "packages/*/dist/**",
      "extension/*.js",
      "extension/vendor/*.js",
      "extension/vendor/xterm.css"
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        ...globals.node
      }
    },
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-require-imports": "off"
    }
  },
  {
    files: [
      "extension/**/*.js",
      "packages/extension-src/**/*.js",
      "packages/extension-src/**/*.ts",
      "packages/extension-src/**/*.tsx"
    ],
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
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true
      }
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  {
    files: ["tests/**/*.test.js", "tests/**/*.test.ts", "tests/**/*.test.tsx"],
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
