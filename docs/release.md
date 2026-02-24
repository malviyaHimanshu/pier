# Release

## Pre-release checklist

```bash
pnpm install --frozen-lockfile
pnpm run build
pnpm run check
pnpm run test
pnpm pack
```

## Versioning

Use Changesets for release notes/version tracking:

```bash
pnpm changeset
pnpm changeset version
```

## Publish

```bash
npm publish
```

Only the root `pier` package is published; internal workspace packages are private implementation details included in the root package tarball.
