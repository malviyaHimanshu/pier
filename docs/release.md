# Release

## Pre-Release Checklist

1. Update changesets (if using changesets workflow)
2. Run:

```bash
pnpm install
pnpm run build
pnpm run check
```

## Tarball Validation

```bash
pnpm pack
pnpm run test:pack-smoke
```

This validates the packed tarball by installing it into a temporary project and checking:

- CLI commands run (`--help`, `version`, `extension path`, `doctor`)
- generated extension output is present
- package can be consumed from an npm tarball install

## Publish

Publish using your normal npm release flow after the tarball smoke test passes.
