const {
  extractMigratedSettingsFromStorageResult,
  normalizeTerminalSettings
} = require("../../packages/shared/dist");

describe("terminal settings normalization", () => {
  it("clamps values and validates enums", () => {
    const out = normalizeTerminalSettings({
      fontSize: 100,
      lineHeight: 0.2,
      letterSpacing: 99,
      scrollback: 1,
      cursorStyle: "bad",
      themePreset: "bad"
    });

    expect(out.fontSize).toBe(30);
    expect(out.lineHeight).toBe(1);
    expect(out.letterSpacing).toBe(5);
    expect(out.scrollback).toBe(1000);
    expect(out.cursorStyle).toBe("block");
    expect(out.themePreset).toBe("vscode-dark");
  });

  it("migrates legacy storage keys", () => {
    const result = extractMigratedSettingsFromStorageResult({
      terminalBrowserSettings: { token: "x" },
      terminalBrowserPanelHeightPx: 333
    });

    expect(result.hasNewKey).toBe(false);
    expect(result.settings.token).toBe("x");
    expect(result.panelHeight).toBe(333);
  });
});
