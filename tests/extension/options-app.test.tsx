import { h } from "preact";
import { render, screen, waitFor } from "@testing-library/preact";
import { App } from "../../packages/extension-src/src/options/App";

vi.mock("../../packages/extension-src/src/options/settings-store", () => ({
  getStorageArea: () => ({
    set: (_items: Record<string, unknown>, cb?: () => void) => cb?.()
  }),
  loadSettings: async (_storageArea: unknown, shared: any) => ({
    settings: shared.DEFAULT_TERMINAL_SETTINGS,
    migratedPayload: null,
    error: null
  }),
  saveSettings: async () => ({ ok: true })
}));

vi.mock("../../packages/extension-src/src/options/connection-test", () => ({
  testConnection: async () => ({ ok: true, message: "ok" })
}));

vi.mock("../../packages/extension-src/src/options/token-generator", () => ({
  generateToken: () => "generated-token"
}));

const shared = {
  STORAGE_KEYS: {
    SETTINGS: "pierSettings",
    SETTINGS_LEGACY: "terminalBrowserSettings",
    PANEL_HEIGHT: "pierPanelHeightPx",
    PANEL_HEIGHT_LEGACY: "terminalBrowserPanelHeightPx"
  },
  DEFAULT_TERMINAL_SETTINGS: {
    wsUrl: "ws://127.0.0.1:4570/terminal",
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
  },
  extractMigratedSettingsFromStorageResult: () => ({
    hasNewKey: true,
    rawSettings: null,
    settings: {} as any
  }),
  normalizeTerminalSettings: (value: unknown) => value as any,
  randomHexToken: () => "token"
};

describe("Options App", () => {
  it("renders and loads settings via the shared runtime contract", async () => {
    render(h(App, { shared: shared as any }));

    expect(screen.getByText("Pier Settings")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText("Loaded settings.")).toBeTruthy();
    });
  });
});
