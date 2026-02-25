# Release

This repo ships two artifacts:

- npm package: `@malviyahimanshu/pier` (CLI command remains `pier`)
- Chrome Web Store upload ZIP: the built `extension/` bundle

## Release Prerequisites

1. `npm` owner access for the `@malviyahimanshu/pier` package (`npm whoami`)
2. npm account 2FA enabled (recommended/expected for publish)
3. Chrome Web Store Developer account + existing extension listing (or create one)
4. Clean working tree (recommended)
5. Version bumped in `package.json` (and changesets/changelog if you use them)

## One-Command Release Artifact Build

```bash
pnpm install
pnpm run release:artifacts
```

This runs build + checks, creates the npm tarball, validates the tarball install, and creates a Chrome Web Store ZIP + SHA256 file.

Artifacts produced:

- `./malviyahimanshu-pier-<version>.tgz`
- `./artifacts/chrome-web-store/pier-extension-chrome-web-store-v<version>.zip`
- `./artifacts/chrome-web-store/pier-extension-chrome-web-store-v<version>.zip.sha256`

## npm Publish (Manual)

Recommended final verification:

```bash
pnpm run release:npm:dry-run
```

Publish:

```bash
npm publish --access public
```

Best practice:

- publish from a tagged commit (for example `v1.0.1`)
- run from CI with provenance (`npm publish --provenance`) when possible
- verify the published package with `npm view @malviyahimanshu/pier version`

## npm Publish (GitHub Actions, Recommended)

The repo includes `.github/workflows/release.yml`.

- Tag a release commit: `git tag vX.Y.Z && git push origin vX.Y.Z`
- Add `NPM_TOKEN` in repo secrets
- The workflow will build/test again and publish with `--provenance`
- Release artifacts (npm tarball + extension ZIP) are uploaded as workflow artifacts

## Chrome Web Store Publish (Manual Upload)

1. Run `pnpm run release:artifacts`
2. Open the Chrome Web Store Developer Dashboard
3. Select the Pier extension listing
4. Upload `artifacts/chrome-web-store/pier-extension-chrome-web-store-v<version>.zip`
5. Complete listing/review fields (what changed, screenshots, privacy disclosures)
6. Submit for review / publish rollout

Web Store best practices:

- keep host access minimal (this extension is restricted to localhost/127.0.0.1/`*.localhost`)
- keep permissions minimal (`storage` only unless a new feature requires more)
- include clear release notes per version
- verify the uploaded ZIP locally by loading it as unpacked before submission
- ensure screenshots and listing text match current UI and behavior

## Quick Validation Commands

```bash
pnpm run build
pnpm run check
pnpm run pack:npm
pnpm run test:pack-smoke
pnpm run pack:extension
```
