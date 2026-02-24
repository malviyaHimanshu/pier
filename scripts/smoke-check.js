#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const files = [
  "bin/pier.js",
  "cli/pier-utils.js",
  "cli/pier-bridge.js",
  "cli/pier-cli.js",
  "packages/cli-core/src/index.js",
  "packages/cli-core/src/config/config-store.js",
  "packages/cli-core/src/bridge/bridge-process.js",
  "packages/cli-core/src/workspace-registry/registry.js",
  "server/pier-server.js",
  "packages/bridge-core/src/main.js",
  "extension/content.js",
  "extension/options.js",
  "scripts/dev-hosts.js",
  "scripts/generate-token.js"
];

for (const file of files) {
  execFileSync(process.execPath, ["--check", path.join(root, file)], {
    stdio: "pipe"
  });
}

JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));
console.log("[pier] smoke checks passed");
