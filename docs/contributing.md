# Contributing

## Prerequisites

- Node.js 20+
- pnpm 10+
- Chrome/Chromium for extension testing

## Source of Truth vs Generated Output

- Author extension code in `packages/extension-src`
- Do not edit files in `extension/` directly
- `extension/` is generated build output (ignored in git)
- Node package runtime output lives in `packages/*/dist` (ignored in git)

## Local Setup

```bash
pnpm install
pnpm run build
pnpm run check
```

## Common Commands

- `pnpm run build` - compile TS packages + generate extension assets + sync manifest
- `pnpm run typecheck` - TypeScript project checks
- `pnpm run lint` - ESLint across JS/TS/TSX
- `pnpm run test:unit` - package build + Vitest suite
- `pnpm run test:smoke` - smoke validation for built assets and CLI shims
- `pnpm run test:pack-smoke` - tarball install smoke test (run after `pnpm pack`)

## Contribution Expectations

- Preserve CLI command and flag compatibility for `v1.x`
- Preserve config and workspace registry format compatibility
- Preserve extension storage key migration behavior
- Keep PRs focused and include tests for behavior changes
