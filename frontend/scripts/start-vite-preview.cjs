const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawn } = require("node:child_process");

const candidates = [
  join(__dirname, "..", "node_modules", "vite", "bin", "vite.js"),
  join(__dirname, "..", "..", "node_modules", "vite", "bin", "vite.js"),
];

const viteBin = candidates.find((candidate) => existsSync(candidate));

if (!viteBin) {
  console.error("Could not find Vite. Run npm install before starting.");
  process.exit(1);
}

const port = process.env.PORT || "4173";

const child = spawn(
  process.execPath,
  [viteBin, "preview", "--host", "0.0.0.0", "--port", String(port)],
  {
    cwd: join(__dirname, ".."),
    stdio: "inherit",
    env: process.env,
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("Failed to start preview server:", error.message);
  process.exit(1);
});
