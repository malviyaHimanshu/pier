# pier

Chrome extension + local bridge server to open a real terminal inside localhost pages.

## What this does

- Works only on `localhost`, `127.0.0.1`, `::1`, or `*.localhost` pages.
- Press `Control + \`` (or `Command + \``) on a localhost page to toggle the in-page terminal panel.
- Terminal UI is injected into the page DOM (bottom panel). Page reload recreates the UI and reconnects to the same shell session.
- The terminal panel connects to a local Node server (`node-pty`) over WebSocket.
- If PTY creation fails on a machine, the server falls back to non-PTY shell pipes (reduced interactivity).
- On macOS/Linux, the server auto-fixes missing execute permission on `node-pty`'s `spawn-helper` when it starts.
- Rendering profile is configurable (font, cursor style, line height, theme presets, scrollback).
- Includes xterm addons for web links and Unicode 11 width handling.
- Default font mode is `auto`: it picks the first installed system font from `SFMono Nerd Font`, `Geist Mono`, Nerd Font fallbacks, then monospace.
- Optional WebGL renderer support can be enabled (falls back automatically if unavailable).
- The extension bundles `SymbolsNerdFontMono-Regular.woff2` and always appends it as a symbol fallback.
- Panel resize is supported via a top drag handle (mouse/touch), keyboard (`ArrowUp/ArrowDown`, `Home/End`), and persisted height per user.
- Terminal sessions survive page refresh by reconnecting to the same shell for the current tab.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate a token:

```bash
npm run token
```

3. Start the terminal bridge server (replace the token):

```bash
PIER_TOKEN=<your_token> npm run server
```

4. Load the extension in Chrome:

- Open `chrome://extensions`
- Enable **Developer mode**
- Click **Load unpacked**
- Select this folder

5. Open extension settings and paste the same token:

- In `chrome://extensions`, click **Details** on **Pier**
- Click **Extension options**
- Set:
  - WebSocket URL: `ws://127.0.0.1:4570/terminal`
  - Access Token: same token used in step 3

6. Visit any localhost site and press `Control + \``.
7. The terminal opens as a bottom panel inside the page.

## Nerd Fonts

- Install a Nerd Font on your system (for example: `JetBrainsMono Nerd Font` or `MesloLGS NF`).
- Open extension options and set **Font Family** to your installed Nerd Font, or keep it as `auto`.
- If no Nerd Font is detected, the terminal prints a warning and falls back to standard monospace fonts.
- Bundled symbol fallback file: `extension/assets/fonts/SymbolsNerdFontMono-Regular.woff2`

## Commands

```bash
npm run server   # starts local terminal bridge
npm run token    # prints a random token
npm run dev-hosts -- ...  # legacy compatibility shim (prefer `pier`)
```

## Environment variables (server)

- `PIER_TOKEN` (required in practice)
- `PIER_HOST` (default `127.0.0.1`)
- `PIER_PORT` (default `4570`)
- `PIER_CWD` (default current directory)
- `PIER_SHELL` (default current shell)
- `PIER_SESSION_DETACH_TIMEOUT_MS` (default `300000`; keep shell alive after disconnect before cleanup)
- `PIER_WORKSPACE_ROUTE_MAP` (optional path to hostname->workspace JSON registry)

## `pier` CLI (Portless + Per-App CWD)

`pier` is a global CLI wrapper around [portless](https://github.com/vercel-labs/portless) that adds:
- stable `.localhost` URLs (via `portless`)
- automatic hostname -> codebase mapping
- auto-started terminal bridge server
- terminal CWD based on the current `.localhost` URL

### Install and test locally

#### Option 1: `npm link` (fastest dev loop)

```bash
npm link
```

Then from any codebase:

```bash
pier myapp pnpm dev
```

#### Option 2: `npm pack` (test publish artifact)

```bash
npm pack
npm i -g ./pier-1.0.0.tgz
```

Then from any codebase:

```bash
pier myapp pnpm dev
```

### First-time setup

Install `portless` first:

```bash
npm install -g portless
```

Initialize the `pier` config and start the local terminal bridge:

```bash
pier setup
```

`pier setup` prints the WebSocket URL and token to paste into the extension options.

### Daily usage

From any project directory:

```bash
pier myapp pnpm dev
```

This automatically:
- ensures the terminal bridge server is running
- stores `myapp.localhost -> <current working directory>` in `~/.pier/workspace-routes.json`
- runs `portless myapp pnpm dev`

Open `http://myapp.localhost:1355`, then press `Ctrl+\`` / `Cmd+\``.
The terminal opens in that project directory.

### CLI commands

```bash
pier <name> <cmd...>         # main DX path (wraps portless + maps cwd)
pier map list
pier map add api.myapp.localhost /absolute/path/to/api
pier map where api.myapp.localhost
pier map remove api.myapp.localhost
pier bridge start
pier bridge stop
pier bridge status
pier doctor
pier setup
```

### Legacy compatibility

The old helper still works, but it now delegates to `pier`:

```bash
npm run dev-hosts -- run myapp.localhost -- pnpm dev
```
