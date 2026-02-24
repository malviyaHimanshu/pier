#!/usr/bin/env node
const path = require("path");
const esbuild = require("esbuild");

const ROOT = path.resolve(__dirname, "..");
const OUTDIR = path.join(ROOT, "extension");
const watchMode = process.argv.includes("--watch");

const builds = [
  {
    entryPoints: [
      path.join(
        ROOT,
        "packages",
        "extension-src",
        "src",
        "shared-runtime-entry.js"
      )
    ],
    outfile: path.join(OUTDIR, "shared-runtime.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome114",
    minify: false,
    legalComments: "none"
  },
  {
    entryPoints: [
      path.join(ROOT, "packages", "extension-src", "src", "options", "index.js")
    ],
    outfile: path.join(OUTDIR, "options.js"),
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "chrome114",
    minify: false,
    legalComments: "none"
  }
];

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
