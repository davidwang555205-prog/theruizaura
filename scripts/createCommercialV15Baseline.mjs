import { build } from "esbuild";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hashPath, sha256 } from "./commercialV13Harness.mjs";

/**
 * Creates the independent Commercial Film V1.5 continuity/state baseline.
 * It intentionally does not read or write any V1.3 / V1.4 history baseline.
 */

const projectRoot = resolve(import.meta.dirname, "..");
const baselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "v1.5-continuity-baseline.json"
);
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-v15-baseline-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const coverage = [
  "silhouette",
  "toe_structure",
  "side_panel_structure",
  "heel_structure",
  "outsole_profile",
  "color_blocking",
  "material_evidence",
];

const reference = {
  referenceSetId: "commercial-v15-baseline-reference-set",
  taskId: "commercial-v15-baseline-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 2,
  confirmedAssetIds: ["asset-front", "asset-side"],
  coverage,
  missingCoverage: [],
  referencePlanReady: true,
  productTruthMode: "reference_bound",
  productTruth: {
    coverage,
    status: "draft",
    referenceEvidenceBound: true,
    productTruthMode: "reference_bound",
  },
};

const intents = [
  "URBAN_MOTION",
  "DAILY_STYLING",
  "QUIET_LUXURY",
  "PRODUCT_CRAFT",
  "NEW_ARRIVAL",
];

const protectedSourcePaths = [
  "src/commercial-film/event-spine",
  "src/commercial-film/planner.ts",
  "src/commercial-film/qc.ts",
  "src/commercial-film/camera.ts",
  "src/commercial-film/execution-compiler.ts",
  "src/commercial-film/types.ts",
  "src/immersive-narrative",
  "src/data/personActionLibrary.ts",
];

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/commercial-film/index.ts"))};\n`
  );
  await build({
    entryPoints: [entryPath],
    bundle: true,
    format: "esm",
    platform: "node",
    outfile: bundlePath,
    logLevel: "silent",
  });
  const { runCommercialFilmPipeline } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const functionalCases = [];
  for (const intent of intents) {
    const request = {
      commercialIntent: intent,
      characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 自然 / 克制",
      duration: 15,
      reference,
    };
    const outcome = runCommercialFilmPipeline(request);
    if (outcome.status !== "GENERATED") {
      throw new Error(`${intent} could not generate a V1.5 continuity baseline: ${outcome.diagnostics.join(" | ")}`);
    }
    functionalCases.push({
      intent,
      takeCount: outcome.plan.continuity.takePlan.takes.length,
      continuityStatus: outcome.plan.continuity.status,
      conflictCount: outcome.plan.continuity.conflicts.length,
      worldStateTimelineSha256: sha256(outcome.plan.continuity.worldStateTimeline),
      continuityLockLinesSha256: sha256(outcome.plan.continuity.continuityLock.lines),
      compiledTextSha256: sha256(outcome.modelFacingScript.compiledText),
      executionValidationStatus: outcome.executionValidation.status,
    });
  }

  const protectedSources = [];
  for (const relativePath of protectedSourcePaths) {
    protectedSources.push({
      path: relativePath,
      sha256: await hashPath(projectRoot, relativePath),
    });
  }

  const baseline = {
    schemaVersion: "commercial-film/v1.5-continuity-baseline-v1",
    stage: "COMMERCIAL_FILM_V1_5_CONTINUITY_STATE_EXECUTION",
    hashAlgorithm: "sha256",
    baseMain: "28097b2",
    protectedSources,
    functionalCases,
  };

  await mkdir(dirname(baselinePath), { recursive: true });
  await writeFile(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log("Created Commercial Film V1.5 continuity baseline:", baselinePath);
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
