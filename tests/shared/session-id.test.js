const { normalizeSessionId } = require("../../packages/shared/src");

describe("normalizeSessionId", () => {
  it("accepts valid ids", () => {
    expect(normalizeSessionId("abc_DEF-123")).toBe("abc_DEF-123");
  });

  it("rejects invalid characters", () => {
    expect(normalizeSessionId("abc/123")).toBeNull();
    expect(normalizeSessionId("abc 123")).toBeNull();
  });

  it("rejects too long values", () => {
    expect(normalizeSessionId("a".repeat(129))).toBeNull();
  });
});
