const LOCALHOST_SUFFIX = ".localhost";

const STORAGE_KEYS = {
  SETTINGS: "pierSettings",
  SETTINGS_LEGACY: "terminalBrowserSettings",
  PANEL_HEIGHT: "pierPanelHeightPx",
  PANEL_HEIGHT_LEGACY: "terminalBrowserPanelHeightPx",
  SESSION_ID: "pierSessionId"
};

const SESSION_ID = {
  MAX_LENGTH: 128,
  PATTERN: /^[A-Za-z0-9_-]+$/
};

const DEFAULT_BRIDGE = {
  HOST: "127.0.0.1",
  PORT: 4570,
  WS_PATH: "/terminal"
};

const LEGACY_DEFAULT_FONT_STACK =
  '"JetBrainsMono Nerd Font", "MesloLGS NF", "FiraCode Nerd Font", "Hack Nerd Font", "Symbols Nerd Font Mono", Menlo, Monaco, Consolas, monospace';

const DEFAULT_TERMINAL_SETTINGS = {
  wsUrl: `ws://${DEFAULT_BRIDGE.HOST}:${DEFAULT_BRIDGE.PORT}${DEFAULT_BRIDGE.WS_PATH}`,
  token: "change-me",
  fontFamily: "auto",
  fontSize: 14,
  lineHeight: 1.2,
  letterSpacing: 0,
  scrollback: 10000,
  cursorStyle: "block",
  cursorBlink: true,
  themePreset: "vscode-dark",
  macOptionIsMeta: true,
  preferWebgl: false
};

module.exports = {
  DEFAULT_BRIDGE,
  DEFAULT_TERMINAL_SETTINGS,
  LEGACY_DEFAULT_FONT_STACK,
  LOCALHOST_SUFFIX,
  SESSION_ID,
  STORAGE_KEYS
};
