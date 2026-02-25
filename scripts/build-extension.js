#!/usr/bin/env node
const path = require("path");
const fs = require("fs");
const esbuild = require("esbuild");

const ROOT = path.resolve(__dirname, "..");
const OUTDIR = path.join(ROOT, "extension");
const EXT_SRC = path.join(ROOT, "packages", "extension-src", "src");
const PUBLIC_DIR = path.join(EXT_SRC, "public");
const watchMode = process.argv.includes("--watch");

const builds = [
  {
    entryPoints: [path.join(EXT_SRC, "shared-runtime-entry.ts")],
    outfile: path.join(OUTDIR, "shared-runtime.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome114",
    minify: false,
    legalComments: "none"
  },
  {
    entryPoints: [path.join(EXT_SRC, "content", "index.ts")],
    outfile: path.join(OUTDIR, "content.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome114",
    minify: false,
    legalComments: "none",
    jsx: "automatic",
    jsxImportSource: "preact"
  },
  {
    entryPoints: [path.join(EXT_SRC, "options", "index.tsx")],
    outfile: path.join(OUTDIR, "options.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome114",
    minify: false,
    legalComments: "none",
    jsx: "automatic",
    jsxImportSource: "preact"
  }
];

function copyFileSync(fromPath, toPath) {
  fs.mkdirSync(path.dirname(toPath), { recursive: true });
  fs.copyFileSync(fromPath, toPath);
}

function syncStaticAssets() {
  copyFileSync(
    path.join(PUBLIC_DIR, "content.css"),
    path.join(OUTDIR, "content.css")
  );
  copyFileSync(
    path.join(PUBLIC_DIR, "options.css"),
    path.join(OUTDIR, "options.css")
  );
  copyFileSync(
    path.join(PUBLIC_DIR, "options.html"),
    path.join(OUTDIR, "options.html")
  );
  copyFileSync(
    path.join(ROOT, "node_modules", "@xterm", "xterm", "css", "xterm.css"),
    path.join(OUTDIR, "vendor", "xterm.css")
  );
  for (const staleFile of [
    "vendor/xterm.js",
    "vendor/addon-fit.js",
    "vendor/addon-web-links.js",
    "vendor/addon-unicode11.js",
    "vendor/addon-webgl.js"
  ]) {
    fs.rmSync(path.join(OUTDIR, staleFile), { force: true });
  }
}

async function runBuild(config) {
  if (!watchMode) {
    await esbuild.build(config);
    return null;
  }
  const ctx = await esbuild.context(config);
  await ctx.watch();
  return ctx;
}

(async () => {
  syncStaticAssets();
  const contexts = [];
  for (const config of builds) {
    const ctx = await runBuild(config);
    if (ctx) {
      contexts.push(ctx);
    }
  }

  if (!watchMode) {
    console.log("[pier] extension bundles built");
    return;
  }

  console.log("[pier] watching extension bundles...");
  process.on("SIGINT", async () => {
    for (const ctx of contexts) {
      await ctx.dispose();
    }
    process.exit(0);
  });
})();
