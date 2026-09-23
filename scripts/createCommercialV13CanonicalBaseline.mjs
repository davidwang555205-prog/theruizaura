import { access, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  computeCommercialV13Baseline,
  loadCommercialV13Api,
} from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const baselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "visual-acceptance",
  "canonical-baseline.json"
);

if (!process.argv.includes("--force")) {
  try {
    await access(baselinePath);
    throw new Error("The V1.3 canonical baseline already exists. Use --force only after an authorized reset.");
  } catch (error) {
    if (error instanceof Error && !error.message.startsWith("ENOENT")) throw error;
  }
}

const api = await loadCommercialV13Api(projectRoot);
const matrix = api.buildCommercialVisualAcceptanceMatrix();
const baseline = await computeCommercialV13Baseline(projectRoot, matrix, api);
await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
console.log("Created Commercial Film V1.3 canonical baseline:", baselinePath);
