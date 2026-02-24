const { getDom } = require("./dom");
const { applyFormValues, readFormValues } = require("./form-bindings");
const {
  getStorageArea,
  loadSettings,
  saveSettings
} = require("./settings-store");
const { validateConnectionFields } = require("./validation");
const { generateToken } = require("./token-generator");
const { testConnection } = require("./connection-test");

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

    const settings = readFormValues(dom, shared.normalizeTerminalSettings);
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
