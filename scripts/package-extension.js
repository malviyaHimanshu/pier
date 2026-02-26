#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const nodeCrypto = require("crypto");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const extensionDir = path.join(root, "extension");
const artifactsDir = path.join(root, "artifacts", "chrome-web-store");
const pkg = JSON.parse(
  fs.readFileSync(path.join(root, "package.json"), "utf8")
);

const requiredFiles = [
  "manifest.json",
  "content.js",
  "options.js",
  "shared-runtime.js",
  "content.css",
  "options.css",
  "vendor/xterm.css"
];

function ensureBuiltExtension() {
  const missing = requiredFiles.filter(
    (relPath) => !fs.existsSync(path.join(extensionDir, relPath))
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing built extension files: ${missing.join(", ")}. Run \`pnpm run build\` first.`
    );
  }
}

function zipExtension(zipPath) {
  if (process.platform === "win32") {
    const script = [
      "$ErrorActionPreference = 'Stop'",
      `Set-Location -LiteralPath '${extensionDir.replace(/'/g, "''")}'`,
      "$items = Get-ChildItem -Force | Where-Object { $_.Name -ne '.DS_Store' }",
      "if (-not $items) { throw 'No extension files found to archive.' }",
      `Compress-Archive -Path $items.FullName -DestinationPath '${zipPath.replace(/'/g, "''")}' -Force`
    ].join("; ");
    execFileSync(
      "powershell.exe",
      ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
      { stdio: "inherit" }
    );
    return;
  }

  try {
    execFileSync(
      "zip",
      ["-X", "-r", zipPath, ".", "-x", "*.DS_Store", "__MACOSX/*"],
      {
        cwd: extensionDir,
        stdio: "inherit"
      }
    );
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(
        "The `zip` CLI is required to package the extension on macOS/Linux. Install `zip` and rerun."
      );
    }
    throw error;
  }
}

function sha256File(filePath) {
  const hash = nodeCrypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function main() {
  ensureBuiltExtension();

  fs.mkdirSync(artifactsDir, { recursive: true });
  const baseName = `pier-extension-v${pkg.version}.zip`;
  const zipPath = path.join(artifactsDir, baseName);
  const checksumPath = `${zipPath}.sha256`;

  fs.rmSync(zipPath, { force: true });
  fs.rmSync(checksumPath, { force: true });

  zipExtension(zipPath);

  const checksum = sha256File(zipPath);
  fs.writeFileSync(checksumPath, `${checksum}  ${path.basename(zipPath)}\n`);

  process.stdout.write(`[pier] extension package created: ${zipPath}\n`);
  process.stdout.write(`[pier] sha256 written: ${checksumPath}\n`);
}

main();
