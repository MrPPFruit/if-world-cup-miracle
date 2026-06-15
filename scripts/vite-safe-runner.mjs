import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = process.cwd();
const projectHash = createHash("sha256").update(projectRoot).digest("hex").slice(0, 10);
const mirrorRoot = join("/tmp", `ifwc-vite-${projectHash}`);
const command = process.argv[2] || "dev";
const forwardedArgs = process.argv.slice(3);

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, {
    cwd: options.cwd || projectRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
};

const syncSource = () => {
  mkdirSync(mirrorRoot, { recursive: true });
  run("rsync", [
    "-a",
    "--delete",
    "--exclude",
    "node_modules",
    "--exclude",
    "dist",
    "--exclude",
    ".git",
    `${projectRoot}/`,
    `${mirrorRoot}/`,
  ]);
};

const ensureDependencies = () => {
  const lockPath = join(projectRoot, "package-lock.json");
  const lockHash = existsSync(lockPath)
    ? createHash("sha256").update(readFileSync(lockPath)).digest("hex")
    : "no-lock";
  const hashPath = join(mirrorRoot, ".ifwc-package-lock.hash");

  if (existsSync(join(mirrorRoot, "node_modules")) && existsSync(hashPath)) {
    const cachedHash = readFileSync(hashPath, "utf8").trim();
    if (cachedHash === lockHash) {
      return;
    }
  }

  run("npm", ["install"], { cwd: mirrorRoot });
  writeFileSync(hashPath, `${lockHash}\n`);
};

const syncDistBack = () => {
  if (!existsSync(join(mirrorRoot, "dist"))) {
    return;
  }

  run("rsync", ["-a", "--delete", `${join(mirrorRoot, "dist")}/`, `${join(projectRoot, "dist")}/`]);
};

const viteBin = join(mirrorRoot, "node_modules", "vite", "bin", "vite.js");

syncSource();
ensureDependencies();

if (command === "build") {
  run("node", [viteBin, "build", ...forwardedArgs], { cwd: mirrorRoot });
  syncDistBack();
} else if (command === "preview") {
  run("node", [viteBin, "preview", "--host", "127.0.0.1", ...forwardedArgs], { cwd: mirrorRoot });
} else if (command === "dev") {
  run("node", [viteBin, "--host", "127.0.0.1", ...forwardedArgs], { cwd: mirrorRoot });
} else {
  console.error(`Unknown Vite runner command: ${command}`);
  process.exit(1);
}
