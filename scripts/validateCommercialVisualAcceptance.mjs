import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-visual-acceptance-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

try {
  await writeFile(
    entryPath,
    `export { buildCommercialVisualAcceptanceMatrix, validateCommercialVisualAcceptanceMatrix } from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/visual-acceptance/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const { buildCommercialVisualAcceptanceMatrix, validateCommercialVisualAcceptanceMatrix } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const matrix = buildCommercialVisualAcceptanceMatrix();
  const result = validateCommercialVisualAcceptanceMatrix(matrix);
  if (!result.passed) throw new Error(result.failures.join(" | "));
  console.log("COMMERCIAL FILM V1.3 FINAL VISUAL ACCEPTANCE HARNESS PASS:", JSON.stringify({
    stage: "COMMERCIAL_VISUAL_ACCEPTANCE_V1_3_FINAL",
    controlContract: matrix.controlContract,
    cases: matrix.cases.length,
    directorConcepts: new Set(matrix.cases.filter((testCase) => testCase.group === "A").map((testCase) => testCase.directorConceptId)).size,
    controlIntents: new Set(matrix.cases.filter((testCase) => testCase.group === "B").map((testCase) => testCase.intent)).size,
    reviewStatuses: [...new Set(matrix.reviewResults.map((review) => review.reviewStatus))],
    finalVisualStatus: matrix.finalVisualStatus,
    caseIds: matrix.cases.map((testCase) => testCase.caseId),
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
