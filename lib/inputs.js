// @flow

const fs = require("fs");
const globby = require("globby");
const readFile = require("./read-file");
const createPerfMark = require("./perf");

async function getInputs(target, src) {
  const totalTime = createPerfMark("Get inputs (globby)");
  const globs = Array.isArray(src) ? src : await src();
  const results = await globby(globs);
  console.log(totalTime.printSince());
  return results;
}

async function populateInputs(cache, dest, inputs) {
  const totalTime = createPerfMark("Populate inputs");
  const results = await Promise.all(
    inputs.map(async input => {
      if (await cache.has(input)) {
        const inputFromCache = JSON.parse(await cache.get(input));
        return { ...inputFromCache, cache: true };
      }

      const content = await readFile(input);
      const output = await dest(input);

      return {
        input,
        output,
        content,
        attachments: []
      };
    })
  );

  console.log(totalTime.printSince());
  return results;
}

module.exports = { getInputs, populateInputs };
