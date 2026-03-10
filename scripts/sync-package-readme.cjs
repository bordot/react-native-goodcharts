const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const source = path.join(root, "README.md");
const target = path.join(root, "packages", "charts", "README.md");

fs.copyFileSync(source, target);
console.log(`Synced ${path.relative(root, target)} from README.md`);
