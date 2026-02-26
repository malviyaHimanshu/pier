const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const {
  listRoutes,
  normalizeRouteDir,
  removeRoute,
  upsertRoute,
  LOCALHOST_SUFFIX,
  DEFAULT_REGISTRY_PATH
} = require("./workspace-registry/registry");
const {
  BRIDGE_LOG_PATH,
  CONFIG_PATH,
  checkTcpOpen,
  ensureConfig,
  readConfig,
  STATE_DIR
} = require("./config/config-store");
const {
  getBridgeStatus,
  startBridge,
  stopBridge
} = require("./bridge/bridge-process");
const {
  REQUIRED_EXTENSION_FILES,
  getInstalledExtensionPath,
  getPierVersion,
  installExtensionBundle
} = require("./extension/installer");

const CHROME_WEB_STORE_URL =
  "https://chromewebstore.google.com/detail/pier/gfhbagnaafeefbkjcocmpnepfggbbdpj";

function stdout(message = "") {
  process.stdout.write(`${message}\n`);
}

function stderr(message = "") {
  process.stderr.write(`${message}\n`);
}

function warn(message = "") {
  stderr(`[pier] WARN: ${message}`);
}

function fail(message, code = 1) {
  stderr(message);
  process.exit(code);
}

function printHelp() {
  stdout("pier - pier dev CLI (portless + per-host terminal CWD)");
  stdout("");
  stdout("Usage:");
  stdout("  pier <name> <command> [args...]");
  stdout("  pier map list");
  stdout("  pier map add <host.localhost> [cwd]");
  stdout("  pier map remove <host.localhost>");
  stdout("  pier map where <host.localhost>");
  stdout("  pier bridge start [--foreground]");
  stdout("  pier bridge stop");
  stdout("  pier bridge status");
  stdout("  pier bridge logs");
  stdout("  pier extension path");
  stdout("  pier extension url");
  stdout(
    "  pier extension install [--force] [--version <x.y.z>] [--from <url-or-file>]"
  );
  stdout("  pier doctor");
  stdout("  pier setup [--https] [--manual-extension]");
  stdout("");
  stdout("Examples:");
  stdout("  pier myapp pnpm dev");
  stdout("  pier api.myapp next dev");
  stdout("  pier map add myapp.localhost /path/to/project");
  stdout("  pier setup --https");
  stdout("");
  stdout("Legacy compatibility:");
  stdout("  node scripts/dev-hosts.js ...");
}

function isHelpFlag(value) {
  return value === "--help" || value === "-h" || value === "help";
}

function parseNameToHost(nameInput) {
  const raw = String(nameInput || "")
    .trim()
    .toLowerCase();
  if (!raw) {
    throw new Error("App name is required.");
  }

  const host = raw.endsWith(LOCALHOST_SUFFIX)
    ? raw
    : `${raw}${LOCALHOST_SUFFIX}`;
  const withoutSuffix = host.slice(0, -LOCALHOST_SUFFIX.length);
  if (!withoutSuffix) {
    throw new Error("Invalid app name.");
  }

  const { normalizeRouteHost } = require("./workspace-registry/registry");
  const normalizedHost = normalizeRouteHost(host, {
    allowLoopbackLiteral: false
  });
  const portlessName = normalizedHost.slice(0, -LOCALHOST_SUFFIX.length);

  return { host: normalizedHost, portlessName };
}

function listMappings(filePath = DEFAULT_REGISTRY_PATH) {
  const rows = listRoutes({ filePath });
  if (rows.length === 0) {
    stdout(`No mappings found. Registry: ${filePath}`);
    return;
  }
  const hostWidth = Math.max(
    "HOST".length,
    ...rows.map((row) => row.host.length)
  );
  stdout(`Registry: ${filePath}`);
  stdout("");
  stdout(`${"HOST".padEnd(hostWidth)}  CWD`);
  stdout(`${"-".repeat(hostWidth)}  ---`);
  for (const row of rows) {
    stdout(`${row.host.padEnd(hostWidth)}  ${row.cwd}`);
  }
}

