# terminal.browser

Chrome extension + local bridge server to open a real terminal on any localhost page.

## What this does

- Works only on `localhost`, `127.0.0.1`, `::1`, or `*.localhost` pages.
- Press `Control + \`` (or `Command + \``) to toggle a terminal panel in the browser.
- The terminal panel connects to a local Node server (`node-pty`) over WebSocket.
- If PTY creation fails on a machine, the server falls back to non-PTY shell pipes (reduced interactivity).
- On macOS/Linux, the server auto-fixes missing execute permission on `node-pty`'s `spawn-helper` when it starts.
- Rendering profile is configurable (font, cursor style, line height, theme presets, scrollback).
- Includes xterm addons for web links and Unicode 11 width handling.
- Default font mode is `auto`: it picks the first installed system font from `SFMono Nerd Font`, `Geist Mono`, Nerd Font fallbacks, then monospace.
- Optional WebGL renderer support is enabled by default (falls back automatically if unavailable).
- The extension bundles `SymbolsNerdFontMono-Regular.woff2` and always appends it as a symbol fallback.
- Panel resize is supported via a top drag handle (mouse/touch), keyboard (`ArrowUp/ArrowDown`, `Home/End`), and persisted height per user.

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
TERMINAL_BROWSER_TOKEN=<your_token> npm run server
```

4. Load the extension in Chrome:

- Open `chrome://extensions`
- Enable **Developer mode**
- Click **Load unpacked**
- Select this folder: `/Users/himanshumalviya/Developer/terminal.browser`

5. Open extension settings and paste the same token:

- In `chrome://extensions`, click **Details** on **Localhost Browser Terminal**
- Click **Extension options**
- Set:
  - WebSocket URL: `ws://127.0.0.1:4570/terminal`
  - Access Token: same token used in step 3

6. Visit any localhost site and press `Control + \``.

## Nerd Fonts

- Install a Nerd Font on your system (for example: `JetBrainsMono Nerd Font` or `MesloLGS NF`).
- Open extension options and set **Font Family** to your installed Nerd Font, or keep it as `auto`.
- If no Nerd Font is detected, the terminal prints a warning and falls back to standard monospace fonts.
- Bundled symbol fallback file: `extension/assets/fonts/SymbolsNerdFontMono-Regular.woff2`

## Commands

```bash
npm run server   # starts local terminal bridge
npm run token    # prints a random token
```

## Environment variables (server)

- `TERMINAL_BROWSER_TOKEN` (required in practice)
- `TERMINAL_BROWSER_HOST` (default `127.0.0.1`)
- `TERMINAL_BROWSER_PORT` (default `4570`)
- `TERMINAL_BROWSER_CWD` (default current directory)
- `TERMINAL_BROWSER_SHELL` (default current shell)
