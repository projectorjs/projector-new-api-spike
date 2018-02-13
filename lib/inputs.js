// @flow

const fs = require("fs");
const globby = require("globby");
const readFile = require("./read-file");

async function getInputs(target, src) {
  const globs = Array.isArray(src) ? src : await src();
  globs.push("!node_modules");
  return await globby(globs);
}

function populateInputs(cache, dest, inputs) {
  return Promise.all(
    inputs.map(async input => {
      if (await cache.has(input)) {
        const inputFromCache = JSON.parse(await cache.get(input));
        return { ...inputFromCache, cache: true };
      }

      return {
        input,
        output: await dest(input),
        content: await readFile(input),
        attachments: []
      };
    })
  );
}

module.exports = { getInputs, populateInputs };
