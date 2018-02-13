// @flow
"use strict";

const unsafe_require /*: any */ = require;
const unsafe_process /*: any */ = process;

process.title = "projector-child";

const runRule = require("./lib/run-rule");

if (typeof process.send !== "function") {
  throw new Error("Must execute with an IPC channel, i.e. process.fork()");
}

function send(status, payload) {
  unsafe_process.send({ status, payload });
}

function close(status, payload) {
  send(status, payload);
  unsafe_process.disconnect();
}

function error(err) {
  close("error", {
    message: err.message,
    stack: err.stack
  });
}

process.on("message", ({ script, target, args }) => {
  try {
    let mod = unsafe_require(script);
    let rule = mod[target];

    if (!rule) {
      error(
        new Error(`Module "${script}" does not have target named "${target}".`)
      );
      return;
    }

    runRule(target, rule)
      .then(() => close("complete", "Done!"))
      .catch(e => error(e));
  } catch (err) {
    error(err);
    return;
  }
});

send("ready");
