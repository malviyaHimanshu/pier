const MESSAGE_TYPES = {
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
