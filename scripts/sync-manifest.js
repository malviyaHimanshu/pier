#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);
const manifestPath = path.join(root, "manifest.json");
const extensionManifestPath = path.join(root, "extension", "manifest.json");
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
  script.js = script.js.filter(
    (entry) =>
      ![
        "extension/vendor/xterm.js",
        "extension/vendor/addon-fit.js",
        "extension/vendor/addon-web-links.js",
        "extension/vendor/addon-unicode11.js",
        "extension/vendor/addon-webgl.js"
      ].includes(entry)
  );

  const desiredJs = ["extension/shared-runtime.js", "extension/content.js"];
  script.js = desiredJs;

  if (Array.isArray(script.css)) {
    script.css = Array.from(
      new Set([
        "extension/vendor/xterm.css",
        "extension/content.css",
        ...script.css
      ])
    );
    script.css = ["extension/vendor/xterm.css", "extension/content.css"];
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

function stripExtensionPrefix(value) {
  if (typeof value !== "string") {
    return value;
  }
  return value.startsWith("extension/")
    ? value.slice("extension/".length)
    : value;
}

function toExtensionManifest(rootManifest) {
  const copy = JSON.parse(JSON.stringify(rootManifest));

  copy.options_page = stripExtensionPrefix(copy.options_page);

  if (copy.action && copy.action.default_icon) {
    for (const [size, iconPath] of Object.entries(copy.action.default_icon)) {
      copy.action.default_icon[size] = stripExtensionPrefix(iconPath);
    }
  }

  if (copy.icons) {
    for (const [size, iconPath] of Object.entries(copy.icons)) {
      copy.icons[size] = stripExtensionPrefix(iconPath);
    }
  }

  if (Array.isArray(copy.content_scripts)) {
    for (const script of copy.content_scripts) {
      if (Array.isArray(script.css)) {
        script.css = script.css.map(stripExtensionPrefix);
      }
      if (Array.isArray(script.js)) {
        script.js = script.js.map(stripExtensionPrefix);
      }
    }
  }

  if (Array.isArray(copy.web_accessible_resources)) {
    for (const resource of copy.web_accessible_resources) {
      if (Array.isArray(resource.resources)) {
        resource.resources = resource.resources.map(stripExtensionPrefix);
      }
    }
  }

  return copy;
}

fs.mkdirSync(path.dirname(extensionManifestPath), { recursive: true });
fs.writeFileSync(
  extensionManifestPath,
  JSON.stringify(toExtensionManifest(manifest), null, 2) + "\n"
);

console.log("[pier] manifest synced");
