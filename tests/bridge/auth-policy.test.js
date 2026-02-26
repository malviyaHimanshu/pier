const {
  evaluateTokenAuth,
  toBool
} = require("../../packages/bridge-core/dist/security/auth-policy");

describe("auth policy", () => {
  it("accepts configured token", () => {
    expect(
      evaluateTokenAuth({
        incomingToken: "abc",
        configuredToken: "abc",
        strictToken: true
      })
    ).toEqual({ ok: true, mode: "configured" });
  });

  it("accepts legacy default token in non-strict mode", () => {
    expect(
      evaluateTokenAuth({
        incomingToken: "change-me",
        configuredToken: "random-token",
        strictToken: false
      })
    ).toEqual({ ok: true, mode: "legacy-default" });
  });

  it("rejects legacy default token in strict mode", () => {
    expect(
      evaluateTokenAuth({
        incomingToken: "change-me",
        configuredToken: "random-token",
        strictToken: true
      })
    ).toEqual({ ok: false, mode: "rejected" });
  });

  it("parses booleans from env-like values", () => {
    expect(toBool("1", false)).toBe(true);
    expect(toBool("true", false)).toBe(true);
    expect(toBool("0", true)).toBe(false);
    expect(toBool("", true)).toBe(true);
    expect(toBool("invalid", false)).toBe(false);
  });
});
