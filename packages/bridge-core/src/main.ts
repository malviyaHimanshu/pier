const http = require("http");
const { spawn } = require("child_process");
const nodeCrypto = require("crypto");
const fs = require("fs");
const path = require("path");
const pty = require("node-pty");
const { WebSocketServer } = require("ws");
const { normalizeSessionId } = require("../../shared/dist");
const {
  resolveWorkspaceForHost
} = require("../../cli-core/dist/workspace-registry/registry");
const { getShellEnv, readBridgeEnv, toInt } = require("./config/env");
const {
  getRequestedPageContext,
  isAllowedOrigin
} = require("./security/origin-policy");

const ENV = readBridgeEnv(process.env);
const HOST = ENV.host;
const PORT = ENV.port;
const TOKEN = ENV.token;
const DEFAULT_CWD = ENV.defaultCwd;
const SHELL = ENV.shell;
const TERM_PROGRAM = ENV.termProgram;
const TERM_PROGRAM_VERSION = ENV.termProgramVersion;
const WORKSPACE_ROUTE_MAP_PATH = ENV.workspaceRouteMapPath;

function ensurePtyHelperPermissions() {
  if (process.platform === "win32") {
    return;
  }

  try {
    const packageJsonPath = require.resolve("node-pty/package.json");
    const ptyRoot = path.dirname(packageJsonPath);
    const helperPath = path.join(
      ptyRoot,
      "prebuilds",
      `${process.platform}-${process.arch}`,
      "spawn-helper"
    );

    if (!fs.existsSync(helperPath)) {
      return;
    }

    const stat = fs.statSync(helperPath);
    const hasAnyExecBit = Boolean(stat.mode & 0o111);
    if (hasAnyExecBit) {
      return;
    }

    const updatedMode = stat.mode | 0o755;
    fs.chmodSync(helperPath, updatedMode);
    console.log(`[pier] fixed execute permission on ${helperPath}`);
  } catch (error) {
    console.warn(
      `[pier] unable to auto-fix node-pty helper permissions: ${error.message}`
    );
  }
}

const SESSION_DETACH_TIMEOUT_MS = ENV.sessionDetachTimeoutMs;
const sessions = new Map();