function cmdMap(argv) {
  const sub = argv[0];
  if (!sub || isHelpFlag(sub)) {
    stdout("Usage: pier map <list|add|remove|where> ...");
    return;
  }

  if (sub === "list") {
    const config = readConfig();
    listMappings(
      config?.bridge?.workspaceRouteMapPath || DEFAULT_REGISTRY_PATH
    );
    return;
  }

  if (sub === "add") {
    const hostArg = argv[1];
    const cwdArg = argv[2] || process.cwd();
    if (!hostArg) {
      fail("Usage: pier map add <host.localhost> [cwd]");
    }
    const { host } = parseNameToHost(hostArg);
    const config = readConfig();
    const result = upsertRoute({
      host,
      cwd: cwdArg,
      source: "manual",
      filePath: config?.bridge?.workspaceRouteMapPath || DEFAULT_REGISTRY_PATH
    });
    stdout(`Mapped ${result.host} -> ${result.record.cwd}`);
    return;
  }

  if (sub === "remove" || sub === "rm") {
    const hostArg = argv[1];
    if (!hostArg) {
      fail("Usage: pier map remove <host.localhost>");
    }
    const { host } = parseNameToHost(hostArg);
    const config = readConfig();
    const result = removeRoute(host, {
      filePath: config?.bridge?.workspaceRouteMapPath || DEFAULT_REGISTRY_PATH
    });
    stdout(
      result.existed
        ? `Removed mapping for ${result.host}`
        : `No mapping found for ${result.host}`
    );
    return;
  }

  if (sub === "where") {
    const hostArg = argv[1];
    if (!hostArg) {
      fail("Usage: pier map where <host.localhost>");
    }
    const { host } = parseNameToHost(hostArg);
    const config = readConfig();
    const rows = listRoutes({
      filePath: config?.bridge?.workspaceRouteMapPath || DEFAULT_REGISTRY_PATH
    });
    const match = rows.find((row) => row.host === host);
    if (!match) {
      fail(`No mapping found for ${host}`);
    }
    stdout(match.cwd);
    return;
  }

  fail(`Unknown map subcommand: ${sub}`);
}

async function cmdBridge(argv) {
  const sub = argv[0];
  const configResult = ensureConfig();
  const config = configResult.config;

  if (!sub || isHelpFlag(sub)) {
    stdout("Usage: pier bridge <start|stop|status|logs> [--foreground]");
    return;
  }

  if (sub === "status") {
    const status = await getBridgeStatus(config);
    stdout(`Bridge: ${status.running ? "running" : "stopped"}`);
    stdout(
      `Health URL: http://${status.bridgeHost}:${status.bridgePort}/health`
    );
    stdout(`Config: ${CONFIG_PATH}`);
    stdout(`Log: ${status.logPath}`);
    stdout(`PID: ${status.pid || status.pidFilePid || "n/a"}`);
    if (status.health && !status.health.ok && status.health.error) {
      stdout(`Health error: ${status.health.error}`);
    }
    return;
  }

  if (sub === "logs") {
    stdout(BRIDGE_LOG_PATH);
    return;
  }

  if (sub === "start") {
    const foreground = argv.includes("--foreground");
    if (foreground) {
      stdout("Starting bridge in foreground...");
      const start = await startBridge(config, { foreground: true });
      await new Promise<void>((resolve) => {
        start.child.on("exit", (code, signal) => {
          process.exit(signal ? 1 : (code ?? 0));
        });
        start.child.on("error", (error) => {
          fail(`Bridge failed to start: ${String(error.message || error)}`);
          resolve();
        });
      });
      return;
    }

    const result = await startBridge(config);
    if (result.alreadyRunning) {
      stdout(
        `Bridge already running on http://${config.bridge.host}:${config.bridge.port}/health`
      );
      return;
    }
    stdout(`Bridge started (pid ${result.pid})`);
    stdout(`Health: http://${config.bridge.host}:${config.bridge.port}/health`);
    stdout(`Log: ${BRIDGE_LOG_PATH}`);
    return;
  }

  if (sub === "stop") {
    const result = await stopBridge(config);
    if (!result.stopped) {
      if (result.reason === "not-running") {
        stdout("Bridge is not running.");
        return;
      }
      if (result.reason === "pid-unknown") {
        fail(
          "Bridge appears to be running but PID is unknown. Stop it manually or restart via `pier bridge start`."
        );
      }
    }
    stdout(`Bridge stopped${result.forced ? " (forced)" : ""}.`);
    return;
  }

  fail(`Unknown bridge subcommand: ${sub}`);
}

