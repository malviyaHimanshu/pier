const {
  getRequestedPageContext,
  isAllowedOrigin,
  normalizePageHost
} = require("../../packages/bridge-core/src/security/origin-policy");

describe("origin policy", () => {
  it("accepts localhost and extension origins", () => {
    expect(isAllowedOrigin("http://app.localhost:3000")).toBe(true);
    expect(isAllowedOrigin("chrome-extension://abc123")).toBe(true);
  });

  it("rejects non-localhost web origins", () => {
    expect(isAllowedOrigin("https://example.com")).toBe(false);
  });

  it("normalizes page host safely", () => {
    expect(normalizePageHost("APP.localhost")).toBe("app.localhost");
    expect(normalizePageHost("example.com")).toBeNull();
  });

  it("prefers origin host when resolving page context", () => {
    const parsed = new URL(
      "http://x/terminal?pageHost=foo.localhost&pageUrl=http%3A%2F%2Fbar.localhost%3A3000%2F"
    );
    const ctx = getRequestedPageContext(
      { headers: { origin: "http://origin.localhost:5173" } },
      parsed
    );
    expect(ctx.pageHost).toBe("origin.localhost");
  });
});
