# Architecture

## Flow

1. `pier <name> <cmd...>` wraps `portless` and stores `<name>.localhost -> cwd`
2. CLI ensures local bridge is running (`node-pty` / fallback shell pipes)
3. Chrome extension content script activates only on localhost pages
4. Content script opens a WebSocket to `/terminal` with token + page context
5. Bridge resolves the page hostname to a mapped workspace directory
6. Terminal session is created/reused and streamed into xterm.js in-page

## Repo layout (high-level)

- `bin/`, `cli/`, `server/`: compatibility entrypoints
- `packages/shared`: shared schema/validation/runtime helpers
- `packages/cli-core`: CLI implementation and workspace registry
- `packages/bridge-core`: bridge server implementation
- `packages/extension-src`: source for extension-generated assets (options/shared runtime)
- `extension/`: unpacked extension assets loaded by Chrome
