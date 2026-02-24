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
