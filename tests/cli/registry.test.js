const fs = require("fs");
const os = require("os");
const path = require("path");
const {
  listRoutes,
  readRegistry,
  removeRoute,
  upsertRoute
} = require("../../packages/cli-core/dist/workspace-registry/registry");

const tmpDirs = [];
function makeTmpDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pier-registry-test-"));
  tmpDirs.push(dir);
  return dir;
}

afterEach(() => {
  while (tmpDirs.length) {
    fs.rmSync(tmpDirs.pop(), { recursive: true, force: true });
  }
});

describe("workspace registry", () => {
  it("writes and reads host mappings", () => {
    const cwd = makeTmpDir();
    const resolvedCwd = fs.realpathSync(cwd);
    const registryFile = path.join(makeTmpDir(), "workspace-routes.json");

    upsertRoute({
      host: "app.localhost",
      cwd,
      filePath: registryFile,
      source: "test"
    });
    const routes = listRoutes({ filePath: registryFile });

    expect(routes).toHaveLength(1);
    expect(routes[0].host).toBe("app.localhost");
    expect(routes[0].cwd).toBe(resolvedCwd);

    const removed = removeRoute("app.localhost", { filePath: registryFile });
    expect(removed.existed).toBe(true);
    expect(listRoutes({ filePath: registryFile })).toEqual([]);
  });

  it("tolerates invalid entries in registry", () => {
    const registryFile = path.join(makeTmpDir(), "workspace-routes.json");
    fs.writeFileSync(
      registryFile,
      JSON.stringify({
        version: 1,
        routes: {
          "bad host": { cwd: "/tmp" },
          "ok.localhost": { cwd: "/missing" }
        }
      })
    );
    const registry = readRegistry(registryFile);
    expect(registry.version).toBe(1);
    expect(Object.keys(registry.routes)).not.toContain("bad host");
  });
});
