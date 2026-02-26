const nodeCrypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const {
  REQUIRED_EXTENSION_FILES,
  getInstalledExtensionPath,
  installExtensionBundle
} = require("../../packages/cli-core/dist/extension/installer");

const envBackup = { ...process.env };
const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pier-extension-test-"));
  tmpDirs.push(dir);
  return dir;
}

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in envBackup)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(envBackup)) {
    process.env[key] = value;
  }
}

function sha256File(filePath) {
  const hash = nodeCrypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
}

function createFixtureZip(version) {
  const root = makeTmpDir();
  const extensionDir = path.join(root, "extension");
  fs.mkdirSync(path.join(extensionDir, "vendor"), { recursive: true });

  for (const relPath of REQUIRED_EXTENSION_FILES) {
    const full = path.join(extensionDir, relPath);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, `fixture:${relPath}\n`);
  }

  const zipPath = path.join(root, `pier-extension-v${version}.zip`);
  execFileSync("zip", ["-X", "-r", zipPath, "."], {
    cwd: extensionDir,
    stdio: "pipe"
  });

  const digest = sha256File(zipPath);
  fs.writeFileSync(
    `${zipPath}.sha256`,
    `${digest}  ${path.basename(zipPath)}\n`,
    "utf8"
  );

  return zipPath;
}

afterEach(() => {
  restoreEnv();
  while (tmpDirs.length) {
    fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

describe("extension installer", () => {
  it("installs extension zip into cache and is idempotent", async () => {
    const version = "9.9.9";
    const cacheDir = makeTmpDir();
    const zipPath = createFixtureZip(version);
    process.env.PIER_EXTENSION_CACHE_DIR = cacheDir;

    const first = await installExtensionBundle({
      version,
      from: zipPath
    });
    expect(first.installed).toBe(true);
    expect(fs.existsSync(first.path)).toBe(true);
    expect(fs.existsSync(path.join(first.path, "vendor", "xterm.css"))).toBe(
      true
    );

    const second = await installExtensionBundle({
      version,
      from: zipPath
    });
    expect(second.alreadyInstalled).toBe(true);
    expect(second.path).toBe(first.path);
    expect(getInstalledExtensionPath({ version })).toBe(first.path);
  });

  it("reinstalls when --force is set", async () => {
    const version = "8.8.8";
    const cacheDir = makeTmpDir();
    const zipPath = createFixtureZip(version);
    process.env.PIER_EXTENSION_CACHE_DIR = cacheDir;

    const first = await installExtensionBundle({
      version,
      from: zipPath
    });
    const marker = path.join(first.path, ".pier-extension-install.json");
    const before = fs.statSync(marker).mtimeMs;

    const second = await installExtensionBundle({
      version,
      from: zipPath,
      force: true
    });
    const after = fs.statSync(marker).mtimeMs;

    expect(second.installed).toBe(true);
    expect(after).toBeGreaterThanOrEqual(before);
  });
});
