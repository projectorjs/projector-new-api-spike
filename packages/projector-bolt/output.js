const path = require("path");
const bolt = require("bolt");

module.exports = ({ dest, relativeTo = "" }) => {
  const wsPromise = bolt.getWorkspaces();

  return async input => {
    const ws = (await wsPromise).map(({ dir }) =>
      path.relative(process.cwd(), dir)
    );
    const dir = ws.find(dir => input.startsWith(dir + path.sep));
    return path.join(dir, dest, input.replace(path.join(dir, relativeTo), ""));
  };
};
