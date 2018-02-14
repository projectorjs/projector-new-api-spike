// @flow

const fs = require("fs");
const FILES_CONTENT_CACHE = new Map();

module.exports = function readFile(filepath) {
  return new Promise(resolve => {
    let data = FILES_CONTENT_CACHE.get(filepath) || "";
    if (data) {
      resolve(data);
    }

    const readStream = fs.createReadStream(filepath, { encoding: "utf8" });
    readStream.on("data", chunk => (data += chunk)).on("end", () => {
      FILES_CONTENT_CACHE.set(filepath, data);
      resolve(data);
    });
  });
};
