/** @jsxImportSource preact */
import { useEffect, useState } from "preact/hooks";
import { getStorageArea, loadSettings, saveSettings } from "./settings-store";
import { validateConnectionFields } from "./validation";
import { generateToken } from "./token-generator";
import { testConnection } from "./connection-test";
import type { SharedRuntime, StatusTone, TerminalSettings } from "./types";

interface AppProps {
  shared: SharedRuntime;
}

interface StatusState {
  tone: StatusTone;
  message: string;
}

const DEFAULT_STATUS: StatusState = {
  tone: "info",
  message: "Loading settings..."
};

export function App({ shared }: AppProps) {
  const [status, setStatus] = useState<StatusState>(DEFAULT_STATUS);
  const [settings, setSettings] = useState<TerminalSettings>(
    shared.DEFAULT_TERMINAL_SETTINGS
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const storageArea = getStorageArea();

    loadSettings(storageArea, shared)
      .then((result) => {
        if (cancelled) {
          return;
        }

        setSettings(result.settings);
        if (result.migratedPayload && storageArea) {
          storageArea.set(result.migratedPayload, () => {});
        }
        setStatus({
          tone: result.error ? "warning" : "success",
          message: result.error || "Loaded settings."
        });
        setLoaded(true);
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }
        setStatus({
          tone: "error",
          message: String(error?.message || error)
        });
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [shared]);

  function patchSettings(partial: Partial<TerminalSettings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  function validateCurrent(settingsValue: TerminalSettings) {
    return validateConnectionFields({
      wsUrl: settingsValue.wsUrl.trim(),
      token: settingsValue.token.trim()
    });
  }

  async function onSubmit(event: Event) {
    event.preventDefault();
    const validationError = validateCurrent(settings);
    if (validationError) {
      setStatus({ tone: "error", message: validationError });
      return;
    }

    const normalized = shared.normalizeTerminalSettings({
      ...settings,
      wsUrl: settings.wsUrl.trim(),
      token: settings.token.trim(),
      fontFamily: settings.fontFamily.trim()
    });

    const result = await saveSettings(getStorageArea(), shared, normalized);
    if (!result.ok) {
      setStatus({ tone: "error", message: result.error || "Save failed." });
      return;
    }

    setSettings(normalized);
    setStatus({
      tone: "success",
      message: "Saved. Reload localhost tabs to apply rendering changes."
    });
  }

  async function onTestConnection() {
    const validationError = validateCurrent(settings);
    if (validationError) {
      setStatus({ tone: "error", message: validationError });
      return;
    }

    setStatus({ tone: "info", message: "Testing bridge connection..." });
    const result = await testConnection(settings.wsUrl.trim());
    setStatus({
      tone: result.ok ? "success" : "error",
      message: result.message
    });
  }

  function onGenerateToken() {
    try {
      patchSettings({ token: generateToken(shared) });
      setStatus({
        tone: "success",
        message: "Generated a new token. Save to apply."
      });
    } catch {
      setStatus({
        tone: "error",
        message: "Token generation unavailable in this browser runtime."
      });
    }
  }

  return (
    <main>
      <header class="hero">
        <img src="assets/logo.png" alt="Pier logo" class="hero-logo" />
        <div>
          <h1>Pier Settings</h1>
          <p>
            Configure the local bridge connection and terminal rendering. Leave
            font family as <code>auto</code> to auto-detect system Nerd Fonts.
          </p>
        </div>
      </header>

      <form id="settings-form" onSubmit={onSubmit}>
        <h2>Connection</h2>
        <label for="ws-url">WebSocket URL</label>
        <input
          id="ws-url"
          type="text"
          value={settings.wsUrl}
          onInput={(e) =>
            patchSettings({
              wsUrl: (e.currentTarget as HTMLInputElement).value
            })
          }
          placeholder="ws://127.0.0.1:4570/terminal"
        />

        <label for="token">Access Token</label>
        <input
          id="token"
          type="text"
          value={settings.token}
          onInput={(e) =>
            patchSettings({
              token: (e.currentTarget as HTMLInputElement).value
            })
          }
          placeholder="Paste your terminal token"
        />

        <h2>Appearance</h2>
        <label for="font-family">Font Family</label>
        <input
          id="font-family"
          type="text"
          value={settings.fontFamily}
          onInput={(e) =>
            patchSettings({
              fontFamily: (e.currentTarget as HTMLInputElement).value
            })
          }
          placeholder='auto (or e.g. "Geist Mono", "Symbols Nerd Font Mono", monospace)'
        />

        <div class="grid-2">
          <div>
            <label for="font-size">Font Size</label>
            <input
              id="font-size"
              type="number"
              min="10"
              max="30"
              step="1"
              value={String(settings.fontSize)}
              onInput={(e) =>
                patchSettings({
                  fontSize: Number((e.currentTarget as HTMLInputElement).value)
                })
              }
            />
          </div>
          <div>
            <label for="line-height">Line Height</label>
            <input
              id="line-height"
              type="number"
              min="1"
              max="2"
              step="0.05"
              value={String(settings.lineHeight)}
              onInput={(e) =>
                patchSettings({
                  lineHeight: Number(
                    (e.currentTarget as HTMLInputElement).value
                  )
                })
              }
            />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label for="letter-spacing">Letter Spacing</label>
            <input
              id="letter-spacing"
              type="number"
              min="-2"
              max="5"
              step="0.1"
              value={String(settings.letterSpacing)}
              onInput={(e) =>
                patchSettings({
                  letterSpacing: Number(
                    (e.currentTarget as HTMLInputElement).value
                  )
                })
              }
            />
          </div>
          <div>
            <label for="scrollback">Scrollback</label>
            <input
              id="scrollback"
              type="number"
              min="1000"
              max="200000"
              step="1000"
              value={String(settings.scrollback)}
              onInput={(e) =>
                patchSettings({
                  scrollback: Number(
                    (e.currentTarget as HTMLInputElement).value
                  )
                })
              }
            />
          </div>
        </div>

        <div class="grid-2">
          <div>
            <label for="cursor-style">Cursor Style</label>
            <select
              id="cursor-style"
              value={settings.cursorStyle}
              onChange={(e) =>
                patchSettings({
                  cursorStyle: (e.currentTarget as HTMLSelectElement).value
                })
              }
            >
              <option value="block">Block</option>
              <option value="underline">Underline</option>
              <option value="bar">Bar</option>
            </select>
          </div>
          <div>
            <label for="theme-preset">Theme Preset</label>
            <select
              id="theme-preset"
              value={settings.themePreset}
              onChange={(e) =>
                patchSettings({
                  themePreset: (e.currentTarget as HTMLSelectElement).value
                })
              }
            >
              <option value="vscode-dark">VS Code Dark+</option>
              <option value="ghostty-ink">Ghostty Ink</option>
              <option value="midnight-blue">Midnight Blue</option>
              <option value="dracula">Dracula</option>
            </select>
          </div>
        </div>

        <label class="check-row" for="cursor-blink">
          <input
            id="cursor-blink"
            type="checkbox"
            checked={settings.cursorBlink}
            onChange={(e) =>
              patchSettings({
                cursorBlink: (e.currentTarget as HTMLInputElement).checked
              })
            }
          />
          <span>Blinking cursor</span>
        </label>

        <label class="check-row" for="mac-option-meta">
          <input
            id="mac-option-meta"
            type="checkbox"
            checked={settings.macOptionIsMeta}
            onChange={(e) =>
              patchSettings({
                macOptionIsMeta: (e.currentTarget as HTMLInputElement).checked
              })
            }
          />
          <span>Map Option key to Meta (macOS style)</span>
        </label>

        <label class="check-row" for="prefer-webgl">
          <input
            id="prefer-webgl"
            type="checkbox"
            checked={settings.preferWebgl}
            onChange={(e) =>
              patchSettings({
                preferWebgl: (e.currentTarget as HTMLInputElement).checked
              })
            }
          />
          <span>Prefer WebGL renderer (faster when available)</span>
        </label>

        <div class="actions">
          <button type="button" onClick={onGenerateToken}>
            Generate Token
          </button>
          <button type="button" id="test-connection" onClick={onTestConnection}>
            Test Bridge
          </button>
          <button type="submit" disabled={!loaded}>
            Save Settings
          </button>
        </div>
      </form>

      <p id="status" role="status" aria-live="polite" data-tone={status.tone}>
        {status.message}
      </p>
    </main>
  );
}
