import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const required = [
  path.join(dist, "index.html"),
  path.join(dist, "__track", "pixel.gif"),
];
const forbidden = [
  path.join(dist, "dist", "index.html"),
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required build artifact: ${path.relative(root, file)}`);
  }
}

for (const file of forbidden) {
  if (fs.existsSync(file)) {
    throw new Error(`Forbidden nested build artifact exists: ${path.relative(root, file)}`);
  }
}

const assetDir = path.join(dist, "assets");
const mapFiles = fs.existsSync(assetDir)
  ? fs.readdirSync(assetDir, { recursive: true }).filter((name) => String(name).endsWith(".map"))
  : [];

if (mapFiles.length > 0) {
  throw new Error(`Source maps must not be emitted: ${mapFiles.join(", ")}`);
}

console.log("Static build artifacts verified");
