import { access, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { hashPath } from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const baselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "presentation",
  "protected-source-baseline.json"
);
const protectedSourcePaths = [
  "src/commercial-film/director-concept",
  "src/commercial-film/event-spine",
  "src/commercial-film/creative-spine",
  "src/commercial-film/creative-direction",
  "src/commercial-film/catalog.ts",
  "src/commercial-film/planner.ts",
  "src/commercial-film/pipeline.ts",
  "src/commercial-film/camera.ts",
  "src/commercial-film/sound.ts",
  "src/commercial-film/product-message.ts",
  "src/commercial-film/reference.ts",
  "src/commercial-film/commercial-actions.ts",
  "src/commercial-film/execution-compiler.ts",
  "src/commercial-film/qc.ts",
  "src/commercial-film/types.ts",
  "src/data/personActionLibrary.ts",
  "src/immersive-narrative",
];

if (!process.argv.includes("--force")) {
  try {
    await access(baselinePath);
    throw new Error("The presentation protected-source baseline already exists. Use --force only after an authorized change.");
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("ENOENT")) throw error;
  }
}

const sources = [];
for (const relativePath of protectedSourcePaths) {
  sources.push({
    path: relativePath,
    sha256: await hashPath(projectRoot, relativePath),
  });
}

const baseline = {
  schemaVersion: "commercial-film/final-script-presentation-protected-source-v1.3",
  stage: "COMMERCIAL_FILM_V1.3_FINAL_SCRIPT_PRESENTATION_PROTECTED_SOURCE_BASELINE",
  hashAlgorithm: "sha256",
  sources,
};

await mkdir(dirname(baselinePath), { recursive: true });
await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
console.log("Created Commercial Film final-script presentation protected-source baseline:", baselinePath);
