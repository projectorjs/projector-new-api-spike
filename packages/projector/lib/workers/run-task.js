// @flow

const resolveFrom = require("resolve-from");
const TASKS_CACHE = new Map();

const getTaskCacheKey = ({ task, params }) =>
  `${task}:${JSON.stringify(params || {})}`;

module.exports = async function runTasks({ chunk, params }, callback) {
  let task = TASKS_CACHE.get(getTaskCacheKey(params));

  if (!task) {
    task = require(resolveFrom(process.cwd(), params.task))(params.params);
    TASKS_CACHE.set(getTaskCacheKey(params), task);
  }

  const result = await Promise.all(chunk.map(task));

  callback(null, result);
};
