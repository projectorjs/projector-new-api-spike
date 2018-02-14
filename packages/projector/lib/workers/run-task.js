// @flow

const { promisify } = require("util");
const resolve = promisify(require("resolve"));
const TASKS_CACHE = new Map();

const getTaskCacheKey = ({ task, params }) =>
  `${task}:${JSON.stringify(params || {})}`;

module.exports = async function runTasks({ chunk, params }, callback) {
  let task = TASKS_CACHE.get(getTaskCacheKey(params));

  if (!task) {
    task = require(await resolve(params.task, { basedir: process.cwd() }))(
      params.params
    );
    TASKS_CACHE.set(getTaskCacheKey(params), task);
  }

  const result = await Promise.all(chunk.map(task));

  callback(null, result);
};
