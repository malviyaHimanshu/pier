#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

async function main() {
  const sharp = require("sharp");
  const root = path.resolve(__dirname, "..");
  const src = path.join(root, "extension", "assets", "logo.png");
  const outDir = path.join(root, "extension", "assets", "icons");
  fs.mkdirSync(outDir, { recursive: true });
  const sizes = [16, 32, 48, 128];

  for (const size of sizes) {
    const out = path.join(outDir, `logo-${size}.png`);
    await sharp(src).resize(size, size).png().toFile(out);
  }

  console.log("[pier] generated extension icons");
}

main().catch((error) => {
  process.stderr.write(`${String(error.message || error)}\n`);
  process.exit(1);
});
