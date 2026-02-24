const shared = require("../../shared/src");

const {
  STORAGE_KEYS,
  DEFAULT_TERMINAL_SETTINGS,
  LEGACY_DEFAULT_FONT_STACK,
  THEME_PRESETS,
  normalizeTerminalSettings,
  normalizeFontFamily,
  normalizePanelHeight,
  extractMigratedSettingsFromStorageResult,
  normalizeSessionId,
  normalizeLocalhostHost,
  isLocalhostHost,
  clampNumber,
  safeParseJson,
  randomHexToken
} = shared;

globalThis.PierShared = {
  STORAGE_KEYS,
  DEFAULT_TERMINAL_SETTINGS,
  LEGACY_DEFAULT_FONT_STACK,
  THEME_PRESETS,
  normalizeTerminalSettings,
  normalizeFontFamily,
  normalizePanelHeight,
  extractMigratedSettingsFromStorageResult,
  normalizeSessionId,
  normalizeLocalhostHost,
  isLocalhostHost,
  clampNumber,
  safeParseJson,
  randomHexToken
};
