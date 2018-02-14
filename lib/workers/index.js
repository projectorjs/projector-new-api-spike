const { promisify } = require("util");
const workerFarm = require("worker-farm");

function chunkArray(array, itemsInChunk) {
  const chunkedArray = [];
  let index = 0;
  while (index < array.length) {
    const chunk = array.slice(index, index + itemsInChunk);
    chunkedArray.push(chunk);
    index += itemsInChunk;
  }
  return chunkedArray;
}

function createWorkersFarm() {
  const workers = workerFarm(require.resolve("./worker"), [
    "output",
    "runTask"
  ]);

  return {
    async output(inputs) {
      return await processArray(promisify(workers.output), inputs);
    },

    async runTask(task, inputs) {
      return await processArray(promisify(workers.runTask), inputs, task);
    },

    end() {
      workerFarm.end(workers);
    }
  };
}

async function processArray(farm, array, params, itemsInChunk = 50) {
  const chunkedArray = chunkArray(array, itemsInChunk);
  const results = await Promise.all(
    chunkedArray.map(chunk => farm({ chunk, params }))
  );
  return results.reduce((acc, chunk) => acc.concat(chunk), []);
}

module.exports = {
  createWorkersFarm,
  processArray
};