function sendJson(ws, payload) {
  if (ws.readyState !== 1) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function generateSessionId() {
  if (typeof nodeCrypto.randomUUID === "function") {
    return nodeCrypto.randomUUID();
  }
  return nodeCrypto.randomBytes(16).toString("hex");
}

function resolveSessionCwd(pageContext) {
  const pageHost = pageContext?.pageHost || null;
  if (!pageHost) {
    return {
      cwd: DEFAULT_CWD,
      source: "default",
      pageHost: null
    };
  }

  try {
    const match = resolveWorkspaceForHost(pageHost, {
      filePath: WORKSPACE_ROUTE_MAP_PATH || undefined
    });

    if (match && match.cwd) {
      return {
        cwd: match.cwd,
        source: "mapped",
        pageHost: match.host,
        registryPath: match.registryPath
      };
    }
  } catch (error) {
    console.warn(
      `[pier] failed to read workspace route map: ${error.message || error}`
    );
  }

  return {
    cwd: DEFAULT_CWD,
    source: "default",
    pageHost
  };
}

function createTerminalSession(cols, rows, { cwd }) {
  const shellArgs = process.platform === "win32" ? [] : ["-l"];
  const shellCwd = cwd || DEFAULT_CWD;

  try {
    const ptyProcess = pty.spawn(SHELL, shellArgs, {
      cols,
      rows,
      cwd: shellCwd,
      env: getShellEnv({
        termProgram: TERM_PROGRAM,
        termProgramVersion: TERM_PROGRAM_VERSION
      }),
      name: "xterm-256color"
    });

    return {
      mode: "pty",
      write(data) {
        ptyProcess.write(data);
      },
      resize(nextCols, nextRows) {
        ptyProcess.resize(nextCols, nextRows);
      },
      kill() {
        ptyProcess.kill();
      },
      onOutput(handler) {
        ptyProcess.onData(handler);
      },
      onExit(handler) {
        ptyProcess.onExit(({ exitCode, signal }) => handler(exitCode, signal));
      },
      onError() {
        // node-pty doesn't expose an error stream for spawn failures after construction.
      }
    };
  } catch (error) {
    console.warn(
      `[pier] node-pty unavailable (${error.message}), falling back to child_process`
    );

    const child = spawn(SHELL, shellArgs, {
      cwd: shellCwd,
      env: getShellEnv({
        termProgram: TERM_PROGRAM,
        termProgramVersion: TERM_PROGRAM_VERSION
      }),
      stdio: "pipe"
    });

    if (child.stdout) {
      child.stdout.setEncoding("utf8");
    }
    if (child.stderr) {
      child.stderr.setEncoding("utf8");
    }

    return {
      mode: "pipe",
      write(data) {
        if (child.stdin && !child.stdin.destroyed) {
          child.stdin.write(data);
        }
      },
      resize() {
        // No-op in pipe mode.
      },
      kill() {
        child.kill();
      },
      onOutput(handler) {
        if (child.stdout) {
          child.stdout.on("data", handler);
        }
        if (child.stderr) {
          child.stderr.on("data", handler);
        }
      },
      onExit(handler) {
        child.on("exit", (exitCode, signal) =>
          handler(exitCode ?? 0, signal ?? null)
        );
      },
      onError(handler) {
        child.on("error", handler);
      }
    };
  }
}

function broadcastToSession(sessionRecord, payload) {
  for (const client of sessionRecord.clients) {
    sendJson(client, payload);
  }
}

function stopSessionDetachTimer(sessionRecord) {
  if (!sessionRecord.detachTimer) {
    return;
  }
  clearTimeout(sessionRecord.detachTimer);
  sessionRecord.detachTimer = null;
}

function scheduleSessionDetach(sessionRecord) {
  stopSessionDetachTimer(sessionRecord);
  sessionRecord.detachTimer = setTimeout(() => {
    sessionRecord.detachTimer = null;
    if (sessionRecord.clients.size > 0 || sessionRecord.exited) {
      return;
    }
    console.log(
      `[pier] session idle timeout reached id=${sessionRecord.id}, terminating shell`
    );
    try {
      sessionRecord.shell.kill();
    } catch {
      sessions.delete(sessionRecord.id);
    }
  }, SESSION_DETACH_TIMEOUT_MS);
}

function teardownSession(sessionRecord) {
  stopSessionDetachTimer(sessionRecord);
  sessions.delete(sessionRecord.id);
  sessionRecord.clients.clear();
}

function createManagedSession(sessionId, cols, rows, { cwd, pageHost }) {
  const shell = createTerminalSession(cols, rows, { cwd });
  const sessionRecord = {
    id: sessionId,
    shell,
    mode: shell.mode,
    cwd: cwd || DEFAULT_CWD,
    pageHost: pageHost || null,
    cols,
    rows,
    clients: new Set(),
    detachTimer: null,
    exited: false
  };

  sessions.set(sessionId, sessionRecord);

  shell.onOutput((data) => {
    broadcastToSession(sessionRecord, { type: "output", data });
  });

  shell.onExit((exitCode, signal) => {
    sessionRecord.exited = true;
    broadcastToSession(sessionRecord, { type: "exit", exitCode, signal });
    for (const client of sessionRecord.clients) {
      const wsClient = client as any;
      if (wsClient.readyState < 2) {
        wsClient.close();
      }
    }
    teardownSession(sessionRecord);
    console.log(
      `[pier] session exited id=${sessionRecord.id} code=${exitCode} signal=${signal}`
    );
  });

  shell.onError((error) => {
    broadcastToSession(sessionRecord, {
      type: "error",
      message: String(error.message || error)
    });
  });

  return sessionRecord;
}

function attachClientToSession(sessionRecord, ws, cols, rows, reused) {
  sessionRecord.cols = cols;
  sessionRecord.rows = rows;
  try {
    sessionRecord.shell.resize(cols, rows);
  } catch {
    // Resize can fail transiently during process startup/teardown.
  }

  stopSessionDetachTimer(sessionRecord);
  sessionRecord.clients.add(ws);
  sendJson(ws, { type: "session", sessionId: sessionRecord.id, reused });

  if (sessionRecord.mode === "pipe") {
    sendJson(ws, {
      type: "output",
      data: "[pier] connected in fallback mode (no PTY).\\r\\n"
    });
  }

  ws.on("message", (buffer) => {
    let payload;
    try {
      payload = JSON.parse(String(buffer));
    } catch {
      return;
    }

    if (payload.type === "input" && typeof payload.data === "string") {
      sessionRecord.shell.write(payload.data);
      return;
    }

    if (payload.type === "resize") {
      const nextCols = toInt(payload.cols, sessionRecord.cols, 20, 400);
      const nextRows = toInt(payload.rows, sessionRecord.rows, 8, 200);
      sessionRecord.cols = nextCols;
      sessionRecord.rows = nextRows;
      sessionRecord.shell.resize(nextCols, nextRows);
    }
  });

  let detached = false;
  const detachClient = () => {
    if (detached) {
      return;
    }
    detached = true;
    sessionRecord.clients.delete(ws);
    if (sessionRecord.clients.size === 0 && !sessionRecord.exited) {
      scheduleSessionDetach(sessionRecord);
      console.log(
        `[pier] client detached id=${sessionRecord.id}, waiting ${SESSION_DETACH_TIMEOUT_MS}ms before cleanup`
      );
    }
  };

  ws.on("close", detachClient);
  ws.on("error", detachClient);
}

const server = http.createServer((req, res) => {
  if (req.url === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, host: HOST, port: PORT }));
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  let parsed;
  try {
    parsed = new URL(
      request.url,
      `http://${request.headers.host || "localhost"}`
    );
  } catch {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  if (parsed.pathname !== "/terminal") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    return;
  }

  const incomingToken = parsed.searchParams.get("token") || "";
  if (!incomingToken || incomingToken !== TOKEN) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    return;
  }

  const origin = String(request.headers.origin || "");
  if (!isAllowedOrigin(origin)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request, parsed);
  });
});

