const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const mkdirp = promisify(require("mkdirp"));
const writeFile = promisify(fs.writeFile);

module.exports = async function({ chunk, params }, callback) {
  await Promise.all(
    chunk.map(async input => {
      await mkdirp(path.dirname(input.output));
      await writeFile(input.output, input.content);
    })
  );

  callback(null, []);
};
