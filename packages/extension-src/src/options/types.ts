export type StatusTone = "info" | "success" | "warning" | "error";

export interface TerminalSettings {
  wsUrl: string;
  token: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  scrollback: number;
  cursorStyle: string;
  cursorBlink: boolean;
  themePreset: string;
  macOptionIsMeta: boolean;
  preferWebgl: boolean;
}

export interface SharedRuntime {
  STORAGE_KEYS: {
    SETTINGS: string;
    SETTINGS_LEGACY: string;
    PANEL_HEIGHT: string;
    PANEL_HEIGHT_LEGACY: string;
  };
  DEFAULT_TERMINAL_SETTINGS: TerminalSettings;
  extractMigratedSettingsFromStorageResult: (
    result: Record<string, unknown>
  ) => {
    hasNewKey: boolean;
    rawSettings: unknown;
    settings: TerminalSettings;
  };
  normalizeTerminalSettings: (raw: unknown) => TerminalSettings;
  randomHexToken: (length?: number) => string;
}
