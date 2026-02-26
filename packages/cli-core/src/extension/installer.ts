const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const https = require("https");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const REQUIRED_EXTENSION_FILES = [
  "manifest.json",
  "content.js",
  "options.js",
  "shared-runtime.js",
  "content.css",
  "options.css",
  "vendor/xterm.css"
];

const DEFAULT_RELEASE_BASE_URL =
  "https://github.com/malviyahimanshu/pier/releases/download";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true, mode: 0o700 });
}

function normalizeVersion(versionInput) {
  const version = String(versionInput || "")
    .trim()
    .replace(/^v/i, "");
  if (!version) {
    throw new Error("Extension version is required.");
  }
  return version;
}

function getPierPackagePath() {
  return path.resolve(__dirname, "..", "..", "..", "..", "package.json");
}

function readPierPackage() {
  try {
    return JSON.parse(fs.readFileSync(getPierPackagePath(), "utf8"));
  } catch (error) {
    throw new Error(
      `Unable to read Pier package metadata: ${String(error.message || error)}`
    );
  }
}

function getPierVersion() {
  const pkg = readPierPackage();
  const version = String(pkg.version || "").trim();
  return version || "0.0.0";
}

function getDefaultExtensionAssetName(versionInput = getPierVersion()) {
  const version = normalizeVersion(versionInput);
  return `pier-extension-v${version}.zip`;
}

function getDefaultExtensionCacheDir() {
  const override = String(process.env.PIER_EXTENSION_CACHE_DIR || "").trim();
  if (override) {
    return path.resolve(override);
  }
  return path.join(os.homedir(), ".pier", "extensions");
}

function getVersionCachePath(versionInput = getPierVersion()) {
  const version = normalizeVersion(versionInput);
  return path.join(getDefaultExtensionCacheDir(), version);
}

function getInstallMarkerPath(dirPath) {
  return path.join(dirPath, ".pier-extension-install.json");
}

function hasRequiredExtensionFiles(dirPath) {
  return REQUIRED_EXTENSION_FILES.every((relPath) =>
    fs.existsSync(path.join(dirPath, relPath))
  );
}

function getInstalledExtensionPath({ version = getPierVersion() } = {}) {
  const dirPath = getVersionCachePath(version);
  if (!fs.existsSync(dirPath)) {
    return null;
  }
  if (!hasRequiredExtensionFiles(dirPath)) {
    return null;
  }
  return dirPath;
}

function parseSha256(content) {
  const match = String(content || "")
    .trim()
    .match(/[A-Fa-f0-9]{64}/);
  if (!match) {
    throw new Error("Invalid sha256 file format.");
  }
  return match[0].toLowerCase();
}

function sha256File(filePath) {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex").toLowerCase();
}

function normalizeReleaseBaseUrl(input) {
  return String(input || DEFAULT_RELEASE_BASE_URL).replace(/\/+$/, "");
}

function resolveRemoteUrls(versionInput, { from = null } = {}) {
  const version = normalizeVersion(versionInput);
  if (from) {
    return {
      zipUrl: from,
      shaUrl: `${from}.sha256`,
      assetName: path.basename(from.split("?")[0] || "") || "extension.zip"
    };
  }
  const baseUrl = normalizeReleaseBaseUrl(process.env.PIER_EXTENSION_BASE_URL);
  const assetName = getDefaultExtensionAssetName(version);
  const zipUrl = `${baseUrl}/v${version}/${assetName}`;
  return {
    zipUrl,
    shaUrl: `${zipUrl}.sha256`,
    assetName
  };
}

