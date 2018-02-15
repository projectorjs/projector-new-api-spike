// @flow

const createCache = require("cachef");
const resolveFrom = require("resolve-from");
const { getInputs, populateInputs } = require("./inputs");
const createPerfMark = require("./perf");

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

module.exports = async function runRule(farm, target, rule) {
  console.log(`Running ${target}`);
  const totalTime = createPerfMark("Rule total");
  const cacheTime = createPerfMark("Cache");
  const dest = require(resolveFrom(process.cwd(), rule.dest.dest))(
    rule.dest.params
  );

  // TODO: replace with a proper cache implementation
  const cache = await createCache({
    prefix: target,
    dir: ".cache"
  });
  console.log(cacheTime.printSince());

  const inputsTime = createPerfMark("Inputs");
  const [cachedInputs, changedInputs] = splitInputs(
    await populateInputs(cache, dest, await getInputs(target, rule.src))
  );
  console.log(inputsTime.printSince());

  const tasksTime = createPerfMark("Tasks");
  await Promise.all([
    await output(farm.output, cache, cachedInputs),
    await output(
      farm.output,
      cache,
      await runTasks(farm.runTask, rule.tasks, changedInputs)
    )
  ]);

  console.log(tasksTime.printSince());
  console.log(totalTime.printSince());
  console.log("------------------------");
  console.log();
};
