# Usage

## Start an App with Portless + Pier Mapping

From the project directory you want the terminal to use:

```bash
pier myapp pnpm dev
```

This will:

- register `myapp.localhost -> current cwd`
- ensure the Pier bridge is running
- run Portless with the mapped app name

## Multiple Apps in Parallel

```bash
pier web pnpm dev
pier api pnpm dev
pier admin pnpm dev
```

Each app gets:

- its own `*.localhost` hostname
- separate browser storage isolation (via portless)
- a Pier terminal rooted in the mapped repo directory

## Mapping Commands

```bash
pier map list
pier map add docs.localhost /path/to/docs-repo
pier map remove docs.localhost
pier map where docs.localhost
```

## Bridge Commands

```bash
pier bridge start
pier bridge start --foreground
pier bridge stop
pier bridge status
pier bridge logs
```

## Diagnostics

```bash
pier doctor
pier extension url
pier extension install
```

`pier doctor` prints bridge state, config paths, and extension connection values.
