// @flow
"use strict";

const unsafe_require /*: any */ = require;
const unsafe_process /*: any */ = process;

process.title = "projector-child";

const { createWorkersFarm } = require("./lib/workers");
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

process.on("message", async ({ script, target, args }) => {
  try {
    let mod = unsafe_require(script);
    let rule = mod[target];

    if (!rule) {
      error(
        new Error(`Module "${script}" does not have target named "${target}".`)
      );
      return;
    }

    const farm = createWorkersFarm();
    const rules = Array.isArray(rule)
      ? rule.map(target => {
          if (Array.isArray(target)) {
            return target.map(t => ({ target: t, rule: mod[t] }));
          } else {
            return { target, rule: mod[target] };
          }
        })
      : [{ target, rule }];

    // Sequence
    for (rule of rules) {
      if (Array.isArray(rule)) {
        await Promise.all(
          rule.map(({ target, rule }) => runRule(farm, target, rule))
        );
      } else {
        await runRule(farm, rule.target, rule.rule);
      }
    }

    farm.end();
    close("complete", "Done!");
  } catch (err) {
    error(err);
    return;
  }
});

send("ready");
