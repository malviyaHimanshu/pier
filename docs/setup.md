# Setup

## Install (published package)

```bash
npm install -g portless pier
```

## Initialize bridge and token

```bash
pier setup
```

`pier setup` prints:

- WebSocket URL
- token
- next steps

## Find the extension folder

```bash
pier extension path
```

Load that folder via `chrome://extensions` -> **Load unpacked**.

## Configure extension options

Open **Pier Settings** and paste:

- WebSocket URL
- Access Token

Use **Test Bridge** to confirm the local bridge is reachable before opening localhost pages.

## First-run validation

1. Run `pier bridge status` and confirm `running`.
2. Start an app with `pier myapp pnpm dev`.
3. Open `http://myapp.localhost:<port>`.
4. Press `Ctrl+\`` / `Cmd+\`` and confirm the terminal opens in the correct project directory.
