#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);
const manifestPath = path.join(root, "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifest.version = pkg.version;
manifest.name = "Pier";
manifest.description = "Open a real terminal in localhost pages with Ctrl+`.";
manifest.action = {
  ...(manifest.action || {}),
  default_title: "Pier",
  default_icon: {
    16: "extension/assets/icons/logo-16.png",
    32: "extension/assets/icons/logo-32.png"
  }
};
manifest.icons = {
  16: "extension/assets/icons/logo-16.png",
  32: "extension/assets/icons/logo-32.png",
  48: "extension/assets/icons/logo-48.png",
  128: "extension/assets/icons/logo-128.png"
};

const scripts = manifest.content_scripts || [];
for (const script of scripts) {
  if (!Array.isArray(script.js)) {
    continue;
  }
  if (!script.js.includes("extension/shared-runtime.js")) {
    const contentIndex = script.js.indexOf("extension/content.js");
    if (contentIndex >= 0) {
      script.js.splice(contentIndex, 0, "extension/shared-runtime.js");
    } else {
      script.js.push("extension/shared-runtime.js");
    }
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log("[pier] manifest synced");