function checkCommandAvailable(command, args = ["--version"]) {
  try {
    const result = spawnSync(command, args, {
      encoding: "utf8",
      timeout: 2000
    });
    if (result.error) {
      return { ok: false, error: String(result.error.message || result.error) };
    }
    if (typeof result.status === "number" && result.status !== 0) {
      return {
        ok: false,
        error: (
          result.stderr ||
          result.stdout ||
          `exit ${result.status}`
        ).trim()
      };
    }
    return { ok: true, output: (result.stdout || result.stderr || "").trim() };
  } catch (error) {
    return { ok: false, error: String(error.message || error) };
  }
}

function getPortlessProxyPort() {
  const value = Number.parseInt(
    String(process.env.PORTLESS_PORT || "1355"),
    10
  );
  if (!Number.isFinite(value) || value < 1 || value > 65535) {
    return 1355;
  }
  return value;
}

function getPortlessStateDir(proxyPort = getPortlessProxyPort()) {
  const override = String(process.env.PORTLESS_STATE_DIR || "").trim();
  if (override) {
    return path.resolve(override);
  }
  return proxyPort < 1024 ? "/tmp/portless" : path.join(os.homedir(), ".portless");
}

function isPortlessTlsEnabled(proxyPort = getPortlessProxyPort()) {
  try {
    return fs.existsSync(path.join(getPortlessStateDir(proxyPort), "proxy.tls"));
  } catch {
    return false;
  }
}

function isLikelyFilePath(value) {
  return (
    value.includes(path.sep) ||
    (path.sep === "/" ? value.includes("\\") : value.includes("/")) ||
    value.startsWith(".")
  );
}

function isNodeScriptPath(filePath) {
  return /\.(mjs|cjs|js)$/i.test(String(filePath || ""));
}

function resolvePortlessRunner() {
  const override = String(process.env.PIER_PORTLESS_BIN || "").trim();
  if (override) {
    if (isLikelyFilePath(override) || fs.existsSync(override)) {
      const resolved = path.resolve(override);
      if (!fs.existsSync(resolved)) {
        throw new Error(
          `PIER_PORTLESS_BIN points to a missing file: ${resolved}`
        );
      }
      if (isNodeScriptPath(resolved)) {
        return {
          source: "env",
          mode: "node-script",
          scriptPath: resolved
        };
      }
      return {
        source: "env",
        mode: "command",
        command: resolved
      };
    }

    const envCommand = checkCommandAvailable(override, ["--version"]);
    if (!envCommand.ok) {
      throw new Error(
        `PIER_PORTLESS_BIN command '${override}' is not executable: ${envCommand.error || "unknown error"}`
      );
    }
    return {
      source: "env",
      mode: "command",
      command: override
    };
  }

  const bundledCandidates = [
    // Published package layout: <pkg>/packages/cli-core/dist -> <pkg>/node_modules/portless/dist/cli.js
    path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "node_modules",
      "portless",
      "dist",
      "cli.js"
    ),
    // Repository source layout: <repo>/packages/cli-core/src -> <repo>/node_modules/portless/dist/cli.js
    path.resolve(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "node_modules",
      "portless",
      "dist",
      "cli.js"
    ),
    // Last-resort current working directory lookup.
    path.resolve(process.cwd(), "node_modules", "portless", "dist", "cli.js")
  ];
  for (const bundled of bundledCandidates) {
    if (fs.existsSync(bundled)) {
      return {
        source: "bundled",
        mode: "node-script",
        scriptPath: bundled
      };
    }
  }

  const fromPath = checkCommandAvailable("portless", ["--version"]);
  if (fromPath.ok) {
    return {
      source: "path",
      mode: "command",
      command: "portless"
    };
  }

  throw new Error(
    "Portless runtime unavailable. Reinstall Pier or set PIER_PORTLESS_BIN."
  );
}

function buildPortlessInvocation(runner, args = []) {
  if (runner.mode === "node-script") {
    return {
      command: process.execPath,
      args: [runner.scriptPath, ...args]
    };
  }
  return {
    command: runner.command,
    args: [...args]
  };
}

