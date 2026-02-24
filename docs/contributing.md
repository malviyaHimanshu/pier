# Contributing

## Prerequisites

- Node.js 20+
- pnpm 10+
- Chrome/Chromium for extension testing
- `portless` installed globally for end-to-end workflows

## Local dev loop

```bash
pnpm install
pnpm run build:extension
pnpm run build:manifest
pnpm run test
pnpm run check
```

## Key commands

- `pnpm run build`: generate icons + extension bundles + sync manifest
- `pnpm run test`: unit tests + smoke checks
- `pnpm run check`: lint + format check + smoke checks

## Compatibility expectations

- Preserve existing CLI commands and flags
- Preserve registry file format compatibility
- Preserve extension storage key migration behavior
