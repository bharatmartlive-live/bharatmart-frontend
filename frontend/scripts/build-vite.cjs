const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const candidates = [
  join(__dirname, "..", "node_modules", "vite", "bin", "vite.js"),
  join(__dirname, "..", "..", "node_modules", "vite", "bin", "vite.js"),
];

const viteBin = candidates.find((candidate) => existsSync(candidate));

if (!viteBin) {
  console.error("Could not find Vite. Run npm install before building.");
  process.exit(1);
}

const result = spawnSync(process.execPath, [viteBin, "build"], {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
