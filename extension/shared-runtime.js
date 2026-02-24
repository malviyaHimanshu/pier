(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) =>
    function __require() {
      return (
        mod ||
          (0, cb[__getOwnPropNames(cb)[0]])(
            (mod = { exports: {} }).exports,
            mod
          ),
        mod.exports
      );
    };

  // packages/shared/src/constants.js
  var require_constants = __commonJS({
    "packages/shared/src/constants.js"(exports, module) {
      var LOCALHOST_SUFFIX = ".localhost";
      var STORAGE_KEYS = {
        SETTINGS: "pierSettings",
        SETTINGS_LEGACY: "terminalBrowserSettings",
        PANEL_HEIGHT: "pierPanelHeightPx",
        PANEL_HEIGHT_LEGACY: "terminalBrowserPanelHeightPx",
        SESSION_ID: "pierSessionId"
      };
      var SESSION_ID = {
        MAX_LENGTH: 128,
        PATTERN: /^[A-Za-z0-9_-]+$/
      };
      var DEFAULT_BRIDGE = {
        HOST: "127.0.0.1",
        PORT: 4570,
        WS_PATH: "/terminal"
      };
      var LEGACY_DEFAULT_FONT_STACK =
        '"JetBrainsMono Nerd Font", "MesloLGS NF", "FiraCode Nerd Font", "Hack Nerd Font", "Symbols Nerd Font Mono", Menlo, Monaco, Consolas, monospace';
      var DEFAULT_TERMINAL_SETTINGS = {
        wsUrl: `ws://${DEFAULT_BRIDGE.HOST}:${DEFAULT_BRIDGE.PORT}${DEFAULT_BRIDGE.WS_PATH}`,
        token: "change-me",
        fontFamily: "auto",
        fontSize: 14,
        lineHeight: 1.2,
        letterSpacing: 0,
        scrollback: 1e4,
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
    }
  });

  // packages/shared/src/localhost.js
  var require_localhost = __commonJS({
    "packages/shared/src/localhost.js"(exports, module) {
      var { LOCALHOST_SUFFIX } = require_constants();
      function isLocalhostHost(hostname) {
        const host = String(hostname || "")
          .trim()
          .toLowerCase();
        return (
          host === "localhost" ||
          host === "127.0.0.1" ||
          host === "::1" ||
          host === "[::1]" ||
          host.endsWith(LOCALHOST_SUFFIX)
        );
      }
      function normalizeLocalhostHost(value) {
        const host = String(value || "")
          .trim()
          .toLowerCase();
        if (!host) {
          return null;
        }
        return isLocalhostHost(host) ? host : null;
      }
      module.exports = {
        isLocalhostHost,
        normalizeLocalhostHost
      };
    }
  });

  // packages/shared/src/session-id.js
  var require_session_id = __commonJS({
    "packages/shared/src/session-id.js"(exports, module) {
      var { SESSION_ID } = require_constants();
      function normalizeSessionId(value) {
        const raw = String(value || "").trim();
        if (!raw) {
          return null;
        }
        if (raw.length > SESSION_ID.MAX_LENGTH) {
          return null;
        }
        if (!SESSION_ID.PATTERN.test(raw)) {
          return null;
        }
        return raw;
      }
      module.exports = {
        normalizeSessionId
      };
    }
  });

  // packages/shared/src/theme-presets.js
  var require_theme_presets = __commonJS({
    "packages/shared/src/theme-presets.js"(exports, module) {
      var THEME_PRESETS = {
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
        }
      };
      module.exports = { THEME_PRESETS };
    }
  });

  // packages/shared/src/terminal-settings.js
  var require_terminal_settings = __commonJS({
    "packages/shared/src/terminal-settings.js"(exports, module) {
      var {
        DEFAULT_TERMINAL_SETTINGS,
        LEGACY_DEFAULT_FONT_STACK,
        STORAGE_KEYS
      } = require_constants();
      var { THEME_PRESETS } = require_theme_presets();
      var CURSOR_STYLES = /* @__PURE__ */ new Set([
        "block",
        "underline",
        "bar"
      ]);
      var THEME_PRESET_NAMES = new Set(Object.keys(THEME_PRESETS));
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
              1e3,
              2e5
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
        const hasNewKey =
          result != null && result[STORAGE_KEYS.SETTINGS] != null;
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
    }
  });

  // packages/shared/src/tokens.js
  var require_tokens = __commonJS({
    "packages/shared/src/tokens.js"(exports, module) {
      function randomHexToken(length = 48) {
        const size = Math.ceil(length / 2);
        if (
          globalThis.crypto &&
          typeof globalThis.crypto.getRandomValues === "function"
        ) {
          const bytes = new Uint8Array(size);
          globalThis.crypto.getRandomValues(bytes);
          return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
            .join("")
            .slice(0, length);
        }
        throw new Error("Web Crypto API unavailable");
      }
      module.exports = {
        randomHexToken
      };
    }
  });

  // packages/shared/src/ws-protocol.js
  var require_ws_protocol = __commonJS({
    "packages/shared/src/ws-protocol.js"(exports, module) {
      var MESSAGE_TYPES = {
        INPUT: "input",
        OUTPUT: "output",
        RESIZE: "resize",
        SESSION: "session",
        EXIT: "exit",
        ERROR: "error"
      };
      function safeParseJson(value) {
        try {
          return { ok: true, value: JSON.parse(String(value)) };
        } catch {
          return { ok: false, value: null };
        }
      }
      module.exports = {
        MESSAGE_TYPES,
        safeParseJson
      };
    }
  });

  // packages/shared/src/index.js
  var require_src = __commonJS({
    "packages/shared/src/index.js"(exports, module) {
      module.exports = {
        ...require_constants(),
        ...require_localhost(),
        ...require_session_id(),
        ...require_terminal_settings(),
        ...require_theme_presets(),
        ...require_tokens(),
        ...require_ws_protocol()
      };
    }
  });

  // packages/extension-src/src/shared-runtime-entry.js
  var require_shared_runtime_entry = __commonJS({
    "packages/extension-src/src/shared-runtime-entry.js"() {
      var shared = require_src();
      var {
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
    }
  });
  require_shared_runtime_entry();
})();
