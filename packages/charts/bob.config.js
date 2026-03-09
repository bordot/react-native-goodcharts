module.exports = {
  source: "src",
  output: "dist",
  targets: [
    ["commonjs", { esm: true }],
    ["module", { esm: true }],
  ],
};
