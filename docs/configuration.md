# Configuration

## Bridge env vars

- `PIER_TOKEN`
- `PIER_HOST` (default `127.0.0.1`)
- `PIER_PORT` (default `4570`)
- `PIER_CWD` (default current directory)
- `PIER_SHELL` (default shell)
- `PIER_SESSION_DETACH_TIMEOUT_MS` (default `300000`)
- `PIER_WORKSPACE_ROUTE_MAP` (optional path to registry JSON)

## Local state files (`~/.pier`)

- `config.json` (bridge config)
- `bridge.pid`
- `bridge.log`
- `workspace-routes.json` (host -> workspace mapping)

## Extension settings

Stored in browser extension storage under `pierSettings` with backward-compatible migration from the legacy `terminalBrowserSettings` key.
