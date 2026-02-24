(() => {
  const SETTINGS_KEY = "terminalBrowserSettings";
  const LEGACY_DEFAULT_FONT_STACK =
    '"JetBrainsMono Nerd Font", "MesloLGS NF", "FiraCode Nerd Font", "Hack Nerd Font", "Symbols Nerd Font Mono", Menlo, Monaco, Consolas, monospace';
  const DEFAULT_SETTINGS = {
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
  };

  const form = document.getElementById("settings-form");
  const wsUrlInput = document.getElementById("ws-url");
  const tokenInput = document.getElementById("token");
  const fontFamilyInput = document.getElementById("font-family");
  const fontSizeInput = document.getElementById("font-size");
  const lineHeightInput = document.getElementById("line-height");
  const letterSpacingInput = document.getElementById("letter-spacing");
  const scrollbackInput = document.getElementById("scrollback");
  const cursorStyleSelect = document.getElementById("cursor-style");
  const themePresetSelect = document.getElementById("theme-preset");
  const cursorBlinkInput = document.getElementById("cursor-blink");
  const macOptionMetaInput = document.getElementById("mac-option-meta");
  const preferWebglInput = document.getElementById("prefer-webgl");
  const statusEl = document.getElementById("status");
  const generateTokenButton = document.getElementById("generate-token");
  const storageArea = getStorageArea();

  function setStatus(message) {
    statusEl.textContent = message;
  }

  function randomToken(length = 48) {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").slice(0, length);
  }

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

  function normalizeSettings(raw) {
    const input = raw || {};
    return {
      wsUrl: String(input.wsUrl || DEFAULT_SETTINGS.wsUrl),
      token: String(input.token || DEFAULT_SETTINGS.token),
      fontFamily: normalizeFontFamily(input.fontFamily || DEFAULT_SETTINGS.fontFamily),
      fontSize: clampNumber(input.fontSize, DEFAULT_SETTINGS.fontSize, 10, 30),
      lineHeight: clampNumber(input.lineHeight, DEFAULT_SETTINGS.lineHeight, 1, 2),
      letterSpacing: clampNumber(input.letterSpacing, DEFAULT_SETTINGS.letterSpacing, -2, 5),
      scrollback: Math.round(clampNumber(input.scrollback, DEFAULT_SETTINGS.scrollback, 1000, 200000)),
      cursorStyle: ["block", "underline", "bar"].includes(input.cursorStyle) ? input.cursorStyle : DEFAULT_SETTINGS.cursorStyle,
      cursorBlink: typeof input.cursorBlink === "boolean" ? input.cursorBlink : DEFAULT_SETTINGS.cursorBlink,
      themePreset: ["vscode-dark", "ghostty-ink", "midnight-blue"].includes(input.themePreset)
        ? input.themePreset
        : DEFAULT_SETTINGS.themePreset,
      macOptionIsMeta: typeof input.macOptionIsMeta === "boolean" ? input.macOptionIsMeta : DEFAULT_SETTINGS.macOptionIsMeta,
      preferWebgl: typeof input.preferWebgl === "boolean" ? input.preferWebgl : DEFAULT_SETTINGS.preferWebgl
    };
  }

  function applyFormValues(settings) {
    wsUrlInput.value = settings.wsUrl;
    tokenInput.value = settings.token;
    fontFamilyInput.value = settings.fontFamily;
    fontSizeInput.value = String(settings.fontSize);
    lineHeightInput.value = String(settings.lineHeight);
    letterSpacingInput.value = String(settings.letterSpacing);
    scrollbackInput.value = String(settings.scrollback);
    cursorStyleSelect.value = settings.cursorStyle;
    themePresetSelect.value = settings.themePreset;
    cursorBlinkInput.checked = settings.cursorBlink;
    macOptionMetaInput.checked = settings.macOptionIsMeta;
    preferWebglInput.checked = settings.preferWebgl;
  }

  function readFormValues() {
    return normalizeSettings({
      wsUrl: wsUrlInput.value.trim(),
      token: tokenInput.value.trim(),
      fontFamily: fontFamilyInput.value.trim(),
      fontSize: fontSizeInput.value,
      lineHeight: lineHeightInput.value,
      letterSpacing: letterSpacingInput.value,
      scrollback: scrollbackInput.value,
      cursorStyle: cursorStyleSelect.value,
      cursorBlink: cursorBlinkInput.checked,
      themePreset: themePresetSelect.value,
      macOptionIsMeta: macOptionMetaInput.checked,
      preferWebgl: preferWebglInput.checked
    });
  }

  function load() {
    if (!storageArea) {
      applyFormValues(DEFAULT_SETTINGS);
      setStatus("Storage API unavailable. Using defaults for this session.");
      return;
    }

    storageArea.get([SETTINGS_KEY], (result) => {
      const settings = normalizeSettings(result?.[SETTINGS_KEY]);
      applyFormValues(settings);
      setStatus("Loaded settings.");
    });
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const settings = readFormValues();

    if (!storageArea) {
      setStatus("Storage API unavailable. Could not save.");
      return;
    }

    storageArea.set({ [SETTINGS_KEY]: settings }, () => {
      setStatus("Saved. Reload localhost tab to apply rendering changes.");
    });
  });

  generateTokenButton.addEventListener("click", () => {
    tokenInput.value = randomToken();
    setStatus("Generated a new token. Save to apply.");
  });

  load();

  function getStorageArea() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      return chrome.storage.sync || chrome.storage.local || null;
    }
    if (typeof browser !== "undefined" && browser.storage) {
      return browser.storage.sync || browser.storage.local || null;
    }
    return null;
  }
})();
