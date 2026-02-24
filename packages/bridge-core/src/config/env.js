function toInt(value, fallback, min, max) {
  const num = Number.parseInt(String(value), 10);
  if (Number.isNaN(num)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, num));
}

function readBridgeEnv(env = process.env) {
  const host = env.PIER_HOST || "127.0.0.1";
  const port = Number(env.PIER_PORT || "4570");
  const token = env.PIER_TOKEN || "change-me";
  const defaultCwd = env.PIER_CWD || process.cwd();
  const shell =
    env.PIER_SHELL ||
    env.SHELL ||
    (process.platform === "win32" ? "powershell.exe" : "/bin/zsh");
  const termProgram = env.TERM_PROGRAM || "vscode";
  const termProgramVersion = env.TERM_PROGRAM_VERSION || "1.96.0";
  const workspaceRouteMapPath = env.PIER_WORKSPACE_ROUTE_MAP;
  const sessionDetachTimeoutMs = toInt(
    env.PIER_SESSION_DETACH_TIMEOUT_MS,
    300000,
    1000,
    86400000
  );

  return {
    host,
    port,
    token,
    defaultCwd,
    shell,
    termProgram,
    termProgramVersion,
    workspaceRouteMapPath,
    sessionDetachTimeoutMs
  };
}

function getShellEnv({ termProgram, termProgramVersion }, env = process.env) {
  return {
    ...env,
    TERM: "xterm-256color",
    COLORTERM: env.COLORTERM || "truecolor",
    TERM_PROGRAM: termProgram,
    TERM_PROGRAM_VERSION: termProgramVersion
  };
}

module.exports = {
  getShellEnv,
  readBridgeEnv,
  toInt
};
