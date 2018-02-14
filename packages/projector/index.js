// @flow
"use strict";

const path = require("path");
const child = require("child_process");

const CHILD_SCRIPT = path.join(__dirname, "child.js");

/*::
type Serializeable =
  | null
  | number
  | boolean
  | string
  | Array<Serializeable>
  | { [key: string]: Serializeable };

type Projector =
  & ((script: string, args?: Array<Serializeable>) => Promise<Serializeable>)
  & ((script: string, target?: string, args?: Array<Serializeable>) => Promise<Serializeable>);
*/

function projector(script, target, args) {
  if (arguments.length === 1) {
    target = "default";
    args = [];
  } else if (arguments.length === 2) {
    if (typeof target === "object") {
      args = target;
      target = "default";
    } else {
      args = [];
    }
  } else if (typeof target === "undefined") {
    target = "default";
  }

  if (typeof script !== "string") {
    throw new Error("Projector script must be a string");
  }

  if (typeof target !== "string") {
    throw new Error("Projector target must be a string");
  }

  if (!Array.isArray(args)) {
    throw new Error("Projector `args` must be an array");
  }

  return new Promise((resolve, reject) => {
    let proc = child.fork(CHILD_SCRIPT, {
      silent: false
    });

    proc.on("message", ({ status, payload }) => {
      if (status === "ready") {
        proc.send({ script, target, args });
      } else if (status === "complete") {
        resolve(payload);
      } else if (status === "error") {
        let err = new Error(payload.message);
        err.stack = payload.stack;
        reject(err);
      } else {
        reject(new Error("Recieved unknown message from child process."));
      }
    });

    proc.on("close", () => {
      reject(new Error("Never recieved a response from child process."));
    });
  });
}

// prettier-ignore
module.exports = (projector /*: Projector */);
