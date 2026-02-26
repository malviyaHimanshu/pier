# Troubleshooting

## `portless` Not Found

Symptom:

- `pier` fails to start app command and mentions `portless`

Fix:

```bash
# bundled runtime should work automatically
npm install -g @malviyahimanshu/pier
```

If you need a custom binary path:

```bash
PIER_PORTLESS_BIN=/absolute/path/to/portless pier doctor
```

## Bridge Unreachable in Extension

Checks:

1. `pier bridge status`
2. `pier doctor`
3. Confirm extension WebSocket URL matches `pier setup` / `pier doctor`
4. Use **Test Bridge** in extension settings

## Token Errors / Authentication Failures

- If strict mode is enabled (`PIER_STRICT_TOKEN=1`), re-read token via `pier doctor` and paste it in extension settings
- If strict mode is disabled (default), token mismatch should no longer block connection
- Reload localhost tabs after any settings change

If you see repeated `[pier] WebSocket error` / `[pier] Disconnected`, the latest extension build now prints a direct diagnosis:

- bridge unreachable -> run `pier setup` / `pier bridge start`
- auth mismatch in strict mode -> copy token from `pier setup` / `pier doctor`

## Terminal Opens in Wrong Directory

Inspect mappings:

```bash
pier map list
pier map where myapp.localhost
```

Re-add mapping if needed:

```bash
pier map add myapp.localhost /correct/path
```

## `node-pty` / Terminal Spawn Issues

Pier falls back to `child_process` pipes when PTY initialization fails, but interactive behavior may be reduced.

Checks:

- `pier bridge logs`
- `pier doctor`
- confirm shell path in config (`bridge.shell`) is valid

## Extension Loads But Shortcut Does Nothing

- Confirm page is `localhost`, `127.0.0.1`, `::1`, or `*.localhost`
- Check extension is enabled
- Reload the page after updating extension settings

If not installed yet, install from Chrome Web Store:

- https://chromewebstore.google.com/detail/pier/gfhbagnaafeefbkjcocmpnepfggbbdpj

## Manual Extension Bundle Install Fails

Run:

```bash
pier extension install
```

If you have a local ZIP + checksum:

```bash
pier extension install --from /path/to/pier-extension-v<version>.zip
```
