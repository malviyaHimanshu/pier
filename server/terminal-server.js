const http = require("http");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const pty = require("node-pty");
const { WebSocketServer } = require("ws");

const HOST = process.env.TERMINAL_BROWSER_HOST || "127.0.0.1";
const PORT = Number(process.env.TERMINAL_BROWSER_PORT || "4570");
const TOKEN = process.env.TERMINAL_BROWSER_TOKEN || "change-me";
const DEFAULT_CWD = process.env.TERMINAL_BROWSER_CWD || process.cwd();
const SHELL = process.env.TERMINAL_BROWSER_SHELL || process.env.SHELL || (process.platform === "win32" ? "powershell.exe" : "/bin/zsh");
const TERM_PROGRAM = process.env.TERM_PROGRAM || "vscode";
const TERM_PROGRAM_VERSION = process.env.TERM_PROGRAM_VERSION || "1.96.0";

function getShellEnv() {
  return {
    ...process.env,
    TERM: "xterm-256color",
    COLORTERM: process.env.COLORTERM || "truecolor",
    TERM_PROGRAM,
    TERM_PROGRAM_VERSION
  };
}

function ensurePtyHelperPermissions() {
  if (process.platform === "win32") {
    return;
  }

  try {
    const packageJsonPath = require.resolve("node-pty/package.json");
    const ptyRoot = path.dirname(packageJsonPath);
    const helperPath = path.join(ptyRoot, "prebuilds", `${process.platform}-${process.arch}`, "spawn-helper");

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
    console.log(`[terminal.browser] fixed execute permission on ${helperPath}`);
  } catch (error) {
    console.warn(`[terminal.browser] unable to auto-fix node-pty helper permissions: ${error.message}`);
  }
}

function isLocalhostHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]" || hostname.endsWith(".localhost");
}

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }
  if (origin.startsWith("chrome-extension://")) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && isLocalhostHost(parsed.hostname);
  } catch {
    return false;
  }
}

function toInt(value, fallback, min, max) {
  const num = Number.parseInt(String(value), 10);
  if (Number.isNaN(num)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, num));
}

function sendJson(ws, payload) {
  if (ws.readyState !== 1) {
    return;
  }
  ws.send(JSON.stringify(payload));
}

function createTerminalSession(cols, rows) {
  const shellArgs = process.platform === "win32" ? [] : ["-l"];

  try {
    const ptyProcess = pty.spawn(SHELL, shellArgs, {
      cols,
      rows,
      cwd: DEFAULT_CWD,
      env: getShellEnv(),
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
    console.warn(`[terminal.browser] node-pty unavailable (${error.message}), falling back to child_process`);

    const child = spawn(SHELL, shellArgs, {
      cwd: DEFAULT_CWD,
      env: getShellEnv(),
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
        child.on("exit", (exitCode, signal) => handler(exitCode ?? 0, signal ?? null));
      },
      onError(handler) {
        child.on("error", handler);
      }
    };
  }
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
    parsed = new URL(request.url, `http://${request.headers.host || "localhost"}`);
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

  const session = createTerminalSession(cols, rows);
  const remote = request.socket.remoteAddress || "unknown";
  console.log(`[terminal.browser] session started (${remote}) ${SHELL} mode=${session.mode}`);

  if (session.mode === "pipe") {
    sendJson(ws, {
      type: "output",
      data: "[terminal.browser] connected in fallback mode (no PTY).\\r\\n"
    });
  }

  session.onOutput((data) => {
    sendJson(ws, { type: "output", data });
  });

  session.onExit((exitCode, signal) => {
    sendJson(ws, { type: "exit", exitCode, signal });
    if (ws.readyState < 2) {
      ws.close();
    }
    console.log(`[terminal.browser] session exited code=${exitCode} signal=${signal}`);
  });

  ws.on("message", (buffer) => {
    let payload;
    try {
      payload = JSON.parse(String(buffer));
    } catch {
      return;
    }

    if (payload.type === "input" && typeof payload.data === "string") {
      session.write(payload.data);
      return;
    }

    if (payload.type === "resize") {
      const nextCols = toInt(payload.cols, cols, 20, 400);
      const nextRows = toInt(payload.rows, rows, 8, 200);
      session.resize(nextCols, nextRows);
      return;
    }
  });

  session.onError((error) => {
    sendJson(ws, { type: "error", message: String(error.message || error) });
  });

  ws.on("close", () => {
    try {
      session.kill();
    } catch {
      // no-op
    }
  });

  ws.on("error", () => {
    try {
      session.kill();
    } catch {
      // no-op
    }
  });
});

server.listen(PORT, HOST, () => {
  ensurePtyHelperPermissions();
  console.log("[terminal.browser] terminal bridge server started");
  console.log(`[terminal.browser] websocket: ws://${HOST}:${PORT}/terminal`);
  console.log(`[terminal.browser] cwd: ${DEFAULT_CWD}`);
  console.log(`[terminal.browser] shell: ${SHELL}`);
  console.log(`[terminal.browser] term program: ${TERM_PROGRAM} ${TERM_PROGRAM_VERSION}`);
  if (TOKEN === "change-me") {
    console.warn("[terminal.browser] WARNING: using default token 'change-me'. Set TERMINAL_BROWSER_TOKEN.");
  }
});

process.on("SIGINT", () => {
  console.log("\n[terminal.browser] shutting down");
  server.close(() => process.exit(0));
});
