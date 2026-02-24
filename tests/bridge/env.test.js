const {
  readBridgeEnv,
  toInt
} = require("../../packages/bridge-core/src/config/env");

describe("bridge env", () => {
  it("clamps numeric values with toInt", () => {
    expect(toInt("999999", 5, 1, 10)).toBe(10);
    expect(toInt("bad", 5, 1, 10)).toBe(5);
  });

  it("reads defaults", () => {
    const env = readBridgeEnv({});
    expect(env.host).toBe("127.0.0.1");
    expect(env.port).toBe(4570);
    expect(env.token).toBe("change-me");
  });
});
