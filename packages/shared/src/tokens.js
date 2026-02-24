function randomHexToken(length = 48) {
  const size = Math.ceil(length / 2);

  if (
    globalThis.crypto &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(size);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  }
  throw new Error("Web Crypto API unavailable");
}

module.exports = {
  randomHexToken
};
