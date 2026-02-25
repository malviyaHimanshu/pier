#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const LOCAL_PAGE_MATCHES = [
  "http://localhost/*",
  "https://localhost/*",
  "http://127.0.0.1/*",
  "https://127.0.0.1/*",
  "http://*.localhost/*",
  "https://*.localhost/*"
];
const builtArtifacts = [
  "packages/cli-core/dist/index.js",
  "packages/bridge-core/dist/main.js",
  "packages/shared/dist/index.js",
  "extension/content.js",
  "extension/options.js",
  "extension/shared-runtime.js",
  "extension/manifest.json",
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArrayEqual(actual, expected, label) {
  assert(Array.isArray(actual), `${label} must be an array`);
  assert(
    actual.length === expected.length &&
      actual.every((item, index) => item === expected[index]),
    `${label} mismatch`
  );
}

function validateManifest(manifest, { extensionBuild = false } = {}) {
  assert(
    manifest && manifest.manifest_version === 3,
    "manifest_version must be 3"
  );
  assert(
    manifest.minimum_chrome_version === "114",
    "minimum_chrome_version must be 114"
  );
  const contentScript = Array.isArray(manifest.content_scripts)
    ? manifest.content_scripts[0]
    : null;
  assert(contentScript, "content_scripts[0] missing");
  assertArrayEqual(
    contentScript.matches,
    LOCAL_PAGE_MATCHES,
    "content_scripts[0].matches"
  );
  if (Array.isArray(manifest.web_accessible_resources)) {
    for (const [
      index,
      resource
    ] of manifest.web_accessible_resources.entries()) {
      assertArrayEqual(
        resource.matches,
        LOCAL_PAGE_MATCHES,
        `web_accessible_resources[${index}].matches`
      );
    }
  }
  if (extensionBuild) {
    const prefixed = JSON.stringify(manifest).includes('"extension/');
    assert(
      !prefixed,
      "extension build manifest should not contain extension/ prefixes"
    );
  }
}

const rootManifest = JSON.parse(
  fs.readFileSync(path.join(root, "manifest.json"), "utf8")
);
const extensionManifest = JSON.parse(
  fs.readFileSync(path.join(root, "extension", "manifest.json"), "utf8")
);

validateManifest(rootManifest);
validateManifest(extensionManifest, { extensionBuild: true });
console.log("[pier] smoke checks passed");
