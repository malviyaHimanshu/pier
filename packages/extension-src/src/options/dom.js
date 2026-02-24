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
