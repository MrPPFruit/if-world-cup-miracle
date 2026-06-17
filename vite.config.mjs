import { rmSync } from "node:fs";
import { resolve } from "node:path";

function pruneProductionOnlyAssets() {
  const distRoot = resolve("dist");
  const removablePaths = [
    "home-reference.png",
    "home-hero.png",
    "figma-attribute-reference.html",
    "assets/audio/brazil-football-carnival-samba.mp3",
    "assets/characters",
    "assets/refs",
  ];

  return {
    name: "prune-production-only-assets",
    closeBundle() {
      for (const item of removablePaths) {
        rmSync(resolve(distRoot, item), { recursive: true, force: true });
      }
    },
  };
}

export default {
  plugins: [pruneProductionOnlyAssets()],
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  build: {
    sourcemap: false,
  },
};
