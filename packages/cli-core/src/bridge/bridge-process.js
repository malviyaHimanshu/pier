const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const {
  BRIDGE_LOG_PATH,
  checkTcpOpen,
  ensureDir,
  findPidOnPort,
  getBridgeHealth,
  pidExists,
  readPidFile,
  removePidFile,
  sleep,
  waitForBridgeHealthy,
  writePidFile
} = require("../config/config-store");

function bridgeServerScriptPath() {
  return path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "server",
    "pier-server.js"
  );
}

async function getBridgeStatus(config) {
  const health = await getBridgeHealth(config);
  const pid = readPidFile();
  const pidAlive = pid ? pidExists(pid) : false;

  if (pid && !pidAlive && !health.ok) {
    try {
      removePidFile();
    } catch {
      // ignore stale pid cleanup failures
    }
  }

  return {
    running: Boolean(health.ok),
    health,
    pid: pidAlive ? pid : null,
    pidFilePid: pid || null,
    pidAlive,
    bridgeHost: config.bridge.host,
    bridgePort: config.bridge.port,
    logPath: BRIDGE_LOG_PATH
  };
}

function buildBridgeEnv(config) {
  const env = {
    ...process.env,
    PIER_HOST: config.bridge.host,
    PIER_PORT: String(config.bridge.port),
    PIER_TOKEN: config.bridge.token,
    PIER_CWD: config.bridge.defaultCwd,
    PIER_WORKSPACE_ROUTE_MAP: config.bridge.workspaceRouteMapPath
  };
  if (config.bridge.shell) {
    env.PIER_SHELL = config.bridge.shell;
  }
  return env;
}

async function startBridge(config, { foreground = false } = {}) {
  const current = await getBridgeStatus(config);
  if (current.running) {
    if (!current.pid && current.pidFilePid && !current.pidAlive) {
      // running without our tracked pid; keep going as healthy.
    }
    return { started: false, alreadyRunning: true, status: current };
  }

  ensureDir();
  const serverScript = bridgeServerScriptPath();
  const env = buildBridgeEnv(config);

  if (foreground) {
    const child = spawn(process.execPath, [serverScript], {
      env,
      stdio: "inherit"
    });
    return { started: true, foreground: true, child };
  }

  const logFd = fs.openSync(BRIDGE_LOG_PATH, "a", 0o600);
  const child = spawn(process.execPath, [serverScript], {
    env,
    detached: true,
    stdio: ["ignore", logFd, logFd]
  });
  fs.closeSync(logFd);

  if (!child.pid) {
    throw new Error("Failed to start bridge daemon (missing child pid).");
  }

  writePidFile(child.pid);
  child.unref();

  const health = await waitForBridgeHealthy(config);
  if (!health || !health.ok) {
    throw new Error(
      `Bridge failed to become healthy. See log: ${BRIDGE_LOG_PATH}`
    );
  }

  return {
    started: true,
    alreadyRunning: false,
    pid: child.pid,
    status: await getBridgeStatus(config)
  };
}

async function stopBridge(config) {
  const statusBefore = await getBridgeStatus(config);
  if (!statusBefore.running && !statusBefore.pidFilePid) {
    return { stopped: false, reason: "not-running", status: statusBefore };
  }

  let pid = statusBefore.pid || statusBefore.pidFilePid || null;

  if (!pid && statusBefore.running) {
    pid = findPidOnPort(config.bridge.port);
  }

  if (!pid) {
    return {
      stopped: false,
      reason: "pid-unknown",
      status: statusBefore
    };
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch (error) {
    if (error && error.code !== "ESRCH") {
      throw error;
    }
  }

  for (let i = 0; i < 20; i += 1) {
    const health = await getBridgeHealth(config);
    const open = await checkTcpOpen(config.bridge.host, config.bridge.port);
    if (!health.ok && !open) {
      try {
        removePidFile();
      } catch {
        // ignore
      }
      return {
        stopped: true,
        pid,
        status: await getBridgeStatus(config)
      };
    }
    await sleep(200);
  }

  try {
    process.kill(pid, "SIGKILL");
  } catch (error) {
    if (error && error.code !== "ESRCH") {
      throw error;
    }
  }
  await sleep(200);
  try {
    removePidFile();
  } catch {
    // ignore
  }

  return {
    stopped: true,
    forced: true,
    pid,
    status: await getBridgeStatus(config)
  };
}

module.exports = {
  BRIDGE_LOG_PATH,
  bridgeServerScriptPath,
  getBridgeStatus,
  startBridge,
  stopBridge
};
