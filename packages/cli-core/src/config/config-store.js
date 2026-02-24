const fs = require("fs");
const http = require("http");
const net = require("net");
const os = require("os");
const path = require("path");
const { randomHexToken } = require("../../../shared/src");

const { DEFAULT_REGISTRY_PATH } = require("../workspace-registry/registry");

const STATE_DIR = path.join(os.homedir(), ".pier");
const CONFIG_PATH = path.join(STATE_DIR, "config.json");
const BRIDGE_PID_PATH = path.join(STATE_DIR, "bridge.pid");
const BRIDGE_LOG_PATH = path.join(STATE_DIR, "bridge.log");

const DEFAULT_CONFIG_VERSION = 1;
const DEFAULT_BRIDGE_HOST = "127.0.0.1";
const DEFAULT_BRIDGE_PORT = 4570;

function nowIso() {
  return new Date().toISOString();
}

function randomToken(length = 48) {
  return randomHexToken(length);
}

function ensureDir(dirPath = STATE_DIR) {
  fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
}

function atomicWriteJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  const tmpPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`
  );
  fs.writeFileSync(tmpPath, JSON.stringify(value, null, 2) + "\n", {
    mode: 0o600
  });
  fs.renameSync(tmpPath, filePath);
}

function normalizeBridgePort(input, fallback = DEFAULT_BRIDGE_PORT) {
  const value = Number.parseInt(String(input), 10);
  if (!Number.isFinite(value) || value < 1 || value > 65535) {
    return fallback;
  }
  return value;
}

function normalizeBridgeHost(input, fallback = DEFAULT_BRIDGE_HOST) {
  const host = String(input || "").trim() || fallback;
  return host;
}

function normalizeConfig(raw) {
  const input = raw && typeof raw === "object" ? raw : {};
  const bridge =
    input.bridge && typeof input.bridge === "object" ? input.bridge : {};
  const createdAt =
    typeof input.createdAt === "string" ? input.createdAt : nowIso();

  return {
    version: DEFAULT_CONFIG_VERSION,
    createdAt,
    updatedAt:
      typeof input.updatedAt === "string" ? input.updatedAt : createdAt,
    bridge: {
      host: normalizeBridgeHost(bridge.host),
      port: normalizeBridgePort(bridge.port),
      token:
        typeof bridge.token === "string" && bridge.token.trim()
          ? bridge.token.trim()
          : randomToken(),
      defaultCwd:
        typeof bridge.defaultCwd === "string" && bridge.defaultCwd.trim()
          ? path.resolve(bridge.defaultCwd)
          : os.homedir(),
      shell:
        typeof bridge.shell === "string" && bridge.shell.trim()
          ? bridge.shell.trim()
          : null,
      workspaceRouteMapPath:
        typeof bridge.workspaceRouteMapPath === "string" &&
        bridge.workspaceRouteMapPath.trim()
          ? path.resolve(bridge.workspaceRouteMapPath)
          : DEFAULT_REGISTRY_PATH
    }
  };
}

function readConfig() {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return normalizeConfig(raw);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function writeConfig(config) {
  const normalized = normalizeConfig(config);
  normalized.updatedAt = nowIso();
  atomicWriteJson(CONFIG_PATH, normalized);
  return normalized;
}

function ensureConfig() {
  const existing = readConfig();
  if (existing) {
    return { config: existing, created: false };
  }
  const createdConfig = writeConfig({});
  return { config: createdConfig, created: true };
}

function readPidFile() {
  try {
    const raw = fs.readFileSync(BRIDGE_PID_PATH, "utf8").trim();
    const pid = Number.parseInt(raw, 10);
    if (!Number.isFinite(pid) || pid <= 0) {
      return null;
    }
    return pid;
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function writePidFile(pid) {
  ensureDir();
  fs.writeFileSync(BRIDGE_PID_PATH, `${pid}\n`, { mode: 0o600 });
}

function removePidFile() {
  try {
    fs.unlinkSync(BRIDGE_PID_PATH);
  } catch (error) {
    if (!error || error.code !== "ENOENT") {
      throw error;
    }
  }
}

function pidExists(pid) {
  if (!Number.isFinite(pid) || pid <= 0) {
    return false;
  }
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function httpJsonGet(urlString, timeoutMs = 1000) {
  return new Promise((resolve, reject) => {
    const req = http.get(urlString, { timeout: timeoutMs }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        let parsed = null;
        try {
          parsed = body ? JSON.parse(body) : null;
        } catch {
          parsed = null;
        }
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body,
          json: parsed
        });
      });
    });

    req.on("timeout", () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", reject);
  });
}

async function getBridgeHealth(config) {
  const url = `http://${config.bridge.host}:${config.bridge.port}/health`;
  try {
    const result = await httpJsonGet(url, 700);
    if (result.statusCode === 200 && result.json && result.json.ok) {
      return { ok: true, url, response: result.json };
    }
    return { ok: false, url, error: `Unexpected status ${result.statusCode}` };
  } catch (error) {
    return { ok: false, url, error: String(error.message || error) };
  }
}

async function waitForBridgeHealthy(
  config,
  { attempts = 20, intervalMs = 250 } = {}
) {
  let last = null;
  for (let index = 0; index < attempts; index += 1) {
    last = await getBridgeHealth(config);
    if (last.ok) {
      return last;
    }
    await sleep(intervalMs);
  }
  return last || { ok: false, error: "unknown" };
}

function findPidOnPort(port) {
  if (process.platform === "win32") {
    return null;
  }

  try {
    const { spawnSync } = require("child_process");
    const result = spawnSync("lsof", ["-ti", `tcp:${port}`, "-sTCP:LISTEN"], {
      encoding: "utf8",
      timeout: 1000
    });
    if (result.status !== 0 || !result.stdout) {
      return null;
    }
    const firstLine = result.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);
    const pid = Number.parseInt(String(firstLine || ""), 10);
    return Number.isFinite(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function checkTcpOpen(host, port, timeoutMs = 400) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    const finish = (open) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(open);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
    socket.connect(port, host);
  });
}

module.exports = {
  BRIDGE_LOG_PATH,
  BRIDGE_PID_PATH,
  CONFIG_PATH,
  DEFAULT_BRIDGE_HOST,
  DEFAULT_BRIDGE_PORT,
  STATE_DIR,
  atomicWriteJson,
  checkTcpOpen,
  ensureConfig,
  ensureDir,
  findPidOnPort,
  getBridgeHealth,
  normalizeConfig,
  pidExists,
  randomToken,
  readConfig,
  readPidFile,
  removePidFile,
  sleep,
  waitForBridgeHealthy,
  writeConfig,
  writePidFile
};
