import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  hashCommercialTreatment,
  loadCommercialV13Api,
} from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const baselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "brand-signoff",
  "treatment-baseline.json"
);

const api = await loadCommercialV13Api(projectRoot);
const matrix = api.buildCommercialV14AcceptanceMatrix();

const baseline = {
  schemaVersion: "commercial-film/brand-signoff-treatment-baseline-v1",
  stage: "COMMERCIAL_FILM_V1_4_4_CREATIVE_ENGINE_FREEZE",
  note: "Creative treatment text surface frozen after V1.4.4 human filmability verification. The brand sign-off layer must not rewrite it.",
  cases: matrix.cases.map((testCase) => ({
    caseId: testCase.caseId,
    treatmentSha256: hashCommercialTreatment(testCase.creativeTreatment),
  })),
};

await mkdir(dirname(baselinePath), { recursive: true });
await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
console.log(`Wrote Commercial Film creative treatment baseline: ${baselinePath}`);
console.log(`Cases: ${baseline.cases.length}`);
