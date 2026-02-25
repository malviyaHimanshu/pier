#!/usr/bin/env node
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);

function expectedTarballPrefix() {
  return String(pkg.name || "")
    .trim()
    .replace(/^@/, "")
    .replace(/\//g, "-");
}

function latestTarball() {
  const tarballPrefix = expectedTarballPrefix();
  const candidates = fs
    .readdirSync(root)
    .filter(
      (name) => name.startsWith(`${tarballPrefix}-`) && name.endsWith(".tgz")
    )
    .map((name) => ({
      name,
      mtimeMs: fs.statSync(path.join(root, name)).mtimeMs
    }))
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
  if (candidates.length === 0) {
    throw new Error(
      `No ${tarballPrefix}-*.tgz found. Run \`pnpm run pack:npm\` (or \`pnpm pack\`) first.`
    );
  }
  return path.join(root, candidates[0].name);
}

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    ...opts
  });
}

function runOutput(cmd, args, opts = {}) {
  return execFileSync(cmd, args, {
    stdio: "pipe",
    encoding: "utf8",
    ...opts
  }).trim();
}

function main() {
  const tgz = latestTarball();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pier-pack-smoke-"));
  const homeDir = path.join(tmp, "home");
  const projDir = path.join(tmp, "proj");
  fs.mkdirSync(homeDir, { recursive: true });
  fs.mkdirSync(projDir, { recursive: true });

  run("npm", ["init", "-y"], { cwd: projDir });
  run("npm", ["install", tgz], { cwd: projDir });

  const env = { ...process.env, HOME: homeDir };
  const pierBin = path.join(projDir, "node_modules", ".bin", "pier");

  run(pierBin, ["--help"], { cwd: projDir, env });
  run(pierBin, ["version"], { cwd: projDir, env });
  run(pierBin, ["extension", "path"], { cwd: projDir, env });
  run(pierBin, ["doctor"], { cwd: projDir, env });

  const extensionPath = runOutput(pierBin, ["extension", "path"], {
    cwd: projDir,
    env
  });
  const expected = [
    "manifest.json",
    "extension/content.js",
    "extension/options.js",
    "extension/shared-runtime.js",
    "extension/content.css",
    "extension/options.css"
  ];
  for (const rel of expected) {
    const full = path.join(path.dirname(extensionPath), rel);
    if (!fs.existsSync(full)) {
      throw new Error(`Missing packaged asset: ${rel}`);
    }
  }

  process.stdout.write("[pier] pack smoke checks passed\n");
}

main();
