// @flow

module.exports = async function runTasks(farm, tasks, inputs) {
  let results = inputs;

  for (let i = 0; i < tasks.length; i++) {
    results = await farm(tasks[i], results);
  }

  return results;
};
