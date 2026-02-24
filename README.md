# Pier

Pier makes local multi-app development feel like one workspace.

It combines:

- `portless` URLs (for stable `*.localhost` app names)
- a local terminal bridge server (`node-pty` + WebSocket)
- a Chrome/Chromium extension that opens real terminals inside localhost pages
- a hostname -> codebase registry so each app opens a terminal in the correct project directory

## Why Pier

Agentic/product development gets slow when you keep context-switching between:

- multiple terminal windows
- multiple browser tabs
- multiple repos and dev servers

Pier keeps each project self-contained in a single browser tab:

- your app UI
- a real shell terminal panel
- isolated browser storage/cookies via portless-backed local hostnames
- automatic workspace routing based on the current `.localhost` hostname

## Quickstart

### 1. Install prerequisites

```bash
npm install -g portless pier
```

### 2. Run first-time setup

```bash
pier setup
```

This starts the local bridge and prints:

- WebSocket URL
- Access token
- the unpacked extension path (`pier extension path`)

### 3. Load the extension (Chrome/Chromium)

- Open `chrome://extensions`
- Enable **Developer mode**
- Click **Load unpacked**
- Select the directory printed by `pier extension path`

### 4. Configure extension options

Paste the values from `pier setup` into **Pier Settings**:

- WebSocket URL (for example `ws://127.0.0.1:4570/terminal`)
- Access Token

Use **Test Bridge** to verify the local bridge is reachable.

### 5. Start an app

From your project directory:

```bash
pier myapp pnpm dev
```

Open the printed/local portless URL (for example `http://myapp.localhost:1355`) and press:

- `Ctrl+\`` (Windows/Linux)
- `Cmd+\`` (macOS)

The in-page terminal opens in the mapped project directory.

## Setup in 5 Minutes (Local Development Repo)

```bash
pnpm install
pnpm run build
pnpm run check
pnpm run test
```

Then:

```bash
npm link
pier setup
pier extension path
```

## Daily Usage

```bash
pier myapp pnpm dev
pier api.myapp pnpm dev
pier map list
pier map where myapp.localhost
pier bridge status
```

## CLI Reference (Summary)

```bash
pier <name> <cmd...>         # wraps portless, ensures bridge, maps host->cwd
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

Legacy compatibility:

```bash
npm run dev-hosts -- run myapp.localhost -- pnpm dev
```

## Security Model

- Bridge listens on local host only by default (`127.0.0.1`)
- WebSocket access requires token authentication
- Extension content script only activates on localhost-style pages
- Bridge upgrade path only accepts localhost page origins or extension origins

## Docs

- [Setup](docs/setup.md)
- [Usage](docs/usage.md)
- [Configuration](docs/configuration.md)
- [Architecture](docs/architecture.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Contributing](docs/contributing.md)
- [Release](docs/release.md)

## Branding

Pier uses the canonical logo at [`/Users/himanshumalviya/Developer/pier/extension/assets/logo.png`](/Users/himanshumalviya/Developer/pier/extension/assets/logo.png) and generates extension icons from it via `pnpm run build:icons`.
