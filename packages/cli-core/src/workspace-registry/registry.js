const fs = require("fs");
const os = require("os");
const path = require("path");

const REGISTRY_VERSION = 1;
const REGISTRY_DIR = path.join(os.homedir(), ".pier");
const DEFAULT_REGISTRY_PATH = path.join(REGISTRY_DIR, "workspace-routes.json");
const LOCALHOST_SUFFIX = ".localhost";
const HOST_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

function isLoopbackLiteral(host) {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "[::1]"
  );
}

function normalizeRouteHost(value, { allowLoopbackLiteral = true } = {}) {
  let raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw) {
    throw new Error("Host is required.");
  }

  if (raw.includes("://")) {
    let parsed;
    try {
      parsed = new URL(raw);
    } catch {
      throw new Error(`Invalid URL/host: ${value}`);
    }
    raw = String(parsed.hostname || "")
      .trim()
      .toLowerCase();
  }

  if (!raw) {
    throw new Error("Host is required.");
  }

  if (raw.endsWith(".")) {
    raw = raw.slice(0, -1);
  }

  if (!raw) {
    throw new Error("Host is required.");
  }

  if (raw.includes("/")) {
    throw new Error(`Host must not contain a path: ${value}`);
  }

  if (raw.includes(":") && !raw.startsWith("[") && raw !== "::1") {
    throw new Error(`Host must not include a port: ${value}`);
  }

  if (isLoopbackLiteral(raw)) {
    if (!allowLoopbackLiteral) {
      throw new Error(
        "Loopback literal hosts are not allowed here. Use a .localhost hostname."
      );
    }
    return raw;
  }

  if (!raw.endsWith(LOCALHOST_SUFFIX)) {
    throw new Error(`Host must end with ${LOCALHOST_SUFFIX}: ${value}`);
  }

  if (raw.length > 253) {
    throw new Error(`Host is too long: ${value}`);
  }

  const withoutSuffix = raw.slice(0, -LOCALHOST_SUFFIX.length);
  if (!withoutSuffix) {
    throw new Error(
      `Host must include a name before ${LOCALHOST_SUFFIX}: ${value}`
    );
  }

  const labels = withoutSuffix.split(".");
  for (const label of labels) {
    if (!HOST_LABEL_PATTERN.test(label)) {
      throw new Error(`Invalid hostname label "${label}" in ${value}`);
    }
  }

  return raw;
}

function normalizeRouteDir(value) {
  const input = String(value || "").trim();
  if (!input) {
    throw new Error("Directory path is required.");
  }

  const absolute = path.resolve(input);
  const real = fs.realpathSync(absolute);
  const stat = fs.statSync(real);
  if (!stat.isDirectory()) {
    throw new Error(`Not a directory: ${real}`);
  }
  return real;
}

function ensureRegistryShape(raw) {
  const base = raw && typeof raw === "object" ? raw : {};
  const routes = {};
  const routeEntries =
    base.routes && typeof base.routes === "object"
      ? Object.entries(base.routes)
      : [];

  for (const [hostKey, record] of routeEntries) {
    try {
      const host = normalizeRouteHost(hostKey);
      if (!record || typeof record !== "object") {
        continue;
      }
      if (typeof record.cwd !== "string" || !record.cwd.trim()) {
        continue;
      }
      routes[host] = {
        cwd: String(record.cwd),
        createdAt:
          typeof record.createdAt === "string" ? record.createdAt : undefined,
        updatedAt:
          typeof record.updatedAt === "string" ? record.updatedAt : undefined,
        source: typeof record.source === "string" ? record.source : undefined,
        notes: typeof record.notes === "string" ? record.notes : undefined
      };
    } catch {
      // Ignore invalid registry entries so one bad row does not block all mappings.
    }
  }

  return {
    version: REGISTRY_VERSION,
    updatedAt: typeof base.updatedAt === "string" ? base.updatedAt : null,
    routes
  };
}

function readRegistry(filePath = DEFAULT_REGISTRY_PATH) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    return ensureRegistryShape(JSON.parse(raw));
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return ensureRegistryShape(null);
    }
    throw error;
  }
}

function writeRegistry(registry, filePath = DEFAULT_REGISTRY_PATH) {
  const normalized = ensureRegistryShape(registry);
  normalized.updatedAt = new Date().toISOString();

  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const tmpPath = path.join(
    dir,
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.${Math.random().toString(16).slice(2)}.tmp`
  );
  const payload = JSON.stringify(normalized, null, 2) + "\n";
  fs.writeFileSync(tmpPath, payload, { mode: 0o600 });
  fs.renameSync(tmpPath, filePath);

  return normalized;
}

function upsertRoute({
  host,
  cwd,
  source,
  notes,
  filePath = DEFAULT_REGISTRY_PATH
}) {
  const normalizedHost = normalizeRouteHost(host);
  const normalizedDir = normalizeRouteDir(cwd);
  const registry = readRegistry(filePath);
  const now = new Date().toISOString();
  const existing = registry.routes[normalizedHost] || {};

  registry.routes[normalizedHost] = {
    cwd: normalizedDir,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    source:
      typeof source === "string" && source.trim()
        ? source.trim()
        : existing.source,
    notes:
      typeof notes === "string" && notes.trim() ? notes.trim() : existing.notes
  };

  const written = writeRegistry(registry, filePath);
  return {
    host: normalizedHost,
    record: written.routes[normalizedHost],
    registryPath: filePath
  };
}

function removeRoute(host, { filePath = DEFAULT_REGISTRY_PATH } = {}) {
  const normalizedHost = normalizeRouteHost(host);
  const registry = readRegistry(filePath);
  const existed = Boolean(registry.routes[normalizedHost]);
  if (existed) {
    delete registry.routes[normalizedHost];
    writeRegistry(registry, filePath);
  }
  return { host: normalizedHost, existed, registryPath: filePath };
}

function listRoutes({ filePath = DEFAULT_REGISTRY_PATH } = {}) {
  const registry = readRegistry(filePath);
  return Object.entries(registry.routes)
    .map(([host, record]) => ({ host, ...record }))
    .sort((a, b) => a.host.localeCompare(b.host));
}

function resolveWorkspaceForHost(
  host,
  { filePath = DEFAULT_REGISTRY_PATH } = {}
) {
  const normalizedHost = normalizeRouteHost(host);
  const registry = readRegistry(filePath);
  const record = registry.routes[normalizedHost];
  if (!record || typeof record.cwd !== "string" || !record.cwd.trim()) {
    return null;
  }

  try {
    const cwd = normalizeRouteDir(record.cwd);
    return {
      host: normalizedHost,
      cwd,
      record,
      registryPath: filePath
    };
  } catch {
    return null;
  }
}

module.exports = {
  DEFAULT_REGISTRY_PATH,
  LOCALHOST_SUFFIX,
  listRoutes,
  normalizeRouteDir,
  normalizeRouteHost,
  readRegistry,
  removeRoute,
  resolveWorkspaceForHost,
  upsertRoute,
  writeRegistry
};
