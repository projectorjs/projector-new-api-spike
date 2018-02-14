// @flow

module.exports = function createPerfMark(name) {
  const start = process.hrtime();
  return {
    since() {
      const diff = process.hrtime(start);
      return (diff[0] * 1e9 + diff[1]) / 1e6;
    },
    printSince() {
      return `[task]: ${name}: ${this.since()} ms.`;
    }
  };
};
