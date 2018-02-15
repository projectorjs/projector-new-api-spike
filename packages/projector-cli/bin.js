#!/usr/bin/env node
// @flow
"use strict";

const meow = require("meow");
const path = require("path");
const resolveFrom = require("resolve-from");
const projector = require("projector");

const cli = meow(`
  Usage
    $ projector [path/to/script] [target] <...opts>

  Example
    $ projector ./projector.js build --foo 42
`);

let { input, flags } = cli;
let [projectorFile, projectorTarget] = input;

if (input.length === 0) {
  cli.showHelp();
} else if (input.length === 1) {
  projectorTarget = projectorFile;
  projectorFile = "./projector.js";
}

let generator = resolveFrom(process.cwd(), projectorFile);
let start = process.hrtime();

projector(generator, projectorTarget, [flags])
  .then(result => {
    let diff = process.hrtime(start);
    reporter.onDone(projectorTarget, (diff[0] * 1e9 + diff[1]) / 1e6);
    process.exit(0);
  })
  .catch(err => {
    reporter.onFail(projectorTarget, err);
    process.exit(1);
  });