function runPortlessCommandSync(args = [], options: any = {}) {
  let runner = null;
  try {
    runner = options.runner || resolvePortlessRunner();
  } catch (error) {
    return {
      ok: false,
      runner: null,
      invocation: null,
      stdout: "",
      stderr: "",
      error: String(error.message || error),
      status: null
    };
  }
  const invocation = buildPortlessInvocation(runner, args);
  const result = spawnSync(invocation.command, invocation.args, {
    encoding: "utf8",
    timeout: options.timeoutMs || 30000,
    env: options.env || { ...process.env },
    cwd: options.cwd || process.cwd(),
    stdio: options.stdio || "pipe"
  });

  const stdoutValue = String(result.stdout || "").trim();
  const stderrValue = String(result.stderr || "").trim();
  const summary = [stderrValue, stdoutValue].filter(Boolean).join("\n");

  if (result.error) {
    return {
      ok: false,
      runner,
      invocation,
      stdout: stdoutValue,
      stderr: stderrValue,
      error: String(result.error.message || result.error),
      status: result.status
    };
  }

  if (typeof result.status === "number" && result.status !== 0) {
    return {
      ok: false,
      runner,
      invocation,
      stdout: stdoutValue,
      stderr: stderrValue,
      error: summary || `exit ${result.status}`,
      status: result.status
    };
  }

  return {
    ok: true,
    runner,
    invocation,
    stdout: stdoutValue,
    stderr: stderrValue,
    status: result.status
  };
}

function hasActivePortlessRoutes(runner) {
  const listResult = runPortlessCommandSync(["list"], {
    runner,
    timeoutMs: 4000
  });
  if (!listResult.ok) {
    return null;
  }
  const output = [listResult.stdout, listResult.stderr].filter(Boolean).join("\n");
  return !/no active routes/i.test(output);
}

function restartPortlessProxy({
  runner,
  https = false
}: {
  runner: any;
  https?: boolean;
}) {
  runPortlessCommandSync(["proxy", "stop"], {
    runner,
    timeoutMs: 15000
  });

  const startArgs = ["proxy", "start"];
  if (https) {
    startArgs.push("--https");
  }
  return runPortlessCommandSync(startArgs, {
    runner,
    timeoutMs: 45000
  });
}

function ensurePortlessProxy({
  https = false,
  restartIfIdle = false
} = {}) {
  const args = ["proxy", "start"];
  if (https) {
    args.push("--https");
  }
  const result = runPortlessCommandSync(args, { timeoutMs: 45000 });
  if (!result.ok) {
    throw new Error(
      `Failed to start portless proxy: ${result.error || "unknown error"}`
    );
  }
  const merged = [result.stdout, result.stderr].filter(Boolean).join("\n");
  const alreadyRunning = /already running/i.test(merged);
  let restarted = false;
  let warning = "";

  if (alreadyRunning && restartIfIdle) {
    const activeRoutes = hasActivePortlessRoutes(result.runner);
    if (activeRoutes === false) {
      const restartResult = restartPortlessProxy({
        runner: result.runner,
        https: https || isPortlessTlsEnabled(getPortlessProxyPort())
      });

      if (restartResult.ok) {
        restarted = true;
      } else {
        warning = `Failed to recycle idle proxy automatically: ${restartResult.error || "unknown error"}`;
      }
    }
  }

  return {
    runner: result.runner,
    alreadyRunning,
    restarted,
    warning,
    output: merged
  };
}

function getBundledExtensionPath() {
  return path.resolve(__dirname, "..", "..", "..", "extension");
}

function isValidExtensionDir(dirPath) {
  return REQUIRED_EXTENSION_FILES.every((relPath) =>
    fs.existsSync(path.join(dirPath, relPath))
  );
}

function resolveExtensionPath({ version = getPierVersion() } = {}) {
  const bundled = getBundledExtensionPath();
  if (isValidExtensionDir(bundled)) {
    return bundled;
  }
  return getInstalledExtensionPath({ version });
}

function getExtensionPath() {
  return (
    resolveExtensionPath({ version: getPierVersion() }) ||
    getBundledExtensionPath()
  );
}

