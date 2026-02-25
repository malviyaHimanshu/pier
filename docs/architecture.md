# Architecture

## Runtime Flow

1. `pier <name> <cmd...>` wraps `portless` and records `<name>.localhost -> cwd`
2. CLI ensures the bridge process is running
3. Extension content script activates only on localhost-style pages
4. Content script opens WebSocket `/terminal` with token + page context
5. Bridge resolves the page hostname using the workspace registry
6. Bridge creates/reuses shell session (`node-pty`, with pipe fallback)
7. xterm.js renders terminal output in-page

## Repository Structure

- `packages/shared` (TS): shared constants, settings normalization, WS protocol helpers
- `packages/cli-core` (TS -> `dist/`): CLI commands, config store, workspace routing registry
- `packages/bridge-core` (TS -> `dist/`): bridge HTTP/WebSocket server and shell session management
- `packages/extension-src` (TS/TSX): extension source code and static public assets
- `extension/` (generated): unpacked extension output built from `packages/extension-src`
- `cli/`, `server/`, `bin/` (JS shims): compatibility entrypoints that load compiled `dist/`

## Extension Build Pipeline

`pnpm run build:extension` performs:

- bundle `shared-runtime.ts` -> `extension/shared-runtime.js`
- bundle content script TS source -> `extension/content.js`
- bundle options UI TSX source -> `extension/options.js`
- copy static extension assets (`options.html`, CSS, `xterm.css`) into `extension/`
- remove stale vendored JS outputs

## Packaging Model

- Published package is still a single `pier` package
- Internal packages remain implementation details
- `prepack` runs build + checks so the published tarball includes generated extension output and compiled `dist/` files
