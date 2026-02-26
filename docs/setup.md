# Setup

## Install (Published Package)

```bash
npm install -g @malviyahimanshu/pier
```

## Initialize Pier

```bash
pier setup
```

`pier setup` will:

- create `~/.pier/config.json` (if missing)
- start the local bridge server
- start the Portless proxy in background
- print the WebSocket URL and token for the extension (strict mode)

Optional flags:

- `pier setup --https` to start Portless proxy in HTTPS mode
- `pier setup --manual-extension` to also download/cache the unpacked extension bundle

## Install the Extension (Recommended)

Install from Chrome Web Store:

- https://chromewebstore.google.com/detail/pier/gfhbagnaafeefbkjcocmpnepfggbbdpj
- or print the link with `pier extension url`

## Manual Unpacked Extension (Optional)

1. Run:

```bash
pier extension install
pier extension path
```

2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked**
5. Select the printed directory

## Configure Extension Settings

Open **Pier Settings** and paste:

- WebSocket URL
- Access Token (only required when strict token mode is enabled)

Use **Test Bridge** before opening localhost pages.

## Optional: Strict Token Auth

By default, Pier accepts the legacy default extension token (`change-me`) for smoother first-run DX.

To require an exact token match:

```bash
PIER_STRICT_TOKEN=1 pier setup
```

## First-Run Validation

1. `pier bridge status` should report `running`
2. Start an app: `pier myapp pnpm dev`
3. Open `http://myapp.localhost:<port>`
4. Press `Ctrl+\`` on macOS or `Ctrl+\`` on Windows/Linux
5. Confirm the terminal opens in the correct project directory