function downloadToFile(urlString, destinationPath, redirects = 5) {
  return new Promise((resolve, reject) => {
    let resolved = false;
    const url = new URL(urlString);
    const client = url.protocol === "http:" ? http : https;
    const request = client.get(
      url,
      {
        headers: { "user-agent": "pier-cli" }
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          if (redirects <= 0) {
            reject(new Error(`Too many redirects while fetching ${urlString}`));
            return;
          }
          const nextUrl = new URL(
            response.headers.location,
            urlString
          ).toString();
          downloadToFile(nextUrl, destinationPath, redirects - 1)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          response.resume();
          reject(
            new Error(
              `Failed to fetch ${urlString} (HTTP ${response.statusCode})`
            )
          );
          return;
        }

        ensureDir(path.dirname(destinationPath));
        const output = fs.createWriteStream(destinationPath, { mode: 0o600 });
        response.pipe(output);

        output.on("finish", () => {
          output.close(() => {
            if (!resolved) {
              resolved = true;
              resolve(destinationPath);
            }
          });
        });
        output.on("error", (error) => {
          if (resolved) {
            return;
          }
          resolved = true;
          reject(error);
        });
      }
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Request timed out: ${urlString}`));
    });
    request.on("error", (error) => {
      if (resolved) {
        return;
      }
      resolved = true;
      reject(error);
    });
  });
}

function readLocalSha(shaPath) {
  if (!fs.existsSync(shaPath)) {
    throw new Error(`Missing checksum file: ${shaPath}`);
  }
  return parseSha256(fs.readFileSync(shaPath, "utf8"));
}

async function resolveAssetAndChecksum({ version, from = null, tempDir }) {
  const candidate = String(from || "").trim();
  const fromPath = candidate ? path.resolve(candidate) : null;
  const localSource = fromPath && fs.existsSync(fromPath) ? fromPath : null;

  if (localSource) {
    const shaPath = `${localSource}.sha256`;
    return {
      zipPath: localSource,
      expectedSha: readLocalSha(shaPath),
      sourceLabel: localSource
    };
  }

  const remote = resolveRemoteUrls(version, { from: candidate || null });
  const zipPath = path.join(tempDir, remote.assetName || "extension.zip");
  const shaPath = `${zipPath}.sha256`;

  await downloadToFile(remote.zipUrl, zipPath);
  await downloadToFile(remote.shaUrl, shaPath);

  return {
    zipPath,
    expectedSha: parseSha256(fs.readFileSync(shaPath, "utf8")),
    sourceLabel: remote.zipUrl
  };
}

function extractZip(zipPath, destinationDir) {
  ensureDir(destinationDir);
  if (process.platform === "win32") {
    const script = [
      "$ErrorActionPreference = 'Stop'",
      `Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destinationDir.replace(/'/g, "''")}' -Force`
    ].join("; ");
    execFileSync(
      "powershell.exe",
      ["-NoLogo", "-NoProfile", "-NonInteractive", "-Command", script],
      { stdio: "pipe" }
    );
    return;
  }

  execFileSync("unzip", ["-q", "-o", zipPath, "-d", destinationDir], {
    stdio: "pipe"
  });
}

function findExtensionRoot(extractedDir) {
  if (hasRequiredExtensionFiles(extractedDir)) {
    return extractedDir;
  }
  const entries = fs
    .readdirSync(extractedDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory());
  for (const entry of entries) {
    const candidate = path.join(extractedDir, entry.name);
    if (hasRequiredExtensionFiles(candidate)) {
      return candidate;
    }
  }
  return null;
}

function installFromPreparedDir({
  extractedDir,
  version,
  expectedSha,
  sourceLabel,
  force = false
}) {
  const cacheDir = getDefaultExtensionCacheDir();
  ensureDir(cacheDir);
  const targetPath = getVersionCachePath(version);

  if (
    fs.existsSync(targetPath) &&
    !force &&
    hasRequiredExtensionFiles(targetPath)
  ) {
    return {
      installed: false,
      alreadyInstalled: true,
      version,
      path: targetPath,
      source: sourceLabel
    };
  }

  const installTempPath = path.join(
    cacheDir,
    `.install-${normalizeVersion(version)}-${process.pid}-${Date.now()}`
  );
  fs.rmSync(installTempPath, { recursive: true, force: true });
  fs.cpSync(extractedDir, installTempPath, { recursive: true });
  fs.writeFileSync(
    getInstallMarkerPath(installTempPath),
    JSON.stringify(
      {
        version: normalizeVersion(version),
        installedAt: new Date().toISOString(),
        source: sourceLabel,
        sha256: expectedSha
      },
      null,
      2
    ) + "\n",
    { mode: 0o600 }
  );

  if (force) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } else if (fs.existsSync(targetPath)) {
    fs.rmSync(installTempPath, { recursive: true, force: true });
    throw new Error(
      `Extension cache already exists at ${targetPath}. Re-run with --force to replace it.`
    );
  }

  fs.renameSync(installTempPath, targetPath);
  return {
    installed: true,
    alreadyInstalled: false,
    version: normalizeVersion(version),
    path: targetPath,
    source: sourceLabel
  };
}

async function installExtensionBundle({
  version = getPierVersion(),
  from = null,
  force = false
} = {}) {
  const normalizedVersion = normalizeVersion(version);
  const tmpDir = fs.mkdtempSync(
    path.join(os.tmpdir(), `pier-extension-${normalizedVersion}-`)
  );
  const extractedDir = path.join(tmpDir, "unzipped");

  try {
    const asset = await resolveAssetAndChecksum({
      version: normalizedVersion,
      from,
      tempDir: tmpDir
    });

    const actualSha = sha256File(asset.zipPath);
    if (actualSha !== asset.expectedSha) {
      throw new Error(
        `Checksum mismatch for extension bundle (${actualSha} !== ${asset.expectedSha}).`
      );
    }

    try {
      extractZip(asset.zipPath, extractedDir);
    } catch (error) {
      if (error && error.code === "ENOENT") {
        throw new Error(
          "Unable to extract extension zip: missing system unzip tool."
        );
      }
      throw error;
    }

    const root = findExtensionRoot(extractedDir);
    if (!root) {
      throw new Error(
        "Downloaded extension bundle is missing required files (manifest/content/options)."
      );
    }

    return installFromPreparedDir({
      extractedDir: root,
      version: normalizedVersion,
      expectedSha: asset.expectedSha,
      sourceLabel: asset.sourceLabel,
      force
    });
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

module.exports = {
  REQUIRED_EXTENSION_FILES,
  getPierVersion,
  getDefaultExtensionAssetName,
  getDefaultExtensionCacheDir,
  getInstalledExtensionPath,
  installExtensionBundle,
  readPierPackage
};

export {};
