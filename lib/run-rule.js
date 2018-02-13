// @flow

const createCache = require("cachef");
const { getInputs, populateInputs } = require("./inputs");
const { createWorkersFarm } = require("./workers");

const output = async (outputFarm, cache, inputs) => {
  await outputFarm(inputs);
  await Promise.all(
    inputs.map(input => cache.set(input.input, JSON.stringify(input)))
  );
};

const splitInputs = inputs =>
  inputs.reduce(
    (acc, input) => {
      if (input.cache) {
        acc[0].push(input);
      } else {
        acc[1].push(input);
      }

      return acc;
    },
    [[], []]
  );

async function runTasks(farm, tasks, inputs) {
  let results = inputs;

  for (let i = 0; i < tasks.length; i++) {
    results = await farm(tasks[i], results);
  }

  return results;
}

module.exports = async function runRule(target, rule) {
  console.log(`Running ${target}`);
  const farm = createWorkersFarm();

  // TODO: replace with a proper cache implementation
  const cache = await createCache({
    prefix: target,
    dir: ".cache"
  });

  const [cachedInputs, changedInputs] = splitInputs(
    await populateInputs(cache, rule.dest, await getInputs(target, rule.src))
  );

  console.log(`Inputs: `);
  console.log("Cached: ", cachedInputs.length);
  console.log("Changed: ", changedInputs.length);

  await Promise.all([
    await output(farm.output, cache, cachedInputs),
    await output(
      farm.output,
      cache,
      await runTasks(farm.runTask, rule.tasks, changedInputs)
    )
  ]);

  farm.end();
};
