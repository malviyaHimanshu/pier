const { SESSION_ID } = require("./constants");

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

export {};
