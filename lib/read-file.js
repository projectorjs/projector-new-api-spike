// @flow

const fs = require("fs");

module.exports = function readFile(filepath) {
  return new Promise(resolve => {
    let data = "";
    const readStream = fs.createReadStream(filepath, { encoding: "utf8" });
    readStream
      .on("data", chunk => (data += chunk))
      .on("end", () => resolve(data));
  });
};
