# Pier

Pier is a developer tool that embeds a real terminal inside your localhost app pages.

It is built for fast parallel product development with `portless`: each project can live in its own `*.localhost` tab with isolated browser storage, while Pier opens a terminal panel in the correct repo directory for that page.

## What Pier Solves

When you are building multiple apps/agents in parallel, context switching gets expensive:

- too many terminal windows
- too many browser tabs
- too many repos/dev servers

Pier keeps each project self-contained in one browser tab:

- app UI
- in-page shell terminal (xterm.js + local bridge)
- isolated cookies/localStorage via `portless`
- automatic hostname -> codebase routing

## How It Works (High Level)

1. `pier <name> <cmd...>` wraps `portless` and records `<name>.localhost -> cwd`
2. Pier ensures a local terminal bridge server is running
3. The Chrome/Chromium extension activates on localhost pages
4. The content script opens a WebSocket to the bridge
5. The bridge resolves the page hostname to the mapped repo path
6. A shell session is created/reused and streamed into the page terminal panel

## Quickstart (Published Package)

### Prerequisites

- Node.js 20+
- Chrome or Chromium (MV3 support)
- `portless`

Install:

```bash
npm install -g portless @malviyahimanshu/pier
```

### First-Time Setup

```bash
pier setup
```

This starts the local bridge and prints:

- WebSocket URL
- access token
- next steps

### Load the Extension

```bash
pier extension path
```

Then in Chrome/Chromium:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the directory printed by `pier extension path`

### Configure the Extension

Open **Pier Settings** and paste:

- WebSocket URL (for example `ws://127.0.0.1:4570/terminal`)
- Access Token

Use **Test Bridge** to verify connectivity.

### Start an App

From your project directory:

```bash
pier myapp pnpm dev
```

Open the `portless` URL (for example `http://myapp.localhost:1355`) and press:

- `Ctrl+\`` on macOS
- `Ctrl+\`` on Windows/Linux

## Daily Commands

```bash
pier myapp pnpm dev
pier api.myapp pnpm dev
pier map list
pier map where myapp.localhost
pier bridge status
pier doctor
```

## CLI Reference (Summary)

```bash
pier <name> <cmd...>         # wraps portless, ensures bridge, maps host -> cwd
pier map list
pier map add <host.localhost> [cwd]
pier map remove <host.localhost>
pier map where <host.localhost>
pier bridge start [--foreground]
pier bridge stop
pier bridge status
pier bridge logs
pier extension path
pier doctor
pier setup
```

## Security Model

- Bridge listens on localhost by default (`127.0.0.1`)
- WebSocket access requires token authentication
- Extension only activates on localhost-style pages
- Bridge upgrade requests only allow localhost origins and extension origins

## Local Development (Contributors)

```bash
pnpm install
pnpm run build
pnpm run check
```

Key points:

- Authored extension code lives in `packages/extension-src`
- `extension/` is generated build output (ignored in git)
- Node packages compile to `packages/*/dist`

### Local Loop

```bash
pnpm run build:extension --watch
pnpm run typecheck
pnpm run test:unit
pnpm run test:smoke
```

## Repo Layout

- `packages/shared` - shared validation, protocol, terminal settings
- `packages/cli-core` - CLI implementation and workspace routing registry
- `packages/bridge-core` - local WebSocket + terminal bridge server
- `packages/extension-src` - extension source (TS/TSX + static assets)
- `extension/` - generated unpacked extension assets
- `cli/`, `server/`, `bin/` - compatibility shims
- `docs/` - user and contributor documentation

## Docs

- [Setup](docs/setup.md)
- [Usage](docs/usage.md)
- [Configuration](docs/configuration.md)
- [Architecture](docs/architecture.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](docs/contributing.md)
- [Release](docs/release.md)

## Version / Support Matrix

- Node.js: `>=20`
- Package manager for development: `pnpm 10+`
- Browser: Chrome / Chromium (Manifest V3)

## License

ISC
