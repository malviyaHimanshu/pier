import { h, render as preactRender } from "preact";
import { Terminal } from "@xterm/xterm";
import { FitAddon as XtermFitAddon } from "@xterm/addon-fit";
import { WebLinksAddon as XtermWebLinksAddon } from "@xterm/addon-web-links";
import { Unicode11Addon as XtermUnicode11Addon } from "@xterm/addon-unicode11";
import { WebglAddon as XtermWebglAddon } from "@xterm/addon-webgl";
import { PanelShell } from "./PanelShell";

declare const browser: any;

const FitAddon = { FitAddon: XtermFitAddon };
const WebLinksAddon = { WebLinksAddon: XtermWebLinksAddon };
const Unicode11Addon = { Unicode11Addon: XtermUnicode11Addon };
const WebglAddon = { WebglAddon: XtermWebglAddon };

(() => {
  const PIER_SHARED = (globalThis as any).PierShared || null;
  const SETTINGS_KEY =
    (PIER_SHARED &&
      PIER_SHARED.STORAGE_KEYS &&
      PIER_SHARED.STORAGE_KEYS.SETTINGS) ||
    "pierSettings";
  const PANEL_HEIGHT_KEY =
    (PIER_SHARED &&
      PIER_SHARED.STORAGE_KEYS &&
      PIER_SHARED.STORAGE_KEYS.PANEL_HEIGHT) ||
    "pierPanelHeightPx";
  const SESSION_ID_STORAGE_KEY =
    (PIER_SHARED &&
      PIER_SHARED.STORAGE_KEYS &&
      PIER_SHARED.STORAGE_KEYS.SESSION_ID) ||
    "pierSessionId";
  const SESSION_ID_MAX_LENGTH = 128;
  const SESSION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
  const BUNDLED_SYMBOL_FONT_FAMILY = "Pier Symbols Nerd";
  const LEGACY_DEFAULT_FONT_STACK =
    (PIER_SHARED && PIER_SHARED.LEGACY_DEFAULT_FONT_STACK) ||
    '"JetBrainsMono Nerd Font", "MesloLGS NF", "FiraCode Nerd Font", "Hack Nerd Font", "Symbols Nerd Font Mono", Menlo, Monaco, Consolas, monospace';
  const PANEL_HEIGHT_DEFAULT_RATIO = 0.4;
  const PANEL_HEIGHT_MIN_PX = 220;
  const PANEL_HEIGHT_MAX_RATIO = 0.85;
  const BRIDGE_DIAG_TIMEOUT_MS = 1200;
  const FAILURE_LOG_DEDUPE_MS = 3000;

  const DEFAULT_SETTINGS = (PIER_SHARED &&
    PIER_SHARED.DEFAULT_TERMINAL_SETTINGS) || {
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

  const THEME_PRESETS = (PIER_SHARED && PIER_SHARED.THEME_PRESETS) || {
    "vscode-dark": {
      background: "#1e1e1e",
      foreground: "#d4d4d4",
      cursor: "#d4d4d4",
      selectionBackground: "#264f78",
      black: "#000000",
      red: "#cd3131",
      green: "#0dbc79",
      yellow: "#e5e510",
      blue: "#2472c8",
      magenta: "#bc3fbc",
      cyan: "#11a8cd",
      white: "#e5e5e5",
      brightBlack: "#666666",
      brightRed: "#f14c4c",
      brightGreen: "#23d18b",
      brightYellow: "#f5f543",
      brightBlue: "#3b8eea",
      brightMagenta: "#d670d6",
      brightCyan: "#29b8db",
      brightWhite: "#ffffff"
    },
    "ghostty-ink": {
      background: "#0f1728",
      foreground: "#dbe5ff",
      cursor: "#dbe5ff",
      selectionBackground: "#2f446f",
      black: "#1b2232",
      red: "#f28fad",
      green: "#abe9b3",
      yellow: "#fae3b0",
      blue: "#96cdfb",
      magenta: "#ddb6f2",
      cyan: "#89dceb",
      white: "#d9e0ee",
      brightBlack: "#4f5a72",
      brightRed: "#f8a5c2",
      brightGreen: "#b9f4c2",
      brightYellow: "#fce6bd",
      brightBlue: "#a4d8ff",
      brightMagenta: "#e6c2f9",
      brightCyan: "#94e2f0",
      brightWhite: "#ffffff"
    },
    "midnight-blue": {
      background: "#050d2a",
      foreground: "#00e5ff",
      cursor: "#8bf3ff",
      selectionBackground: "#1c3f8f",
      black: "#001034",
      red: "#ff5f87",
      green: "#5fffaf",
      yellow: "#ffd15f",
      blue: "#5f8fff",
      magenta: "#af7dff",
      cyan: "#4ee6ff",
      white: "#ccf9ff",
      brightBlack: "#2d4a8f",
      brightRed: "#ff88ab",
      brightGreen: "#86ffbf",
      brightYellow: "#ffe08c",
      brightBlue: "#84a8ff",
      brightMagenta: "#ca9fff",
      brightCyan: "#80f0ff",
      brightWhite: "#f4ffff"
    },
    dracula: {
      background: "#282a36",
      foreground: "#f8f8f2",
      cursor: "#f8f8f2",
      selectionBackground: "#44475a",
      black: "#21222c",
      red: "#ff5555",
      green: "#50fa7b",
      yellow: "#f1fa8c",
      blue: "#bd93f9",
      magenta: "#ff79c6",
      cyan: "#8be9fd",
      white: "#f8f8f2",
      brightBlack: "#6272a4",
      brightRed: "#ff6e6e",
      brightGreen: "#69ff94",
      brightYellow: "#ffffa5",
      brightBlue: "#d6acff",
      brightMagenta: "#ff92df",
      brightCyan: "#a4ffff",
      brightWhite: "#ffffff"
    }
  };

  const PRIMARY_FONT_CANDIDATES = [
    "SFMono Nerd Font",
    "Geist Mono",
    "JetBrainsMono Nerd Font",
    "MesloLGS NF",
    "FiraCode Nerd Font",
    "Hack Nerd Font",
    "IosevkaTerm Nerd Font",
    "CaskaydiaCove Nerd Font",
    "Menlo",
    "Monaco",
    "Consolas"
  ];

  const SYMBOL_FONT_CANDIDATES = [
    BUNDLED_SYMBOL_FONT_FAMILY,
    "Symbols Nerd Font Mono",
    "Symbols Nerd Font",
    "Noto Sans Symbols2"
  ];

  const GENERIC_FONT_FAMILIES = new Set([
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-monospace"
  ]);

  let warnedStorageUnavailable = false;
  let warnedNerdFont = false;
  let announcedFontStack = "";
  let webglAddon;
  let webglStatus = "unknown";
  let webglRuntimeFailureHooksInstalled = false;

  if (!isLocalhostPage(window.location)) {
    return;
  }

  let panel;
  let resizeHandle;
  let terminalContainer;
  let statusEl;
  let terminal;
  let fitAddon;
  let socket;
  let connecting = false;
  let panelHeightPx = null;
  let resizeState = null;
  let layoutSyncRaf = 0;
  let terminalResizeObserver = null;
  let fontWatchInitialized = false;
  let activeSessionId = loadSessionId();
  let lastFailureLog = "";
  let lastFailureLogAt = 0;

  document.addEventListener("keydown", onGlobalKeydown, true);
  window.addEventListener("beforeunload", closeSocket);

  function isLocalhostPage(locationObj) {
    if (
      !locationObj ||
      !(locationObj.protocol === "http:" || locationObj.protocol === "https:")
    ) {
      return false;
    }

    const host = locationObj.hostname;
    if (PIER_SHARED && typeof PIER_SHARED.isLocalhostHost === "function") {
      return PIER_SHARED.isLocalhostHost(host);
    }
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".localhost")
    );
  }

  function clampNumber(value, fallback, min, max) {
    if (PIER_SHARED && typeof PIER_SHARED.clampNumber === "function") {
      return PIER_SHARED.clampNumber(value, fallback, min, max);
    }
    const number = Number.parseFloat(String(value));
    if (Number.isNaN(number)) {
      return fallback;
    }
    return Math.min(max, Math.max(min, number));
  }

  function normalizeSessionId(value) {
    if (PIER_SHARED && typeof PIER_SHARED.normalizeSessionId === "function") {
      return PIER_SHARED.normalizeSessionId(value);
    }
    const raw = String(value || "").trim();
    if (!raw) {
      return null;
    }
    if (raw.length > SESSION_ID_MAX_LENGTH) {
      return null;
    }
    if (!SESSION_ID_PATTERN.test(raw)) {
      return null;
    }
    return raw;
  }

  function getSessionStorageSafe() {
    try {
      return window.sessionStorage;
    } catch {
      return null;
    }
  }

  function loadSessionId() {
    const storage = getSessionStorageSafe();
    if (!storage) {
      return null;
    }

    const normalized = normalizeSessionId(
      storage.getItem(SESSION_ID_STORAGE_KEY)
    );
    if (!normalized) {
      storage.removeItem(SESSION_ID_STORAGE_KEY);
      return null;
    }
    return normalized;
  }

  function saveSessionId(sessionId) {
    const normalized = normalizeSessionId(sessionId);
    const storage = getSessionStorageSafe();
    if (!storage) {
      return normalized;
    }

    if (normalized) {
      storage.setItem(SESSION_ID_STORAGE_KEY, normalized);
      return normalized;
    }

    storage.removeItem(SESSION_ID_STORAGE_KEY);
    return null;
  }

  function normalizePanelHeight(value) {
    if (PIER_SHARED && typeof PIER_SHARED.normalizePanelHeight === "function") {
      return PIER_SHARED.normalizePanelHeight(value);
    }
    const number = Number.parseFloat(String(value));
    if (!Number.isFinite(number) || number <= 0) {
      return null;
    }
    return Math.round(number);
  }

  function getDefaultPanelHeightPx() {
    return Math.round(window.innerHeight * PANEL_HEIGHT_DEFAULT_RATIO);
  }

  function getMaxPanelHeightPx() {
    const byRatio = Math.round(window.innerHeight * PANEL_HEIGHT_MAX_RATIO);
    return Math.max(PANEL_HEIGHT_MIN_PX, byRatio);
  }

  function clampPanelHeightPx(value) {
    const fallback = getDefaultPanelHeightPx();
    return Math.round(
      clampNumber(value, fallback, PANEL_HEIGHT_MIN_PX, getMaxPanelHeightPx())
    );
  }

  function normalizeFontFamily(value) {
    if (PIER_SHARED && typeof PIER_SHARED.normalizeFontFamily === "function") {
      return PIER_SHARED.normalizeFontFamily(value);
    }
    const trimmed = String(value || "").trim();
    if (!trimmed || trimmed === LEGACY_DEFAULT_FONT_STACK) {
      return "auto";
    }
    return trimmed;
  }

  function normalizeSettings(raw) {
    if (
      PIER_SHARED &&
      typeof PIER_SHARED.normalizeTerminalSettings === "function"
    ) {
      return PIER_SHARED.normalizeTerminalSettings(raw);
    }
    const input = raw || {};
    return {
      wsUrl: String(input.wsUrl || DEFAULT_SETTINGS.wsUrl),
      token: String(input.token || DEFAULT_SETTINGS.token),
      fontFamily: normalizeFontFamily(
        input.fontFamily || DEFAULT_SETTINGS.fontFamily
      ),
      fontSize: clampNumber(input.fontSize, DEFAULT_SETTINGS.fontSize, 10, 30),
      lineHeight: clampNumber(
        input.lineHeight,
        DEFAULT_SETTINGS.lineHeight,
        1,
        2
      ),
      letterSpacing: clampNumber(
        input.letterSpacing,
        DEFAULT_SETTINGS.letterSpacing,
        -2,
        5
      ),
      scrollback: Math.round(
        clampNumber(input.scrollback, DEFAULT_SETTINGS.scrollback, 1000, 200000)
      ),
      cursorStyle: ["block", "underline", "bar"].includes(input.cursorStyle)
        ? input.cursorStyle
        : DEFAULT_SETTINGS.cursorStyle,
      cursorBlink:
        typeof input.cursorBlink === "boolean"
          ? input.cursorBlink
          : DEFAULT_SETTINGS.cursorBlink,
      themePreset: [
        "vscode-dark",
        "ghostty-ink",
        "midnight-blue",
        "dracula"
      ].includes(input.themePreset)
        ? input.themePreset
        : DEFAULT_SETTINGS.themePreset,
      macOptionIsMeta:
        typeof input.macOptionIsMeta === "boolean"
          ? input.macOptionIsMeta
          : DEFAULT_SETTINGS.macOptionIsMeta,
      preferWebgl:
        typeof input.preferWebgl === "boolean"
          ? input.preferWebgl
          : DEFAULT_SETTINGS.preferWebgl
    };
  }

  function getTheme(settings) {
    return (
      THEME_PRESETS[settings.themePreset] ||
      THEME_PRESETS[DEFAULT_SETTINGS.themePreset]
    );
  }

  function formatFontFamilyName(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) {
      return "";
    }
    const lower = trimmed.toLowerCase();
    if (GENERIC_FONT_FAMILIES.has(lower)) {
      return lower;
    }
    if (trimmed.startsWith('"') || trimmed.startsWith("'")) {
      return trimmed;
    }
    return `"${trimmed.replace(/"/g, '\\"')}"`;
  }

  function fontAvailable(name) {
    const fontsApi = document.fonts;
    if (!fontsApi || typeof fontsApi.check !== "function") {
      return false;
    }
    const family = formatFontFamilyName(name);
    return fontsApi.check(`14px ${family}`);
  }

  function firstAvailableFont(candidates) {
    for (const name of candidates) {
      if (fontAvailable(name)) {
        return name;
      }
    }
    return null;
  }

  function splitFontFamilyList(fontFamily) {
    return String(fontFamily || "")
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  }

  function resolveStableFallbackParts() {
    const installedSymbolFallback =
      firstAvailableFont(SYMBOL_FONT_CANDIDATES) || "Symbols Nerd Font Mono";
    return [BUNDLED_SYMBOL_FONT_FAMILY, installedSymbolFallback, "monospace"];
  }

  function buildFontFamilyWithFallbacks(primaryParts) {
    return buildFontStack([...primaryParts, ...resolveStableFallbackParts()]);
  }

  function warmBundledSymbolFont() {
    const fontsApi = document.fonts;
    if (!fontsApi || typeof fontsApi.load !== "function") {
      return;
    }

    fontsApi
      .load(`14px ${formatFontFamilyName(BUNDLED_SYMBOL_FONT_FAMILY)}`)
      .catch(() => {
        // Fall through to regular fallback chain if load fails.
      });
  }

  function buildFontStack(parts) {
    const seen = new Set();
    const result = [];
    for (const part of parts) {
      if (!part) {
        continue;
      }
      const normalizedKey = String(part).trim().toLowerCase();
      if (seen.has(normalizedKey)) {
        continue;
      }
      seen.add(normalizedKey);
      result.push(formatFontFamilyName(part));
    }
    return result.join(", ");
  }

  function resolveEffectiveFontFamily(settings) {
    const requested = normalizeFontFamily(settings.fontFamily);

    if (requested !== "auto") {
      return buildFontFamilyWithFallbacks(splitFontFamilyList(requested));
    }

    const primary = firstAvailableFont(PRIMARY_FONT_CANDIDATES) || "Geist Mono";
    return buildFontFamilyWithFallbacks([primary]);
  }

  function maybeAnnounceFontStack(settings, fontFamily) {
    if (!terminal) {
      return;
    }

    if (announcedFontStack === fontFamily) {
      return;
    }

    announcedFontStack = fontFamily;
  }

  function refreshTerminalMetrics(reason = "") {
    if (!terminal) {
      return;
    }

    try {
      if (webglAddon && typeof webglAddon.clearTextureAtlas === "function") {
        webglAddon.clearTextureAtlas();
      } else if (typeof terminal.clearTextureAtlas === "function") {
        terminal.clearTextureAtlas();
      }
    } catch {
      // Ignore renderer-specific refresh failures and continue with fit.
    }

    scheduleTerminalLayoutSync();

    if (reason) {
      // Keep logs sparse and only visible in terminal for debugging stability issues.
      // Intentionally not printed on every resize.
    }
  }

  function describeWebglError(errorLike) {
    if (!errorLike) {
      return "";
    }
    if (typeof errorLike === "string") {
      return errorLike;
    }
    if (typeof errorLike.message === "string" && errorLike.message) {
      return errorLike.message;
    }
    return String(errorLike);
  }

  function isLikelyWebglRuntimeError(eventOrReason) {
    const candidates = [];

    if (eventOrReason) {
      if (typeof eventOrReason.filename === "string") {
        candidates.push(eventOrReason.filename);
      }
      if (typeof eventOrReason.message === "string") {
        candidates.push(eventOrReason.message);
      }
      if (typeof eventOrReason.stack === "string") {
        candidates.push(eventOrReason.stack);
      }
      if (eventOrReason.error) {
        candidates.push(describeWebglError(eventOrReason.error));
        if (typeof eventOrReason.error.stack === "string") {
          candidates.push(eventOrReason.error.stack);
        }
      }
      if (eventOrReason.reason) {
        candidates.push(describeWebglError(eventOrReason.reason));
        if (typeof eventOrReason.reason.stack === "string") {
          candidates.push(eventOrReason.reason.stack);
        }
      }
    }

    const haystack = candidates.join("\n").toLowerCase();
    if (!haystack) {
      return false;
    }

    return (
      haystack.includes("addon-webgl") ||
      haystack.includes("webgladdon") ||
      haystack.includes("webglrenderer") ||
      haystack.includes("webgl context") ||
      haystack.includes("task queue exceeded allotted deadline") ||
      (haystack.includes("webgl") && haystack.includes("xterm"))
    );
  }

  function disableWebglRenderer(reason, { userDisabled = false } = {}) {
    if (webglAddon) {
      try {
        webglAddon.dispose();
      } catch {
        // no-op
      }
      webglAddon = undefined;
    }

    webglStatus = userDisabled ? "disabled" : "failed";

    if (terminal) {
      const message = userDisabled
        ? "[pier] WebGL renderer disabled (using default renderer)."
        : `[pier] WebGL renderer fallback activated (${reason || "runtime error"}).`;
      terminal.writeln(message);
    }

    scheduleTerminalLayoutSync();
  }

  function installWebglRuntimeFailureHooks() {
    if (webglRuntimeFailureHooksInstalled) {
      return;
    }
    webglRuntimeFailureHooksInstalled = true;

    window.addEventListener(
      "error",
      (event) => {
        if (webglStatus !== "enabled" || !isLikelyWebglRuntimeError(event)) {
          return;
        }
        if (typeof event.preventDefault === "function") {
          event.preventDefault();
        }
        if (typeof event.stopImmediatePropagation === "function") {
          event.stopImmediatePropagation();
        }
        disableWebglRenderer(
          describeWebglError(event.error || event.message || "window error")
        );
      },
      true
    );

    window.addEventListener("unhandledrejection", (event) => {
      if (webglStatus !== "enabled" || !isLikelyWebglRuntimeError(event)) {
        return;
      }
      if (typeof event.preventDefault === "function") {
        event.preventDefault();
      }
      disableWebglRenderer(
        describeWebglError(event.reason || "unhandled rejection")
      );
    });
  }

  function initializeFontWatchers() {
    if (fontWatchInitialized) {
      return;
    }
    fontWatchInitialized = true;

    const fontsApi = document.fonts;
    if (!fontsApi) {
      return;
    }

    const onFontsChanged = () => {
      refreshTerminalMetrics("fonts");
    };

    if (typeof fontsApi.addEventListener === "function") {
      fontsApi.addEventListener("loadingdone", onFontsChanged);
      fontsApi.addEventListener("loadingerror", onFontsChanged);
    }

    if (fontsApi.ready && typeof fontsApi.ready.then === "function") {
      fontsApi.ready.then(onFontsChanged).catch(() => {
        // no-op
      });
    }
  }

  function initializeResizeObserver() {
    if (
      terminalResizeObserver ||
      typeof ResizeObserver === "undefined" ||
      !terminalContainer
    ) {
      return;
    }

    terminalResizeObserver = new ResizeObserver(() => {
      scheduleTerminalLayoutSync();
    });

    terminalResizeObserver.observe(terminalContainer);
    if (panel) {
      terminalResizeObserver.observe(panel);
    }
  }

  function scheduleTerminalLayoutSync() {
    if (layoutSyncRaf || !terminal || !fitAddon || !panel || panel.hidden) {
      return;
    }

    layoutSyncRaf = window.requestAnimationFrame(() => {
      layoutSyncRaf = 0;
      if (!terminal || !fitAddon || !panel || panel.hidden) {
        return;
      }
      const prevCols = terminal.cols;
      const prevRows = terminal.rows;
      fitAddon.fit();
      if (terminal.rows > 0) {
        try {
          terminal.refresh(0, terminal.rows - 1);
        } catch {
          // no-op
        }
      }
      if (terminal.cols !== prevCols || terminal.rows !== prevRows) {
        sendToServer({
          type: "resize",
          cols: terminal.cols,
          rows: terminal.rows
        });
      }
    });
  }

  function applyPanelHeight(heightPx, { persist = false } = {}) {
    if (!panel) {
      return;
    }

    const clamped = clampPanelHeightPx(heightPx);
    panelHeightPx = clamped;
    panel.style.height = `${clamped}px`;
    scheduleTerminalLayoutSync();

    if (persist) {
      persistPanelHeight(clamped);
    }
  }

  function getStorageAreaSafe() {
    return getStorageArea();
  }

  async function persistPanelHeight(heightPx) {
    const storageArea = getStorageAreaSafe();
    if (!storageArea) {
      return;
    }

    try {
      await new Promise<void>((resolve) => {
        storageArea.set({ [PANEL_HEIGHT_KEY]: Math.round(heightPx) }, () =>
          resolve()
        );
      });
    } catch {
      // Keep running even if persistence fails.
    }
  }

  function setResizeInteractionActive(active) {
    if (!panel) {
      return;
    }
    panel.classList.toggle("pier-is-resizing", active);
    document.documentElement.classList.toggle("pier-resizing", active);
  }

  function finishResizeInteraction({ persist } = { persist: true }) {
    if (!resizeState || !resizeHandle) {
      return;
    }

    const pointerId = resizeState.pointerId;
    resizeState = null;
    setResizeInteractionActive(false);

    try {
      resizeHandle.releasePointerCapture(pointerId);
    } catch {
      // ignore
    }

    if (persist && panelHeightPx !== null) {
      persistPanelHeight(panelHeightPx);
    }
  }

  function attachResizeHandleBehavior(handle) {
    handle.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const startHeight =
        panelHeightPx ??
        panel?.getBoundingClientRect().height ??
        getDefaultPanelHeightPx();
      resizeState = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startHeight
      };

      handle.setPointerCapture(event.pointerId);
      setResizeInteractionActive(true);
    });

    handle.addEventListener("pointermove", (event) => {
      if (!resizeState || event.pointerId !== resizeState.pointerId) {
        return;
      }
      event.preventDefault();
      const delta = resizeState.startY - event.clientY;
      applyPanelHeight(resizeState.startHeight + delta);
    });

    const endPointer = (event) => {
      if (!resizeState || event.pointerId !== resizeState.pointerId) {
        return;
      }
      event.preventDefault();
      finishResizeInteraction({ persist: true });
    };

    handle.addEventListener("pointerup", endPointer);
    handle.addEventListener("pointercancel", endPointer);
    handle.addEventListener("lostpointercapture", () => {
      if (resizeState) {
        finishResizeInteraction({ persist: true });
      }
    });

    handle.addEventListener("dblclick", (event) => {
      event.preventDefault();
      applyPanelHeight(getDefaultPanelHeightPx(), { persist: true });
    });

    handle.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 80 : 24;
      if (event.key === "ArrowUp") {
        event.preventDefault();
        applyPanelHeight((panelHeightPx ?? getDefaultPanelHeightPx()) + step, {
          persist: true
        });
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        applyPanelHeight((panelHeightPx ?? getDefaultPanelHeightPx()) - step, {
          persist: true
        });
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        applyPanelHeight(getMaxPanelHeightPx(), { persist: true });
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        applyPanelHeight(PANEL_HEIGHT_MIN_PX, { persist: true });
      }
    });
  }

  function isToggleShortcut(event) {
    return (
      event.code === "Backquote" &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey &&
      !event.shiftKey
    );
  }

  function onGlobalKeydown(event) {
    if (!isToggleShortcut(event)) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!panel) {
      createPanel();
    }

    panel.hidden = !panel.hidden;
    if (panel.hidden) {
      finishResizeInteraction({ persist: true });
      return;
    }
    openPanelFlow();
  }

  async function openPanelFlow() {
    const settings = await loadSettings();
    if (panelHeightPx === null) {
      panelHeightPx = settings.panelHeight ?? getDefaultPanelHeightPx();
    }
    applyPanelHeight(panelHeightPx);
    ensureTerminal(settings);
    applyTerminalSettings(settings);
    scheduleTerminalLayoutSync();
    terminal.focus();

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      connect(settings);
    }
  }

  function createPanel() {
    const host = document.createElement("div");
    preactRender(h(PanelShell, {}), host);

    panel = host.querySelector("#pier-panel");
    resizeHandle = host.querySelector("#pier-resize-handle");
    terminalContainer = host.querySelector("#pier-terminal");

    if (!panel || !resizeHandle || !terminalContainer) {
      throw new Error("Pier panel mount failed.");
    }

    attachResizeHandleBehavior(resizeHandle);
    setStatus("idle");

    host
      .querySelector('[data-pier-action="close"]')
      ?.addEventListener("click", () => {
        finishResizeInteraction({ persist: true });
        panel.hidden = true;
      });

    (document.body || document.documentElement).appendChild(panel);
  }

  function ensureTerminal(settings) {
    if (terminal) {
      return;
    }

    warmBundledSymbolFont();
    const effectiveFontFamily = resolveEffectiveFontFamily(settings);

    terminal = new Terminal({
      cursorBlink: settings.cursorBlink,
      cursorStyle: settings.cursorStyle,
      fontFamily: effectiveFontFamily,
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      letterSpacing: settings.letterSpacing,
      scrollback: settings.scrollback,
      macOptionIsMeta: settings.macOptionIsMeta,
      rightClickSelectsWord: false,
      customGlyphs: true,
      rescaleOverlappingGlyphs: true,
      allowTransparency: false,
      theme: getTheme(settings),
      allowProposedApi: false,
      convertEol: false
    });

    fitAddon = new FitAddon.FitAddon();
    terminal.loadAddon(fitAddon);

    if (typeof WebLinksAddon !== "undefined" && WebLinksAddon.WebLinksAddon) {
      terminal.loadAddon(new WebLinksAddon.WebLinksAddon());
    }

    if (
      typeof Unicode11Addon !== "undefined" &&
      Unicode11Addon.Unicode11Addon
    ) {
      try {
        const unicodeAddon = new Unicode11Addon.Unicode11Addon();
        terminal.loadAddon(unicodeAddon);
        if (
          terminal.unicode &&
          typeof terminal.unicode.activeVersion !== "undefined"
        ) {
          terminal.unicode.activeVersion = "11";
        }
      } catch {
        // Continue without unicode addon if browser/runtime rejects it.
      }
    }

    terminal.open(terminalContainer);
    installWebglRuntimeFailureHooks();
    initializeResizeObserver();
    initializeFontWatchers();
    fitAddon.fit();

    updateWebglMode(settings.preferWebgl);

    maybeAnnounceFontStack(settings, effectiveFontFamily);
    maybeWarnMissingNerdFont();

    terminal.onData((data) => {
      sendToServer({ type: "input", data });
    });

    terminal.onResize(({ cols, rows }) => {
      sendToServer({ type: "resize", cols, rows });
    });

    window.addEventListener("resize", () => {
      if (panelHeightPx !== null) {
        applyPanelHeight(panelHeightPx);
      } else if (panel && !panel.hidden) {
        applyPanelHeight(getDefaultPanelHeightPx());
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        refreshTerminalMetrics("visibility");
      }
    });

    window.addEventListener("focus", () => {
      refreshTerminalMetrics("focus");
    });
  }

  function updateWebglMode(preferWebgl) {
    if (!terminal) {
      return;
    }

    if (!preferWebgl) {
      if (webglStatus !== "disabled" || webglAddon) {
        disableWebglRenderer("disabled in settings", { userDisabled: true });
      }
      return;
    }

    if (webglAddon || webglStatus === "enabled" || webglStatus === "failed") {
      return;
    }

    if (typeof WebglAddon === "undefined" || !WebglAddon.WebglAddon) {
      if (webglStatus !== "missing") {
        webglStatus = "missing";
      }
      return;
    }

    try {
      webglAddon = new WebglAddon.WebglAddon();
      terminal.loadAddon(webglAddon);
      webglStatus = "enabled";
      if (typeof webglAddon.onContextLoss === "function") {
        webglAddon.onContextLoss(() => {
          disableWebglRenderer("WebGL context lost");
        });
      }
    } catch (error) {
      disableWebglRenderer(
        `WebGL unavailable: ${String(error.message || error)}`
      );
    }
  }

  function applyTerminalSettings(settings) {
    if (!terminal) {
      return;
    }

    const effectiveFontFamily = resolveEffectiveFontFamily(settings);
    terminal.options.fontFamily = effectiveFontFamily;
    terminal.options.fontSize = settings.fontSize;
    terminal.options.lineHeight = settings.lineHeight;
    terminal.options.letterSpacing = settings.letterSpacing;
    terminal.options.scrollback = settings.scrollback;
    terminal.options.cursorStyle = settings.cursorStyle;
    terminal.options.cursorBlink = settings.cursorBlink;
    terminal.options.macOptionIsMeta = settings.macOptionIsMeta;
    terminal.options.theme = getTheme(settings);
    updateWebglMode(settings.preferWebgl);
    scheduleTerminalLayoutSync();

    maybeAnnounceFontStack(settings, effectiveFontFamily);
    maybeWarnMissingNerdFont();
  }

  function maybeWarnMissingNerdFont() {
    if (!terminal || warnedNerdFont) {
      return;
    }

    if (
      announcedFontStack
        .toLowerCase()
        .includes(BUNDLED_SYMBOL_FONT_FAMILY.toLowerCase())
    ) {
      return;
    }

    const nerdCandidates = [
      ...PRIMARY_FONT_CANDIDATES,
      ...SYMBOL_FONT_CANDIDATES
    ].filter((name) => name.toLowerCase().includes("nerd"));

    const hasNerdFont = nerdCandidates.some((name) => fontAvailable(name));
    if (!hasNerdFont) {
      terminal.writeln(
        "[pier] Nerd Font not detected on this system. Install one for prompt icons."
      );
      warnedNerdFont = true;
    }
  }

  function setStatus(status, detail = "") {
    if (!statusEl) {
      return;
    }

    statusEl.textContent = detail ? `(${status}: ${detail})` : `(${status})`;
  }

  function sendToServer(payload) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      socket.send(JSON.stringify(payload));
    } catch {
      setStatus("error", "send failed");
    }
  }

  function closeSocket() {
    if (socket && socket.readyState < WebSocket.CLOSING) {
      socket.close();
    }
    socket = undefined;
  }

  async function loadSettings() {
    const storageArea = getStorageArea();
    if (!storageArea) {
      if (terminal && !warnedStorageUnavailable) {
        terminal.writeln(
          "[pier] storage API unavailable, using default settings."
        );
        warnedStorageUnavailable = true;
      }
      return { ...DEFAULT_SETTINGS, panelHeight: null };
    }

    return new Promise<void>((resolve) => {
      storageArea.get(
        [
          SETTINGS_KEY,
          PANEL_HEIGHT_KEY,
          "terminalBrowserSettings",
          "terminalBrowserPanelHeightPx"
        ],
        (result) => {
          const extracted =
            PIER_SHARED &&
            typeof PIER_SHARED.extractMigratedSettingsFromStorageResult ===
              "function"
              ? PIER_SHARED.extractMigratedSettingsFromStorageResult(result)
              : null;
          const hasNewKey = extracted
            ? extracted.hasNewKey
            : result != null && result[SETTINGS_KEY] != null;
          const rawSettings = extracted
            ? extracted.rawSettings
            : hasNewKey
              ? result[SETTINGS_KEY]
              : result["terminalBrowserSettings"];
          const rawHeight =
            extracted &&
            Object.prototype.hasOwnProperty.call(extracted, "rawPanelHeight")
              ? extracted.rawPanelHeight
              : result[PANEL_HEIGHT_KEY] != null
                ? result[PANEL_HEIGHT_KEY]
                : result["terminalBrowserPanelHeightPx"];

          if (!hasNewKey && rawSettings != null) {
            const toMigrate = { [SETTINGS_KEY]: rawSettings };
            if (rawHeight != null) {
              toMigrate[PANEL_HEIGHT_KEY] = rawHeight;
            }
            storageArea.set(toMigrate, () => {});
          }

          resolve({
            ...normalizeSettings(rawSettings),
            panelHeight: normalizePanelHeight(rawHeight)
          });
        }
      );
    });
  }

  function getStorageArea() {
    if (typeof chrome !== "undefined" && chrome.storage) {
      return chrome.storage.sync || chrome.storage.local || null;
    }
    if (typeof browser !== "undefined" && browser.storage) {
      return browser.storage.sync || browser.storage.local || null;
    }
    return null;
  }

  function normalizeLocalPageHost(value) {
    if (
      PIER_SHARED &&
      typeof PIER_SHARED.normalizeLocalhostHost === "function"
    ) {
      return PIER_SHARED.normalizeLocalhostHost(value);
    }
    const host = String(value || "")
      .trim()
      .toLowerCase();
    if (!host) {
      return null;
    }
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      host.endsWith(".localhost")
    ) {
      return host;
    }
    return null;
  }

  function getPageContextForServer() {
    const host = normalizeLocalPageHost(window.location.hostname);
    if (!host) {
      return { host: null, url: null };
    }
    return {
      host,
      url: window.location.href
    };
  }

  function dedupedFailureLog(message) {
    if (!terminal) {
      return;
    }
    const now = Date.now();
    if (
      message === lastFailureLog &&
      now - lastFailureLogAt < FAILURE_LOG_DEDUPE_MS
    ) {
      return;
    }
    lastFailureLog = message;
    lastFailureLogAt = now;
    terminal.writeln(message);
  }

  function bridgeHealthUrlFromWsUrl(wsUrlValue) {
    let wsUrl;
    try {
      wsUrl = new URL(wsUrlValue);
    } catch {
      return null;
    }
    wsUrl.protocol = wsUrl.protocol === "wss:" ? "https:" : "http:";
    wsUrl.pathname = "/health";
    wsUrl.search = "";
    wsUrl.hash = "";
    return wsUrl;
  }

  async function fetchBridgeHealth(wsUrlValue) {
    const healthUrl = bridgeHealthUrlFromWsUrl(wsUrlValue);
    if (!healthUrl) {
      return { ok: false, reason: "invalid-url" };
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, BRIDGE_DIAG_TIMEOUT_MS);

    try {
      const response = await fetch(healthUrl.toString(), {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      });
      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      if (!response.ok) {
        return {
          ok: false,
          reason: `status-${response.status}`,
          healthUrl: healthUrl.toString(),
          payload
        };
      }
      return {
        ok: true,
        healthUrl: healthUrl.toString(),
        payload
      };
    } catch {
      return { ok: false, reason: "network", healthUrl: healthUrl.toString() };
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function diagnoseHandshakeFailure(settings) {
    const health = await fetchBridgeHealth(settings.wsUrl);
    if (!health.ok) {
      return {
        status: "bridge-unreachable",
        detail:
          "Bridge unreachable. Run `pier setup` (or `pier bridge start`) and reload this page."
      };
    }

    const strictToken = Boolean(
      health.payload &&
        health.payload.auth &&
        health.payload.auth.strictToken === true
    );
    if (strictToken) {
      return {
        status: "token-mismatch",
        detail:
          "Bridge is running, but token auth failed. Run `pier setup` and copy the token into extension settings."
      };
    }

    return {
      status: "bridge-rejected",
      detail:
        "Bridge is running but rejected this WebSocket. Verify the WebSocket URL in extension settings."
    };
  }

  async function connect(preloadedSettings) {
    if (connecting || !terminal) {
      return;
    }

    connecting = true;
    setStatus("connecting");

    try {
      const settings = preloadedSettings || (await loadSettings());
      const wsUrl = new URL(settings.wsUrl);
      wsUrl.searchParams.set("token", settings.token || "");
      wsUrl.searchParams.set("cols", String(terminal.cols || 120));
      wsUrl.searchParams.set("rows", String(terminal.rows || 32));
      if (activeSessionId) {
        wsUrl.searchParams.set("sessionId", activeSessionId);
      }
      const pageContext = getPageContextForServer();
      if (pageContext.host) {
        wsUrl.searchParams.set("pageHost", pageContext.host);
      }
      if (pageContext.url) {
        wsUrl.searchParams.set("pageUrl", pageContext.url);
      }

      closeSocket();
      const nextSocket = new WebSocket(wsUrl.toString());
      socket = nextSocket;
      let opened = false;
      let handledEarlyFailure = false;

      async function handleEarlyFailure() {
        if (handledEarlyFailure || opened || socket !== nextSocket) {
          return;
        }
        handledEarlyFailure = true;
        const diagnosis = await diagnoseHandshakeFailure(settings);
        if (socket !== nextSocket) {
          return;
        }
        setStatus("error", diagnosis.status);
        dedupedFailureLog(`[pier] ${diagnosis.detail}`);
      }

      nextSocket.addEventListener("open", () => {
        if (socket !== nextSocket) {
          return;
        }
        opened = true;
        setStatus("connected");
      });

      nextSocket.addEventListener("message", (event) => {
        if (socket !== nextSocket) {
          return;
        }
        handleServerMessage(event.data);
      });

      nextSocket.addEventListener("close", () => {
        if (socket !== nextSocket) {
          return;
        }
        if (!opened) {
          void handleEarlyFailure();
          return;
        }
        setStatus("disconnected");
        dedupedFailureLog("[pier] Disconnected.");
      });

      nextSocket.addEventListener("error", () => {
        if (socket !== nextSocket) {
          return;
        }
        if (!opened) {
          void handleEarlyFailure();
          return;
        }
        setStatus("error", "websocket");
        dedupedFailureLog("[pier] WebSocket error.");
      });
    } catch (error) {
      setStatus("error", "connect failed");
      terminal.writeln(`\r\n[pier] ${String(error.message || error)}\r\n`);
    } finally {
      connecting = false;
    }
  }

  function handleServerMessage(raw) {
    let payload;
    try {
      payload = JSON.parse(raw);
    } catch {
      terminal.write(String(raw));
      return;
    }

    if (payload.type === "output") {
      terminal.write(payload.data || "");
      return;
    }

    if (payload.type === "session") {
      activeSessionId = saveSessionId(payload.sessionId);
      return;
    }

    if (payload.type === "exit") {
      activeSessionId = saveSessionId(null);
      const exitCode = payload.exitCode;
      terminal.writeln(
        `\r\n[pier] shell exited (${exitCode ?? "unknown"})\r\n`
      );
      setStatus("exited", String(exitCode ?? "n/a"));
      return;
    }

    if (payload.type === "error") {
      terminal.writeln(`\r\n[pier] ${payload.message || "server error"}\r\n`);
      setStatus("error", "server");
    }
  }
})();
