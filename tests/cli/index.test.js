const {
  getExtensionPath,
  parseNameToHost
} = require("../../packages/cli-core/src");

describe("cli core helpers", () => {
  it("prints extension path under repo extension directory", () => {
    expect(getExtensionPath()).toMatch(/\/pier\/extension$/);
  });

  it("normalizes app names to localhost hostnames", () => {
    expect(parseNameToHost("MyApp").host).toBe("myapp.localhost");
    expect(parseNameToHost("api.myapp.localhost").host).toBe(
      "api.myapp.localhost"
    );
  });
});
