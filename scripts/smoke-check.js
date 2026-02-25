#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const builtArtifacts = [
  "packages/cli-core/dist/index.js",
  "packages/bridge-core/dist/main.js",
  "packages/shared/dist/index.js",
  "extension/content.js",
  "extension/options.js",
  "extension/shared-runtime.js",
  "extension/vendor/xterm.css"
];

function ensureBuiltArtifacts() {
  const missing = builtArtifacts.filter(
    (file) => !fs.existsSync(path.join(root, file))
  );
  if (missing.length === 0) {
    return;
  }
  execFileSync("pnpm", ["run", "build"], {
    cwd: root,
    stdio: "inherit"
  });
}

ensureBuiltArtifacts();

const files = [
  "bin/pier.js",
  "cli/pier-utils.js",
  "cli/pier-bridge.js",
  "cli/pier-cli.js",
  "packages/cli-core/dist/index.js",
  "packages/cli-core/dist/config/config-store.js",
  "packages/cli-core/dist/bridge/bridge-process.js",
  "packages/cli-core/dist/workspace-registry/registry.js",
  "server/pier-server.js",
  "packages/bridge-core/dist/main.js",
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
