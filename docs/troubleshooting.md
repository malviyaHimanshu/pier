# Troubleshooting

## `portless` not found

Install it globally:

```bash
npm install -g portless
```

## Bridge unreachable in extension settings

- Run `pier bridge status`
- Run `pier bridge start`
- Confirm the WebSocket URL uses the same host/port as the bridge status output

## Token mismatch / unauthorized WebSocket

- Re-run `pier setup` or inspect `pier doctor`
- Copy the exact token into Pier Settings

## PTY unavailable / fallback mode message

Pier will fall back to `child_process` pipes when PTY creation fails. Interactive behavior may be reduced.

## Terminal opens in wrong directory

Check mappings:

```bash
pier map list
pier map where <host.localhost>
```
