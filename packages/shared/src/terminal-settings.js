const {
  DEFAULT_TERMINAL_SETTINGS,
  LEGACY_DEFAULT_FONT_STACK,
  STORAGE_KEYS
} = require("./constants");
const { THEME_PRESETS } = require("./theme-presets");

const CURSOR_STYLES = new Set(["block", "underline", "bar"]);
const THEME_PRESET_NAMES = new Set(Object.keys(THEME_PRESETS));

function clampNumber(value, fallback, min, max) {
  const number = Number.parseFloat(String(value));
  if (Number.isNaN(number)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, number));
}

function normalizeFontFamily(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed || trimmed === LEGACY_DEFAULT_FONT_STACK) {
    return "auto";
  }
  return trimmed;
}

function normalizeTerminalSettings(raw) {
  const input = raw || {};
  return {
    wsUrl: String(input.wsUrl || DEFAULT_TERMINAL_SETTINGS.wsUrl),
    token: String(input.token || DEFAULT_TERMINAL_SETTINGS.token),
    fontFamily: normalizeFontFamily(
      input.fontFamily || DEFAULT_TERMINAL_SETTINGS.fontFamily
    ),
    fontSize: clampNumber(
      input.fontSize,
      DEFAULT_TERMINAL_SETTINGS.fontSize,
      10,
      30
    ),
    lineHeight: clampNumber(
      input.lineHeight,
      DEFAULT_TERMINAL_SETTINGS.lineHeight,
      1,
      2
    ),
    letterSpacing: clampNumber(
      input.letterSpacing,
      DEFAULT_TERMINAL_SETTINGS.letterSpacing,
      -2,
      5
    ),
    scrollback: Math.round(
      clampNumber(
        input.scrollback,
        DEFAULT_TERMINAL_SETTINGS.scrollback,
        1000,
        200000
      )
    ),
    cursorStyle: CURSOR_STYLES.has(input.cursorStyle)
      ? input.cursorStyle
      : DEFAULT_TERMINAL_SETTINGS.cursorStyle,
    cursorBlink:
      typeof input.cursorBlink === "boolean"
        ? input.cursorBlink
        : DEFAULT_TERMINAL_SETTINGS.cursorBlink,
    themePreset: THEME_PRESET_NAMES.has(input.themePreset)
      ? input.themePreset
      : DEFAULT_TERMINAL_SETTINGS.themePreset,
    macOptionIsMeta:
      typeof input.macOptionIsMeta === "boolean"
        ? input.macOptionIsMeta
        : DEFAULT_TERMINAL_SETTINGS.macOptionIsMeta,
    preferWebgl:
      typeof input.preferWebgl === "boolean"
        ? input.preferWebgl
        : DEFAULT_TERMINAL_SETTINGS.preferWebgl
  };
}

function normalizePanelHeight(value) {
  const number = Number.parseFloat(String(value));
  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }
  return Math.round(number);
}

function extractMigratedSettingsFromStorageResult(result) {
  const hasNewKey = result != null && result[STORAGE_KEYS.SETTINGS] != null;
  const rawSettings = hasNewKey
    ? result[STORAGE_KEYS.SETTINGS]
    : result[STORAGE_KEYS.SETTINGS_LEGACY];
  const rawPanelHeight =
    result && result[STORAGE_KEYS.PANEL_HEIGHT] != null
      ? result[STORAGE_KEYS.PANEL_HEIGHT]
      : result && result[STORAGE_KEYS.PANEL_HEIGHT_LEGACY];

  return {
    hasNewKey,
    rawSettings,
    rawPanelHeight,
    settings: normalizeTerminalSettings(rawSettings),
    panelHeight: normalizePanelHeight(rawPanelHeight)
  };
}

module.exports = {
  clampNumber,
  extractMigratedSettingsFromStorageResult,
  normalizeFontFamily,
  normalizePanelHeight,
  normalizeTerminalSettings
};
