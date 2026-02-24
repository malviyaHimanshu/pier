const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const {
  listRoutes,
  normalizeRouteDir,
  removeRoute,
  upsertRoute,
  LOCALHOST_SUFFIX,
  DEFAULT_REGISTRY_PATH
} = require("../server/workspace-registry");
const { BRIDGE_LOG_PATH, CONFIG_PATH, ensureConfig, readConfig, writeConfig, STATE_DIR } = require("./pier-utils");
const { getBridgeStatus, startBridge, stopBridge } = require("./pier-bridge");

function stdout(message = "") {
  process.stdout.write(`${message}\n`);
}

function stderr(message = "") {
  process.stderr.write(`${message}\n`);
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
  stdout("  pier doctor");
  stdout("  pier setup");
  stdout("");
  stdout("Examples:");
  stdout("  pier myapp pnpm dev");
  stdout("  pier api.myapp next dev");
  stdout("  pier map add myapp.localhost /path/to/project");
  stdout("");
  stdout("Legacy compatibility:");
  stdout("  node scripts/dev-hosts.js ...");
}

function isHelpFlag(value) {
  return value === "--help" || value === "-h" || value === "help";
}

function parseNameToHost(nameInput) {
  const raw = String(nameInput || "").trim().toLowerCase();
  if (!raw) {
    throw new Error("App name is required.");
  }

  const host = raw.endsWith(LOCALHOST_SUFFIX) ? raw : `${raw}${LOCALHOST_SUFFIX}`;
  const withoutSuffix = host.slice(0, -LOCALHOST_SUFFIX.length);
  if (!withoutSuffix) {
    throw new Error("Invalid app name.");
  }

  // Reuse registry validation by attempting add-path normalization via the existing host parser indirectly.
  // `upsertRoute` validates host, but we validate with a no-op strategy to avoid FS writes.
  const { normalizeRouteHost } = require("../server/workspace-registry");
  const normalizedHost = normalizeRouteHost(host, { allowLoopbackLiteral: false });
  const portlessName = normalizedHost.slice(0, -LOCALHOST_SUFFIX.length);

  return { host: normalizedHost, portlessName };
}

function listMappings(filePath = DEFAULT_REGISTRY_PATH) {
  const rows = listRoutes({ filePath });
  if (rows.length === 0) {
    stdout(`No mappings found. Registry: ${filePath}`);
    return;
  }
  const hostWidth = Math.max("HOST".length, ...rows.map((row) => row.host.length));
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
    listMappings(config?.bridge?.workspaceRouteMapPath || DEFAULT_REGISTRY_PATH);
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
    stdout(result.existed ? `Removed mapping for ${result.host}` : `No mapping found for ${result.host}`);
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
    stdout(`Health URL: http://${status.bridgeHost}:${status.bridgePort}/health`);
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
      await new Promise((resolve) => {
        start.child.on("exit", (code, signal) => {
          process.exit(signal ? 1 : code ?? 0);
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
      stdout(`Bridge already running on http://${config.bridge.host}:${config.bridge.port}/health`);
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
        fail("Bridge appears to be running but PID is unknown. Stop it manually or restart via `pier bridge start`.");
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
      return { ok: false, error: (result.stderr || result.stdout || `exit ${result.status}`).trim() };
    }
    return { ok: true, output: (result.stdout || result.stderr || "").trim() };
  } catch (error) {
    return { ok: false, error: String(error.message || error) };
  }
}

async function cmdDoctor() {
  const { config, created } = ensureConfig();
  const status = await getBridgeStatus(config);
  const portless = checkCommandAvailable("portless", ["--version"]);
  const registryExists = fs.existsSync(config.bridge.workspaceRouteMapPath);

  stdout("pier doctor");
  stdout("");
  stdout(`State dir: ${STATE_DIR}`);
  stdout(`Config: ${CONFIG_PATH}`);
  stdout(`Config created now: ${created ? "yes" : "no"}`);
  stdout(`Bridge host: ${config.bridge.host}`);
  stdout(`Bridge port: ${config.bridge.port}`);
  stdout(`Bridge token: ${config.bridge.token ? `set (${config.bridge.token.length} chars)` : "missing"}`);
  stdout(`Registry path: ${config.bridge.workspaceRouteMapPath}${registryExists ? "" : " (will be created on first mapping)"}`);
  stdout(`Bridge status: ${status.running ? "running" : "stopped"}`);
  stdout(`Bridge health URL: http://${config.bridge.host}:${config.bridge.port}/health`);
  if (!status.running && status.health?.error) {
    stdout(`Bridge health error: ${status.health.error}`);
  }
  stdout(`portless: ${portless.ok ? "ok" : "missing/unavailable"}`);
  if (portless.ok && portless.output) {
    stdout(`portless version: ${portless.output}`);
  }
  if (!portless.ok) {
    stdout("Install portless: npm install -g portless");
  }
  stdout("");
  stdout("Extension settings:");
  stdout(`  WebSocket URL: ws://${config.bridge.host}:${config.bridge.port}/terminal`);
  stdout(`  Token: ${config.bridge.token}`);
}

async function cmdSetup() {
  const { config, created } = ensureConfig();
  const bridge = await startBridge(config);

  stdout("pier setup");
  stdout("");
  stdout(`Config: ${CONFIG_PATH}${created ? " (created)" : ""}`);
  stdout(
    bridge.alreadyRunning
      ? `Bridge: already running on http://${config.bridge.host}:${config.bridge.port}/health`
      : `Bridge: started (pid ${bridge.pid})`
  );
  stdout("");
  stdout("Set these in the extension options:");
  stdout(`  WebSocket URL: ws://${config.bridge.host}:${config.bridge.port}/terminal`);
  stdout(`  Token: ${config.bridge.token}`);
  stdout("");
  stdout("Then use from any repo:");
  stdout("  pier myapp pnpm dev");
}

async function runPortlessApp(nameArg, commandArgs, { ensureBridge = true, cwd = process.cwd() } = {}) {
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
      stdout(`[pier] Bridge started on http://${config.bridge.host}:${config.bridge.port}/health`);
    }
  }

  stdout(`[pier] ${host} -> ${normalizedCwd}`);

  const child = spawn("portless", [portlessName, ...commandArgs], {
    cwd: normalizedCwd,
    stdio: "inherit",
    env: { ...process.env }
  });

  child.on("error", (error) => {
    if (error && error.code === "ENOENT") {
      fail("`portless` not found in PATH. Install it first: npm install -g portless");
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
      fail("Usage: node scripts/dev-hosts.js run <host.localhost> [--cwd <dir>] -- <command> [args...]");
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

  if (first === "setup") {
    await cmdSetup();
    return;
  }

  if (first === "version" || first === "--version" || first === "-v") {
    const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf8"));
    stdout(pkg.version || "0.0.0");
    return;
  }

  await runPortlessApp(first, args.slice(1));
}

module.exports = {
  main,
  parseNameToHost,
  runPortlessApp
};
