const TASKS_CACHE = new Map();

const getOptsHash = opts =>
  Object.keys(opts).reduce(
    (acc, key) => `${acc};${key}:${String(opts[key])}`,
    ""
  );

const getTaskCacheKey = ({ task, params }) =>
  `${task}:${getOptsHash(params || {})}`;

module.exports = async function runTasks({ chunk, params }, callback) {
  let task = TASKS_CACHE.get(getTaskCacheKey(params));

  if (!task) {
    task = require(params.task)(params.params);
    TASKS_CACHE.set(getTaskCacheKey(params), task);
  }

  const result = await Promise.all(chunk.map(task));

  callback(null, result);
};
