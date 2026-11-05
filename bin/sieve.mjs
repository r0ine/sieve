#!/usr/bin/env node
// SPDX-License-Identifier: PolyForm-Small-Business-1.0.0

const cli = await import('../src/cli.mjs');
process.exitCode = await cli.main(process.argv.slice(2));
