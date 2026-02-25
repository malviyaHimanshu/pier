import type { SharedRuntime, TerminalSettings } from "./types";

type StorageAreaLike = {
  get: (
    keys: string[],
    callback: (result: Record<string, unknown>) => void
  ) => void;
  set: (items: Record<string, unknown>, callback?: () => void) => void;
};

declare const browser: any;

export function getStorageArea(): StorageAreaLike | null {
  if (typeof chrome !== "undefined" && chrome.storage) {
    return (chrome.storage.sync ||
      chrome.storage.local ||
      null) as StorageAreaLike | null;
  }
  if (typeof browser !== "undefined" && browser.storage) {
    return (browser.storage.sync ||
      browser.storage.local ||
      null) as StorageAreaLike | null;
  }
  return null;
}

export async function loadSettings(
  storageArea: StorageAreaLike | null,
  shared: SharedRuntime
) {
  if (!storageArea) {
    return {
      settings: { ...shared.DEFAULT_TERMINAL_SETTINGS } as TerminalSettings,
      migratedPayload: null,
      error: "Storage API unavailable. Using defaults for this session."
    };
  }

  return new Promise<{
    settings: TerminalSettings;
    migratedPayload: Record<string, unknown> | null;
    error: string | null;
  }>((resolve) => {
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

export async function saveSettings(
  storageArea: StorageAreaLike | null,
  shared: SharedRuntime,
  settings: TerminalSettings
) {
  if (!storageArea) {
    return {
      ok: false,
      error: "Storage API unavailable. Could not save."
    };
  }

  return new Promise<{ ok: boolean; error?: string }>((resolve) => {
    storageArea.set({ [shared.STORAGE_KEYS.SETTINGS]: settings }, () => {
      resolve({ ok: true });
    });
  });
}
