import { access, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { join, resolve } from "node:path";
import {
  computeCommercialV13Baseline,
  loadCommercialV13Api,
  readCommercialV13HumanAcceptanceDisplay,
  readJson,
  validateReviewCollection,
} from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "artifacts", "commercial-film", "v1.3-final");
const baselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "visual-acceptance",
  "canonical-baseline.json"
);
const expectedFailureCodes = [
  "CONCEPT_NOT_VISIBLE",
  "CONCEPT_TOO_WEAK",
  "CONCEPT_ONE_SHOT_ONLY",
  "CONCEPT_EXECUTION_COLLAPSE",
  "CINEMATIC_DEVICE_NOT_VISIBLE",
  "CINEMATIC_DEVICE_ONE_SHOT_ONLY",
  "CINEMATIC_DEVICE_MECHANICAL",
  "CAMERA_INSTRUCTION_IGNORED",
  "CAMERA_OVER_EXECUTED",
  "TRANSITION_INSTRUCTION_IGNORED",
  "INTENT_OVERRIDDEN_BY_CONCEPT",
  "CROSS_CONCEPT_VISUAL_COLLAPSE",
  "PRODUCT_VISUAL_DISCONNECT",
  "PRODUCT_TOO_DOMINANT",
  "PRODUCT_TOO_WEAK",
  "WORLD_REALISM_COLLAPSE",
  "BACKGROUND_ACTIVITY_COLLAPSE",
  "ENDING_NOT_EXECUTED",
  "SEEDANCE_OVER_INTERPRETATION",
  "SEEDANCE_UNDER_INTERPRETATION",
  "CHARACTER_CONTINUITY_FAILURE",
  "PRODUCT_CONTINUITY_FAILURE",
];

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}.`);
  }
}

async function requireFile(path) {
  try {
    await access(path);
  } catch {
    throw new Error(`Required final artifact is missing: ${path}`);
  }
}

function visualStatusLabel(status) {
  if (status === "PRODUCTION_VERIFIED") return "VERIFIED";
  if (status === "FAIL") return "FAIL";
  if (status === "INCONCLUSIVE") return "INCONCLUSIVE";
  return "NOT VERIFIED";
}

function assertNoCaseLeakage(caseText) {
  const forbidden = [
    "QUIET_LUXURY",
    "URBAN_MOTION",
    "DAILY_STYLING",
    "PRODUCT_CRAFT",
    "NEW_ARRIVAL",
    "STATIC_CAMERA_FILM",
    "PARTIAL_OBSCURATION",
    "EDGE_OF_FRAME",
    "THRESHOLD_CHAIN",
    "REFLECTION_WORLD",
    "LIGHT_REVEAL",
    "WORLD_MOVES_SUBJECT_SETTLES",
    "REPEATED_GESTURE",
    "[COMMERCIAL PLAN]",
    "[SHOT PLAN]",
    "[CAMERA PLAN]",
    "[SOUND PLAN]",
    "[REFERENCE STATE]",
  ];
  return forbidden.filter((token) => caseText.includes(token));
}

try {
  const api = await loadCommercialV13Api(projectRoot);
  const matrix = api.buildCommercialVisualAcceptanceMatrix();
  const matrixValidation = api.validateCommercialVisualAcceptanceMatrix(matrix);
  if (!matrixValidation.passed) throw new Error(matrixValidation.failures.join(" | "));
  if (JSON.stringify(api.COMMERCIAL_VISUAL_FAILURE_CODES) !== JSON.stringify(expectedFailureCodes)) {
    throw new Error("Commercial visual failure taxonomy changed from the approved V1.3 list.");
  }

  const expectedBaseline = await readJson(baselinePath);
  const currentBaseline = await computeCommercialV13Baseline(projectRoot, matrix, api);
  if (JSON.stringify(currentBaseline) !== JSON.stringify(expectedBaseline)) {
    throw new Error("Canonical Director Plan or compiled text diverged from the frozen V1.3 baseline.");
  }

  run("npm", ["run", "export:commercial-v1.3-seedance-pack"]);

  const requiredPaths = [
    join(outputDirectory, "manifest.json"),
    join(outputDirectory, "README.md"),
    join(outputDirectory, "baseline.json"),
    join(outputDirectory, "review-results.json"),
    ...matrix.cases.map((testCase) => join(outputDirectory, "cases", `${testCase.caseId}.md`)),
  ];
  for (const path of requiredPaths) await requireFile(path);

  const manifest = await readJson(join(outputDirectory, "manifest.json"));
  const exportedBaseline = await readJson(join(outputDirectory, "baseline.json"));
  const reviewResults = await readJson(join(outputDirectory, "review-results.json"));
  const readme = await readFile(join(outputDirectory, "README.md"), "utf8");
  const caseIds = matrix.cases.map((testCase) => testCase.caseId);

  if (JSON.stringify(exportedBaseline) !== JSON.stringify(expectedBaseline)) {
    throw new Error("Exported baseline.json does not match the frozen source baseline.");
  }
  if (manifest.cases.length !== 12 || manifest.reviewResults.length !== 12) {
    throw new Error("Exported manifest does not contain 12 cases and 12 review results.");
  }
  if (JSON.stringify(manifest.cases.map((testCase) => testCase.caseId)) !== JSON.stringify(caseIds)) {
    throw new Error("Exported manifest case order diverges from the canonical matrix.");
  }
  if (JSON.stringify(manifest.cases.map((testCase) => testCase.canonicalCompiledText))
    !== JSON.stringify(matrix.cases.map((testCase) => testCase.canonicalCompiledText))) {
    throw new Error("Exported canonical scripts diverged from the source matrix.");
  }

  const reviewFailures = validateReviewCollection(api, reviewResults, caseIds);
  if (reviewFailures.length > 0) throw new Error(reviewFailures.join(" | "));
  const finalStatus = api.resolveCommercialVisualFinalStatus(reviewResults);
  if (manifest.finalVisualStatus !== finalStatus) {
    throw new Error("Exported final visual status diverges from review-results.json.");
  }
  if (!readme.includes("SCRIPT STATUS:\nVERIFIED")) {
    throw new Error("Pack README does not declare SCRIPT STATUS: VERIFIED.");
  }
  const humanAcceptance = await readCommercialV13HumanAcceptanceDisplay(outputDirectory);
  if (humanAcceptance) {
    if (!/VISUAL STATUS:\s*\n\s*VERIFIED/.test(readme)) {
      throw new Error("Pack README does not display the authoritative human visual acceptance.");
    }
    if (!readme.includes("FINAL_VISUAL_ACCEPTANCE_REPORT.md")) {
      throw new Error("Pack README does not reference the authoritative human acceptance record.");
    }
    if (!/V1\.3 FREEZE STATUS:\s*\n\s*FROZEN/.test(readme)) {
      throw new Error("Pack README does not display the frozen V1.3 production state.");
    }
  } else if (!readme.includes(`VISUAL STATUS:\n${visualStatusLabel(finalStatus)}`)) {
    throw new Error("Pack README visual status diverges from review-results.json.");
  }

  for (const testCase of matrix.cases) {
    const caseText = await readFile(join(outputDirectory, "cases", `${testCase.caseId}.md`), "utf8");
    const leakedTokens = assertNoCaseLeakage(caseText);
    if (leakedTokens.length > 0) {
      throw new Error(`${testCase.caseId} leaked internal tokens: ${leakedTokens.join(", ")}`);
    }
    if (!caseText.includes("## Canonical Seedance Execution")) {
      throw new Error(`${testCase.caseId} does not contain the canonical execution script.`);
    }
    if (!caseText.includes(testCase.canonicalCompiledText)) {
      throw new Error(`${testCase.caseId} execution script diverges from the frozen matrix.`);
    }
  }

  const regressionCommands = [
    ["npm", ["run", "validate:commercial-visual-acceptance"]],
    ["npm", ["run", "validate:commercial-director-concept"]],
    ["npm", ["run", "validate:commercial-output-diversity"]],
    ["npm", ["run", "validate:commercial-creative-direction"]],
    ["npm", ["run", "validate:commercial-creative-spine"]],
    ["npm", ["run", "validate:commercial-film"]],
    ["npm", ["run", "validate:commercial-execution-compiler"]],
    ["npm", ["run", "validate:actions"]],
    ["npm", ["run", "typecheck"]],
    ["npm", ["run", "build"]],
    ["npx", ["playwright", "test", "tests/e2e/commercial-film.spec.ts"]],
  ];
  for (const [command, args] of regressionCommands) run(command, args);

  const visualStatus = visualStatusLabel(finalStatus);
  const freezeStatus = finalStatus === "PRODUCTION_VERIFIED"
    ? "FROZEN"
    : "SCRIPT FROZEN / VISUAL ACCEPTANCE PENDING";
  console.log("COMMERCIAL FILM V1.3 FINALIZATION REPORT:");
  console.log(JSON.stringify({
    architecture: "COMMERCIAL_FILM_V1.3_FINALIZATION",
    frozenBaseline: "PASS",
    acceptanceMatrix: {
      cases: matrix.cases.length,
      directorConcepts: new Set(matrix.cases.filter((testCase) => testCase.group === "A").map((testCase) => testCase.directorConceptId)).size,
      crossIntentControls: new Set(matrix.cases.filter((testCase) => testCase.group === "B").map((testCase) => testCase.intent)).size,
    },
    exportPack: outputDirectory,
    visualReviewIntegrity: "PASS",
    failureTaxonomy: "PASS",
    seedanceTranslationPolicy: "NO_AUTO_FIX_APPLIED",
    acceptanceDisplayAuthority: humanAcceptance
      ? "HUMAN_FINAL_VISUAL_ACCEPTANCE_REPORT"
      : "AUTOMATED_REVIEW_RESULTS",
    perCaseReviewStatus: finalStatus,
    regression: "PASS",
    narrativeModified: "NO",
    actionsModified: "NO",
    scriptStatus: "PASS",
    visualStatus,
    freezeStatus,
  }, null, 2));
} catch (error) {
  console.error("COMMERCIAL FILM V1.3 FINALIZATION FAILED:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
