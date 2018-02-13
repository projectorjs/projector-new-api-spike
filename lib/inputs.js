// @flow
const fs = require("fs");
const globby = require("globby");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);

async function getInputs(target, src) {
  const globs = Array.isArray(src) ? src : await src();
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
        content: await readFile(input, "utf8"),
        attachments: []
      };
    })
  );
}

module.exports = { getInputs, populateInputs };
