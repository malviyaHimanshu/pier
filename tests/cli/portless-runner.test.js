const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  ensurePortlessProxy,
  getPortlessProxyPort,
  resolvePortlessRunner
} = require("../../packages/cli-core/dist");

const envBackup = { ...process.env };
const tmpDirs = [];

function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pier-portless-test-"));
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

function writeFakePortlessScript(content) {
  const dir = makeTmpDir();
  const filePath = path.join(dir, "fake-portless.js");
  fs.writeFileSync(filePath, content);
  fs.chmodSync(filePath, 0o755);
  return filePath;
}

afterEach(() => {
  restoreEnv();
  while (tmpDirs.length) {
    fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

describe("portless runner", () => {
  it("uses PIER_PORTLESS_BIN before bundled/path resolution", () => {
    const scriptPath = writeFakePortlessScript(
      [
        "const args = process.argv.slice(2);",
        "if (args[0] === '--version') {",
        "  console.log('0.0.0-test');",
        "  process.exit(0);",
        "}",
        "process.exit(0);"
      ].join("\n")
    );

    process.env.PIER_PORTLESS_BIN = scriptPath;
    const runner = resolvePortlessRunner();
    expect(runner.source).toBe("env");
    expect(runner.mode).toBe("node-script");
    expect(runner.scriptPath).toBe(scriptPath);
  });

  it("resolves bundled runtime even when PATH lookup is unavailable", () => {
    delete process.env.PIER_PORTLESS_BIN;
    process.env.PATH = "";
    const runner = resolvePortlessRunner();
    expect(runner.source).toBe("bundled");
    expect(runner.mode).toBe("node-script");
    expect(path.basename(runner.scriptPath)).toBe("cli.js");
  });

  it("ensures proxy and reports already-running output", () => {
    const scriptPath = writeFakePortlessScript(
      [
        "const args = process.argv.slice(2);",
        "if (args[0] === '--version') {",
        "  console.log('0.0.0-test');",
        "  process.exit(0);",
        "}",
        "if (args[0] === 'proxy' && args[1] === 'start') {",
        "  console.log('Proxy is already running on port 1355.');",
        "  process.exit(0);",
        "}",
        "process.exit(1);"
      ].join("\n")
    );

    process.env.PIER_PORTLESS_BIN = scriptPath;
    const result = ensurePortlessProxy({ https: false });
    expect(result.alreadyRunning).toBe(true);
    expect(result.runner.source).toBe("env");
  });

  it("uses PORTLESS_PORT when provided", () => {
    process.env.PORTLESS_PORT = "17000";
    expect(getPortlessProxyPort()).toBe(17000);

    process.env.PORTLESS_PORT = "bad";
    expect(getPortlessProxyPort()).toBe(1355);
  });
});
