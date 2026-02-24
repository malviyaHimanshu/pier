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
