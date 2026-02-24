# Usage

## Start a mapped app

From the project directory:

```bash
pier myapp pnpm dev
```

Pier will:

- ensure the bridge is running
- map `myapp.localhost` to the current working directory
- run `portless myapp pnpm dev`

## Multiple apps in parallel

Run each app in its own repo directory:

```bash
pier api.myapp pnpm dev
pier web.myapp pnpm dev
pier admin.myapp pnpm dev
```

Each `.localhost` hostname gets its own workspace mapping, so the in-page terminal opens in the right repo.

## Manage workspace route mappings

```bash
pier map list
pier map add api.myapp.localhost /absolute/path/to/api
pier map where api.myapp.localhost
pier map remove api.myapp.localhost
```
