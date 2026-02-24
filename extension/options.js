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

  // packages/extension-src/src/options/dom.js
  var require_dom = __commonJS({
    "packages/extension-src/src/options/dom.js"(exports, module) {
      function qs(id) {
        return document.getElementById(id);
      }
      function getDom() {
        return {
          form: qs("settings-form"),
          wsUrlInput: qs("ws-url"),
          tokenInput: qs("token"),
          fontFamilyInput: qs("font-family"),
          fontSizeInput: qs("font-size"),
          lineHeightInput: qs("line-height"),
          letterSpacingInput: qs("letter-spacing"),
          scrollbackInput: qs("scrollback"),
          cursorStyleSelect: qs("cursor-style"),
          themePresetSelect: qs("theme-preset"),
          cursorBlinkInput: qs("cursor-blink"),
          macOptionMetaInput: qs("mac-option-meta"),
          preferWebglInput: qs("prefer-webgl"),
          statusEl: qs("status"),
          generateTokenButton: qs("generate-token"),
          testConnectionButton: qs("test-connection")
        };
      }
      module.exports = {
        getDom
      };
    }
  });

  // packages/extension-src/src/options/form-bindings.js
  var require_form_bindings = __commonJS({
    "packages/extension-src/src/options/form-bindings.js"(exports, module) {
      function applyFormValues(dom, settings) {
        dom.wsUrlInput.value = settings.wsUrl;
        dom.tokenInput.value = settings.token;
        dom.fontFamilyInput.value = settings.fontFamily;
        dom.fontSizeInput.value = String(settings.fontSize);
        dom.lineHeightInput.value = String(settings.lineHeight);
        dom.letterSpacingInput.value = String(settings.letterSpacing);
        dom.scrollbackInput.value = String(settings.scrollback);
        dom.cursorStyleSelect.value = settings.cursorStyle;
        dom.themePresetSelect.value = settings.themePreset;
        dom.cursorBlinkInput.checked = settings.cursorBlink;
        dom.macOptionMetaInput.checked = settings.macOptionIsMeta;
        dom.preferWebglInput.checked = settings.preferWebgl;
      }
      function readFormValues(dom, normalizeTerminalSettings) {
        return normalizeTerminalSettings({
          wsUrl: dom.wsUrlInput.value.trim(),
          token: dom.tokenInput.value.trim(),
          fontFamily: dom.fontFamilyInput.value.trim(),
          fontSize: dom.fontSizeInput.value,
          lineHeight: dom.lineHeightInput.value,
          letterSpacing: dom.letterSpacingInput.value,
          scrollback: dom.scrollbackInput.value,
          cursorStyle: dom.cursorStyleSelect.value,
          cursorBlink: dom.cursorBlinkInput.checked,
          themePreset: dom.themePresetSelect.value,
          macOptionIsMeta: dom.macOptionMetaInput.checked,
          preferWebgl: dom.preferWebglInput.checked
        });
      }
      module.exports = {
        applyFormValues,
        readFormValues
      };
    }
  });

  // packages/extension-src/src/options/settings-store.js
  var require_settings_store = __commonJS({
    "packages/extension-src/src/options/settings-store.js"(exports, module) {
      function getStorageArea() {
        if (typeof chrome !== "undefined" && chrome.storage) {
          return chrome.storage.sync || chrome.storage.local || null;
        }
        if (typeof browser !== "undefined" && browser.storage) {
          return browser.storage.sync || browser.storage.local || null;
        }
        return null;
      }
      function loadSettings(storageArea, shared) {
        if (!storageArea) {
          return Promise.resolve({
            settings: { ...shared.DEFAULT_TERMINAL_SETTINGS },
            migratedPayload: null,
            error: "Storage API unavailable. Using defaults for this session."
          });
        }
        return new Promise((resolve) => {
          storageArea.get(
            [
              shared.STORAGE_KEYS.SETTINGS,
              shared.STORAGE_KEYS.SETTINGS_LEGACY,
              shared.STORAGE_KEYS.PANEL_HEIGHT,
              shared.STORAGE_KEYS.PANEL_HEIGHT_LEGACY
            ],
            (result) => {
              const migrated = shared.extractMigratedSettingsFromStorageResult(
                result || {}
              );
              const migratedPayload =
                !migrated.hasNewKey && migrated.rawSettings != null
                  ? { [shared.STORAGE_KEYS.SETTINGS]: migrated.rawSettings }
                  : null;
              resolve({
                settings: migrated.settings,
                migratedPayload,
                error: null
              });
            }
          );
        });
      }
      function saveSettings(storageArea, shared, settings) {
        if (!storageArea) {
          return Promise.resolve({
            ok: false,
            error: "Storage API unavailable. Could not save."
          });
        }
        return new Promise((resolve) => {
          storageArea.set({ [shared.STORAGE_KEYS.SETTINGS]: settings }, () => {
            resolve({ ok: true });
          });
        });
      }
      module.exports = {
        getStorageArea,
        loadSettings,
        saveSettings
      };
    }
  });

  // packages/extension-src/src/options/validation.js
  var require_validation = __commonJS({
    "packages/extension-src/src/options/validation.js"(exports, module) {
      function validateConnectionFields({ wsUrl, token }) {
        if (!wsUrl) {
          return "WebSocket URL is required.";
        }
        try {
          const parsed = new URL(wsUrl);
          if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
            return "WebSocket URL must use ws:// or wss://";
          }
        } catch {
          return "WebSocket URL is invalid.";
        }
        if (!token) {
          return "Access token is required.";
        }
        return null;
      }
      module.exports = {
        validateConnectionFields
      };
    }
  });

  // packages/extension-src/src/options/token-generator.js
  var require_token_generator = __commonJS({
    "packages/extension-src/src/options/token-generator.js"(exports, module) {
      function generateToken(shared) {
        return shared.randomHexToken(48);
      }
      module.exports = {
        generateToken
      };
    }
  });

  // packages/extension-src/src/options/connection-test.js
  var require_connection_test = __commonJS({
    "packages/extension-src/src/options/connection-test.js"(exports, module) {
      async function testConnection(wsUrl) {
        let url;
        try {
          url = new URL(wsUrl);
        } catch {
          return { ok: false, message: "Invalid WebSocket URL." };
        }
        url.protocol = url.protocol === "wss:" ? "https:" : "http:";
        url.pathname = "/health";
        url.search = "";
        try {
          const response = await fetch(url.toString(), {
            method: "GET",
            cache: "no-store"
          });
          if (!response.ok) {
            return {
              ok: false,
              message: `Bridge health check failed (${response.status}).`
            };
          }
          const payload = await response.json().catch(() => null);
          if (!payload || payload.ok !== true) {
            return {
              ok: false,
              message: "Bridge did not return a valid health response."
            };
          }
          return { ok: true, message: `Bridge reachable at ${url.host}.` };
        } catch {
          return {
            ok: false,
            message:
              "Bridge unreachable. Start `pier setup` or `pier bridge start`."
          };
        }
      }
      module.exports = {
        testConnection
      };
    }
  });

  // packages/extension-src/src/options/index.js
  var require_index = __commonJS({
    "packages/extension-src/src/options/index.js"() {
      var { getDom } = require_dom();
      var { applyFormValues, readFormValues } = require_form_bindings();
      var { getStorageArea, loadSettings, saveSettings } =
        require_settings_store();
      var { validateConnectionFields } = require_validation();
      var { generateToken } = require_token_generator();
      var { testConnection } = require_connection_test();
      (() => {
        const shared = globalThis.PierShared;
        if (!shared) {
          throw new Error(
            "PierShared runtime missing. Ensure extension/shared-runtime.js is loaded first."
          );
        }
        const dom = getDom();
        const storageArea = getStorageArea();
        function setStatus(message, tone = "info") {
          dom.statusEl.textContent = message;
          dom.statusEl.dataset.tone = tone;
        }
        function validateCurrentForm() {
          const error = validateConnectionFields({
            wsUrl: dom.wsUrlInput.value.trim(),
            token: dom.tokenInput.value.trim()
          });
          return error;
        }
        async function load() {
          const result = await loadSettings(storageArea, shared);
          applyFormValues(dom, result.settings);
          if (result.migratedPayload && storageArea) {
            storageArea.set(result.migratedPayload, () => {});
          }
          if (result.error) {
            setStatus(result.error, "warning");
            return;
          }
          setStatus("Loaded settings.", "success");
        }
        dom.form.addEventListener("submit", async (event) => {
          event.preventDefault();
          const validationError = validateCurrentForm();
          if (validationError) {
            setStatus(validationError, "error");
            return;
          }
          const settings = readFormValues(
            dom,
            shared.normalizeTerminalSettings
          );
          const result = await saveSettings(storageArea, shared, settings);
          if (!result.ok) {
            setStatus(result.error, "error");
            return;
          }
          setStatus(
            "Saved. Reload localhost tabs to apply rendering changes.",
            "success"
          );
        });
        dom.generateTokenButton.addEventListener("click", () => {
          try {
            dom.tokenInput.value = generateToken(shared);
            setStatus("Generated a new token. Save to apply.", "success");
          } catch {
            setStatus(
              "Token generation unavailable in this browser runtime.",
              "error"
            );
          }
        });
        if (dom.testConnectionButton) {
          dom.testConnectionButton.addEventListener("click", async () => {
            const validationError = validateCurrentForm();
            if (validationError) {
              setStatus(validationError, "error");
              return;
            }
            setStatus("Testing bridge connection...", "info");
            const result = await testConnection(dom.wsUrlInput.value.trim());
            setStatus(result.message, result.ok ? "success" : "error");
          });
        }
        load().catch((error) => {
          setStatus(String(error.message || error), "error");
        });
      })();
    }
  });
  require_index();
})();
