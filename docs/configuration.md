# Configuration

## State Directory

Pier stores local state in:

- `~/.pier/config.json`
- `~/.pier/bridge.pid`
- `~/.pier/bridge.log`
- `~/.pier/workspace-routes.json` (default mapping registry)

## Config File (`~/.pier/config.json`)

Pier normalizes and maintains this file automatically.

High-level shape:

- `version`
- `createdAt`
- `updatedAt`
- `bridge.host`
- `bridge.port`
- `bridge.token`
- `bridge.defaultCwd`
- `bridge.shell`
- `bridge.workspaceRouteMapPath`

## Environment Variables (Bridge)

These are consumed by the bridge runtime:

- `PIER_HOST`
- `PIER_PORT`
- `PIER_TOKEN`
- `PIER_CWD`
- `PIER_SHELL`
- `PIER_WORKSPACE_ROUTE_MAP`
- `PIER_SESSION_DETACH_TIMEOUT_MS`

## Extension Settings (Stored in Browser Storage)

Pier stores terminal rendering + connection settings under extension storage keys.

Important compatibility note:

- Pier preserves legacy storage key migration behavior and will migrate older settings on load.