function parseExtensionInstallArgs(argv) {
  const options = {
    force: false,
    from: null,
    version: getPierVersion()
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--force") {
      options.force = true;
      continue;
    }
    if (arg === "--version") {
      const value = argv[index + 1];
      if (!value) {
        fail(
          "Usage: pier extension install [--force] [--version <x.y.z>] [--from <url-or-file>]"
        );
      }
      options.version = value;
      index += 1;
      continue;
    }
    if (arg === "--from") {
      const value = argv[index + 1];
      if (!value) {
        fail(
          "Usage: pier extension install [--force] [--version <x.y.z>] [--from <url-or-file>]"
        );
      }
      options.from = value;
      index += 1;
      continue;
    }
    fail(`Unknown extension install option: ${arg}`);
  }

  return options;
}

async function cmdExtension(argv) {
  const sub = argv[0];
  if (!sub || isHelpFlag(sub)) {
    stdout("Usage:");
    stdout("  pier extension path");
    stdout("  pier extension url");
    stdout(
      "  pier extension install [--force] [--version <x.y.z>] [--from <url-or-file>]"
    );
    return;
  }

  if (sub === "url") {
    stdout(CHROME_WEB_STORE_URL);
    return;
  }

  if (sub === "path") {
    const extensionPath = resolveExtensionPath({ version: getPierVersion() });
    if (!extensionPath) {
      fail(
        "Manual extension bundle not found. Install from Chrome Web Store (recommended) or run `pier extension install`."
      );
    }
    stdout(extensionPath);
    return;
  }

  if (sub === "install") {
    const options = parseExtensionInstallArgs(argv.slice(1));
    const result = await installExtensionBundle(options);
    if (result.alreadyInstalled) {
      stdout(`Extension already installed at ${result.path}`);
      return;
    }
    stdout(`Extension installed at ${result.path}`);
    if (result.source) {
      stdout(`Source: ${result.source}`);
    }
    return;
  }

  fail(`Unknown extension subcommand: ${sub}`);
}

function parseSetupArgs(argv) {
  const options = {
    https: false,
    manualExtension: false
  };
  for (const arg of argv) {
    if (arg === "--https") {
      options.https = true;
      continue;
    }
    if (arg === "--manual-extension") {
      options.manualExtension = true;
      continue;
    }
    if (arg === "--skip-extension") {
      // Backward compatibility for earlier setup flag.
      continue;
    }
    fail(`Unknown setup option: ${arg}`);
  }
  return options;
}

async function cmdSetup(argv = []) {
  const setupOptions = parseSetupArgs(argv);
  const { config, created } = ensureConfig();
  const bridge = await startBridge(config);
  const proxy = ensurePortlessProxy({
    https: setupOptions.https,
    restartIfIdle: true
  });
  let extensionResult = null;
  let extensionError = null;

  if (setupOptions.manualExtension) {
    try {
      extensionResult = await installExtensionBundle({
        version: getPierVersion()
      });
    } catch (error) {
      extensionError = String(error.message || error);
      warn(
        `Extension install failed during setup (${extensionError}). Re-run: pier extension install`
      );
    }
  }

  stdout("pier setup");
  stdout("");
  stdout(`Config: ${CONFIG_PATH}${created ? " (created)" : ""}`);
  stdout(
    bridge.alreadyRunning
      ? `Bridge: already running on http://${config.bridge.host}:${config.bridge.port}/health`
      : `Bridge: started (pid ${bridge.pid})`
  );
  stdout(
    proxy.restarted
      ? `Portless proxy: restarted on port ${getPortlessProxyPort()}`
      : proxy.alreadyRunning
      ? `Portless proxy: already running on port ${getPortlessProxyPort()}`
      : `Portless proxy: started on port ${getPortlessProxyPort()}`
  );
  if (proxy.warning) {
    warn(proxy.warning);
  }
  if (!setupOptions.manualExtension) {
    stdout("Extension: use Chrome Web Store (recommended)");
  } else if (extensionResult && extensionResult.alreadyInstalled) {
    stdout(`Extension: already installed at ${extensionResult.path}`);
  } else if (extensionResult && extensionResult.path) {
    stdout(`Extension: installed at ${extensionResult.path}`);
  } else {
    stdout("Extension: manual install failed (setup continued)");
  }

  stdout("");
  stdout("Set these in the extension options:");
  stdout(
    `  WebSocket URL: ws://${config.bridge.host}:${config.bridge.port}/terminal`
  );
  stdout(`  Token: ${config.bridge.token}`);
  stdout("");

  const extensionPath = resolveExtensionPath({ version: getPierVersion() });
  stdout("Next steps:");
  stdout(
    `  1. Install Pier extension from Chrome Web Store: ${CHROME_WEB_STORE_URL}`
  );
  stdout("  2. Open extension settings and paste the WebSocket URL + token");
  stdout("  3. From any repo, run: pier myapp pnpm dev");

  stdout("");
  stdout("Manual unpacked extension (optional):");
  if (extensionPath) {
    stdout(`  - Load unpacked from: ${extensionPath}`);
  } else {
    stdout("  - Run: pier extension install");
    stdout("  - Then: pier extension path");
    stdout("  - Load that folder in chrome://extensions");
  }

  if (extensionError) {
    stdout("");
    stdout(`Extension install warning: ${extensionError}`);
  }
}

