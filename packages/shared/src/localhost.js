const { LOCALHOST_SUFFIX } = require("./constants");

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