wss.on("connection", (ws, request, parsedUrl) => {
  const cols = toInt(parsedUrl.searchParams.get("cols"), 120, 20, 400);
  const rows = toInt(parsedUrl.searchParams.get("rows"), 32, 8, 200);
  const pageContext = getRequestedPageContext(request, parsedUrl);
  const sessionTarget = resolveSessionCwd(pageContext);
  const requestedSessionId = normalizeSessionId(
    parsedUrl.searchParams.get("sessionId")
  );
  let sessionId = requestedSessionId || generateSessionId();
  let sessionRecord = sessions.get(sessionId);
  let reused = Boolean(sessionRecord);

  if (
    sessionRecord &&
    pageContext.pageHost &&
    sessionRecord.pageHost &&
    sessionRecord.pageHost !== pageContext.pageHost
  ) {
    console.warn(
      `[pier] session host mismatch id=${sessionId} existing=${sessionRecord.pageHost} requested=${pageContext.pageHost}; starting new session`
    );
    sessionId = generateSessionId();
    sessionRecord = null;
    reused = false;
  }

  if (!sessionRecord) {
    sessionRecord = createManagedSession(sessionId, cols, rows, {
      cwd: sessionTarget.cwd,
      pageHost: sessionTarget.pageHost
    });
  }
  const remote = request.socket.remoteAddress || "unknown";
  if (reused) {
    console.log(
      `[pier] session resumed id=${sessionId} (${remote}) host=${sessionRecord.pageHost || "-"} cwd=${sessionRecord.cwd}`
    );
  } else {
    const mapDetail =
      sessionTarget.source === "mapped"
        ? ` mappedHost=${sessionTarget.pageHost} map=${sessionTarget.registryPath || "(default)"}`
        : pageContext.pageHost
          ? ` pageHost=${pageContext.pageHost}`
          : "";
    console.log(
      `[pier] session started id=${sessionId} (${remote}) ${SHELL} mode=${sessionRecord.mode} cwd=${sessionRecord.cwd}${mapDetail}`
    );
  }
  attachClientToSession(sessionRecord, ws, cols, rows, reused);
});

server.listen(PORT, HOST, () => {
  ensurePtyHelperPermissions();
  console.log("[pier] terminal bridge server started");
  console.log(`[pier] websocket: ws://${HOST}:${PORT}/terminal`);
  console.log(`[pier] cwd: ${DEFAULT_CWD}`);
  if (WORKSPACE_ROUTE_MAP_PATH) {
    console.log(`[pier] workspace route map: ${WORKSPACE_ROUTE_MAP_PATH}`);
  }
  console.log(`[pier] shell: ${SHELL}`);
  console.log(`[pier] term program: ${TERM_PROGRAM} ${TERM_PROGRAM_VERSION}`);
  if (TOKEN === "change-me") {
    console.warn(
      "[pier] WARNING: using default token 'change-me'. Set PIER_TOKEN."
    );
  }
});

process.on("SIGINT", () => {
  console.log("\n[pier] shutting down");
  for (const sessionRecord of sessions.values()) {
    try {
      sessionRecord.shell.kill();
    } catch {
      // no-op
    }
  }
  server.close(() => process.exit(0));
});

export {};
