const {
  validateConnectionFields
} = require("../../packages/extension-src/src/options/validation");

describe("options validation", () => {
  it("validates websocket URL and token", () => {
    expect(validateConnectionFields({ wsUrl: "", token: "" })).toMatch(
      /required/i
    );
    expect(
      validateConnectionFields({ wsUrl: "http://localhost", token: "x" })
    ).toMatch(/ws:\/\//i);
    expect(
      validateConnectionFields({
        wsUrl: "ws://127.0.0.1:4570/terminal",
        token: "x"
      })
    ).toBeNull();
  });
});
