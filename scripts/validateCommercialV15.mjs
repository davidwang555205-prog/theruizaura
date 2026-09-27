import { build } from "esbuild";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hashPath, sha256 } from "./commercialV13Harness.mjs";

/**
 * Commercial Film V1.5 continuity/state validator.
 * This is an independent V1.5 identity. It never modifies the V1.3 or V1.4
 * history baselines and never borrows Immersive Narrative runtime code.
 */

const projectRoot = resolve(import.meta.dirname, "..");
const baselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "v1.5-continuity-baseline.json"
);
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-v15-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const legacyBaselineFiles = [
  {
    path: "src/commercial-film/visual-acceptance/canonical-baseline.json",
    sha256: "b92c7e30e302ec977f97a058e6ec3d271269d26e5aa86fa6ab964529092f384b",
  },
  {
    path: "src/commercial-film/presentation/protected-source-baseline.json",
    sha256: "017f609aa068ac280f4926eda83e2315d4e5a0a4d43ccd1da546cddb690422b7",
  },
];

const subValidations = [
  "validate:commercial-film",
  "validate:commercial-execution-compiler",
  "validate:commercial-continuity",
  "validate:commercial-state-authority",
  "validate:commercial-model-facing-take",
  "validate:commercial-creative-spine",
  "validate:commercial-creative-direction",
  "validate:commercial-director-concept",
  "validate:commercial-output-diversity",
];

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
  referenceSetId: "commercial-v15-validation-reference-set",
  taskId: "commercial-v15-validation-task",
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

try {
  const baseline = JSON.parse(await readFile(baselinePath, "utf8"));

  for (const legacy of legacyBaselineFiles) {
    assert(
      sha256(await readFile(resolve(projectRoot, legacy.path))) === legacy.sha256,
      `Legacy history baseline was modified: ${legacy.path}`
    );
  }

  const childResults = [];
  for (const script of subValidations) {
    const result = spawnSync("npm", ["run", script], {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
    });
    childResults.push({ script, exitCode: result.status ?? -1 });
    assert(
      (result.status ?? -1) === 0,
      `V1.5 sub-validation failed: ${script}\n${result.stdout}\n${result.stderr}`
    );
  }

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
  let deterministicRuns = 0;
  for (const intent of intents) {
    const request = {
      commercialIntent: intent,
      characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 自然 / 克制",
      duration: 15,
      reference,
    };
    const first = runCommercialFilmPipeline(request);
    const second = runCommercialFilmPipeline(request);
    assert(
      first.status === "GENERATED" && second.status === "GENERATED",
      `${intent} was blocked during V1.5 validation.`
    );
    assert(
      first.modelFacingScript.compiledText === second.modelFacingScript.compiledText
        && JSON.stringify(first.plan.continuity) === JSON.stringify(second.plan.continuity),
      `${intent} V1.5 output is not deterministic.`
    );
    deterministicRuns += 1;
    functionalCases.push({
      intent,
      takeCount: first.plan.continuity.takePlan.takes.length,
      continuityStatus: first.plan.continuity.status,
      conflictCount: first.plan.continuity.conflicts.length,
      worldStateTimelineSha256: sha256(first.plan.continuity.worldStateTimeline),
      continuityLockLinesSha256: sha256(first.plan.continuity.continuityLock.lines),
      compiledTextSha256: sha256(first.modelFacingScript.compiledText),
      executionValidationStatus: first.executionValidation.status,
    });
  }

  const protectedSources = [];
  for (const expected of baseline.protectedSources) {
    const current = await hashPath(projectRoot, expected.path);
    protectedSources.push({ path: expected.path, sha256: current, unchanged: current === expected.sha256 });
  }
  assert(
    protectedSources.every((source) => source.unchanged),
    "V1.5 protected generation source changed without an authorized re-freeze."
  );
  assert(
    JSON.stringify(baseline.functionalCases) === JSON.stringify(functionalCases),
    "V1.5 functional baseline diverged."
  );
  assert(
    baseline.baseMain === "28097b2",
    "V1.5 baseline base-main reference changed."
  );

  console.log("COMMERCIAL FILM V1.5 CONTINUITY / STATE VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_FILM_V1_5_CONTINUITY_STATE_EXECUTION",
    baseMain: baseline.baseMain,
    legacyV13V14Baselines: legacyBaselineFiles.map((entry) => `${entry.path}: UNCHANGED`),
    subValidations: childResults,
    functionalCases,
    protectedSources,
    deterministicRuns,
    immersiveRuntimeModified: "NO",
    creativeDirectionModified: "NO",
    directorConceptModified: "NO",
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
