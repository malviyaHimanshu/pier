#!/usr/bin/env node

const { main } = require("../cli/pier-cli");

main().catch((error) => {
  process.stderr.write(`${String(error && error.message ? error.message : error)}\n`);
  process.exit(1);
});