async function runPortlessApp(
  nameArg,
  commandArgs,
  { ensureBridge = true, cwd = process.cwd() } = {}
) {
  if (!nameArg) {
    fail("Usage: pier <name> <command> [args...]");
  }
  if (!commandArgs || commandArgs.length === 0) {
    fail("No command provided. Example: pier myapp pnpm dev");
  }

  const { host, portlessName } = parseNameToHost(nameArg);
  const normalizedCwd = normalizeRouteDir(cwd);
  const { config, created } = ensureConfig();

  upsertRoute({
    host,
    cwd: normalizedCwd,
    source: "tb-run",
    notes: `Managed by pier (${new Date().toISOString()})`,
    filePath: config.bridge.workspaceRouteMapPath
  });

  if (ensureBridge) {
    const bridge = await startBridge(config);
    if (created) {
      stdout(`[pier] Created config at ${CONFIG_PATH}`);
      stdout(`[pier] Set extension token to: ${config.bridge.token}`);
    }
    if (!bridge.alreadyRunning) {
      stdout(
        `[pier] Bridge started on http://${config.bridge.host}:${config.bridge.port}/health`
      );
    }
  }

  let proxy = null;
  try {
    proxy = ensurePortlessProxy({ restartIfIdle: true });
  } catch (error) {
    fail(String(error.message || error));
  }
  if (proxy.restarted) {
    stdout(
      `[pier] Recycled idle Portless proxy on port ${getPortlessProxyPort()}`
    );
  } else if (proxy.warning) {
    warn(proxy.warning);
  }

  stdout(`[pier] ${host} -> ${normalizedCwd}`);

  let runner = null;
  try {
    runner = resolvePortlessRunner();
  } catch (error) {
    fail(String(error.message || error));
  }
  const invocation = buildPortlessInvocation(runner, [
    portlessName,
    ...commandArgs
  ]);

  const child = spawn(invocation.command, invocation.args, {
    cwd: normalizedCwd,
    stdio: "inherit",
    env: { ...process.env }
  });

  child.on("error", (error) => {
    if (error && error.code === "ENOENT") {
      fail(
        "`portless` runtime not found. Reinstall `@malviyahimanshu/pier` or set PIER_PORTLESS_BIN."
      );
      return;
    }
    fail(`Failed to start portless: ${String(error.message || error)}`);
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code == null ? 1 : code);
  });
}

