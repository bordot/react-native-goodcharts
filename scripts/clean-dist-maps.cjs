const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2];

if (!root) {
  throw new Error("Expected a target directory.");
}

const removeMaps = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      removeMaps(fullPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".map")) {
      fs.unlinkSync(fullPath);
    }
  }
};

if (fs.existsSync(root)) {
  removeMaps(root);
}
