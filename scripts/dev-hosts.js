#!/usr/bin/env node

const { main } = require("../cli/pier-cli");

main(["legacy-dev-hosts", ...process.argv.slice(2)]).catch((error) => {
  process.stderr.write(
    `${String(error && error.message ? error.message : error)}\n`
  );
  process.exit(1);
});