async function cmdDoctor() {
  const { config, created } = ensureConfig();
  const status = await getBridgeStatus(config);
  const registryExists = fs.existsSync(config.bridge.workspaceRouteMapPath);
  const proxyPort = getPortlessProxyPort();
  const proxyListening = await checkTcpOpen("127.0.0.1", proxyPort);
  const portlessVersion = runPortlessCommandSync(["--version"], {
    timeoutMs: 3000
  });

  stdout("pier doctor");
  stdout("");
  stdout(`State dir: ${STATE_DIR}`);
  stdout(`Config: ${CONFIG_PATH}`);
  stdout(`Config created now: ${created ? "yes" : "no"}`);
  stdout(`Bridge host: ${config.bridge.host}`);
  stdout(`Bridge port: ${config.bridge.port}`);
  stdout(
    `Bridge token: ${config.bridge.token ? `set (${config.bridge.token.length} chars)` : "missing"}`
  );
  stdout(
    `Registry path: ${config.bridge.workspaceRouteMapPath}${registryExists ? "" : " (will be created on first mapping)"}`
  );
  stdout(`Bridge status: ${status.running ? "running" : "stopped"}`);
  stdout(
    `Bridge health URL: http://${config.bridge.host}:${config.bridge.port}/health`
  );
  if (!status.running && status.health?.error) {
    stdout(`Bridge health error: ${status.health.error}`);
  }

  if (portlessVersion.ok) {
    stdout("Portless runtime: ok");
    stdout(`Portless source: ${portlessVersion.runner.source}`);
    if (portlessVersion.stdout || portlessVersion.stderr) {
      stdout(
        `Portless version: ${portlessVersion.stdout || portlessVersion.stderr}`
      );
    }
  } else {
    stdout("Portless runtime: missing/unavailable");
    stdout(`Portless error: ${portlessVersion.error || "unknown"}`);
    stdout(
      "Fix: reinstall `@malviyahimanshu/pier` or set PIER_PORTLESS_BIN to a valid portless executable."
    );
  }
  stdout(
    `Portless proxy: ${proxyListening ? "listening" : "not listening"} on 127.0.0.1:${proxyPort}`
  );

  const extensionPath = resolveExtensionPath({ version: getPierVersion() });
  stdout(`Extension (Chrome Web Store): ${CHROME_WEB_STORE_URL}`);
  stdout(`Extension bundle (manual): ${extensionPath || "not installed"}`);
  if (!extensionPath) {
    stdout("Optional manual install: pier extension install");
  }

  stdout("");
  stdout("Extension settings:");
  stdout(
    `  WebSocket URL: ws://${config.bridge.host}:${config.bridge.port}/terminal`
  );
  stdout(`  Token: ${config.bridge.token}`);
}

async function handleLegacyDevHosts(argv) {
  const sub = argv[0];
  if (!sub || isHelpFlag(sub)) {
    stdout("Legacy `dev-hosts` compatibility mode. Prefer `pier ...`.");
    stdout("Examples:");
    stdout("  pier myapp pnpm dev");
    stdout("  pier map list");
    return;
  }

  if (sub === "list") {
    return cmdMap(["list"]);
  }

  if (sub === "map") {
    return cmdMap(argv.slice(1));
  }

  if (sub === "run") {
    const hostArg = argv[1];
    if (!hostArg) {
      fail(
        "Usage: node scripts/dev-hosts.js run <host.localhost> [--cwd <dir>] -- <command> [args...]"
      );
    }
    const sep = argv.indexOf("--");
    if (sep === -1) {
      fail("`run` requires `--` before the command.");
    }
    const flagArgs = argv.slice(2, sep);
    const cmdArgs = argv.slice(sep + 1);
    let cwd = process.cwd();
    if (flagArgs.length > 0) {
      if (flagArgs[0] === "--cwd" && flagArgs[1]) {
        cwd = flagArgs[1];
        if (flagArgs.length > 2) {
          fail(`Unknown run option(s): ${flagArgs.slice(2).join(" ")}`);
        }
      } else {
        fail(`Unknown run option(s): ${flagArgs.join(" ")}`);
      }
    }
    return runPortlessApp(hostArg, cmdArgs, { cwd });
  }

  fail(`Unknown dev-hosts command: ${sub}`);
}

async function main(argv = process.argv.slice(2)) {
  const args = Array.isArray(argv) ? [...argv] : [];
  const first = args[0];

  if (!first || isHelpFlag(first)) {
    printHelp();
    return;
  }

  if (first === "legacy-dev-hosts") {
    await handleLegacyDevHosts(args.slice(1));
    return;
  }

  if (first === "map") {
    cmdMap(args.slice(1));
    return;
  }

  if (first === "bridge") {
    await cmdBridge(args.slice(1));
    return;
  }

  if (first === "doctor") {
    await cmdDoctor();
    return;
  }

  if (first === "extension") {
    await cmdExtension(args.slice(1));
    return;
  }

  if (first === "setup") {
    await cmdSetup(args.slice(1));
    return;
  }

  if (first === "version" || first === "--version" || first === "-v") {
    stdout(getPierVersion());
    return;
  }

  await runPortlessApp(first, args.slice(1));
}

module.exports = {
  cmdExtension,
  ensurePortlessProxy,
  getExtensionPath,
  getPortlessProxyPort,
  main,
  parseNameToHost,
  resolvePortlessRunner,
  runPortlessApp
};

export {};
