import { access, mkdir, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  computeCommercialV13Baseline,
  loadCommercialV13Api,
  mergeReviewResults,
  readJson,
  readCommercialV13HumanAcceptanceDisplay,
  sha256,
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
const reviewResultsPath = join(outputDirectory, "review-results.json");

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function visualStatusLabel(finalVisualStatus) {
  if (finalVisualStatus === "PRODUCTION_VERIFIED") return "VERIFIED";
  if (finalVisualStatus === "FAIL") return "FAIL";
  if (finalVisualStatus === "INCONCLUSIVE") return "INCONCLUSIVE";
  return "NOT VERIFIED";
}

function caseMarkdown(testCase, review, intentLabel) {
  return [
    `# ${testCase.caseId.toUpperCase()}`,
    "",
    `Case ID: ${testCase.caseId}`,
    `Intent: ${intentLabel}`,
    `Director Concept: ${testCase.cinematicDevice}`,
    `Cinematic Device: ${testCase.cinematicDevice}`,
    `Generation Nonce: ${testCase.generationNonce}`,
    `Duration: ${testCase.duration}s`,
    `Aspect Ratio: ${testCase.aspectRatio}`,
    "Script Status: VERIFIED",
    `Visual Status: ${review.reviewStatus}`,
    "",
    "## Director Plan Summary",
    "",
    `Rule: ${testCase.directorPlanSummary.globalRule}`,
    `HERO: ${testCase.directorPlanSummary.heroRule}`,
    `RELEASE: ${testCase.directorPlanSummary.releaseRule}`,
    "",
    "## Event Spine Summary",
    "",
    `Central Event: ${testCase.eventSpineSummary.centralEvent}`,
    `Timing: ${testCase.eventSpineSummary.durationPlan.join(" / ")}s`,
    `Ending: ${testCase.endingStrategy}`,
    "",
    "## Canonical Seedance Execution",
    "",
    "```text",
    testCase.canonicalCompiledText,
    "```",
    "",
  ].join("\n");
}

const api = await loadCommercialV13Api(projectRoot);
const baseline = await readJson(baselinePath);
const matrix = api.buildCommercialVisualAcceptanceMatrix();
const matrixValidation = api.validateCommercialVisualAcceptanceMatrix(matrix);
if (!matrixValidation.passed) throw new Error(matrixValidation.failures.join(" | "));

const currentBaseline = await computeCommercialV13Baseline(projectRoot, matrix, api);
if (JSON.stringify(currentBaseline) !== JSON.stringify(baseline)) {
  throw new Error("Current canonical generation diverges from the frozen V1.3 baseline.");
}

let existingReviews = matrix.reviewResults;
if (await fileExists(reviewResultsPath)) {
  const parsedReviews = await readJson(reviewResultsPath);
  const reviewFailures = validateReviewCollection(
    api,
    parsedReviews,
    matrix.cases.map((testCase) => testCase.caseId)
  );
  if (reviewFailures.length > 0) throw new Error(reviewFailures.join(" | "));
  existingReviews = parsedReviews;
}

const reviewResults = mergeReviewResults(api, matrix, existingReviews);
const finalVisualStatus = api.resolveCommercialVisualFinalStatus(reviewResults);
const reviewedMatrix = {
  ...matrix,
  cases: matrix.cases.map((testCase) => ({
    ...testCase,
    visualReviewStatus: reviewResults.find((review) => review.caseId === testCase.caseId).reviewStatus,
  })),
  reviewResults,
  finalVisualStatus,
};
const reviewedMatrixValidation = api.validateCommercialVisualAcceptanceMatrix(reviewedMatrix);
if (!reviewedMatrixValidation.passed) throw new Error(reviewedMatrixValidation.failures.join(" | "));

await mkdir(outputDirectory, { recursive: true });
await rm(join(outputDirectory, "cases"), { recursive: true, force: true });
await mkdir(join(outputDirectory, "cases"), { recursive: true });

const manifest = {
  ...reviewedMatrix,
  canonicalBaselineSha256: sha256(baseline),
};
await writeFile(join(outputDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
await writeFile(join(outputDirectory, "baseline.json"), `${JSON.stringify(baseline, null, 2)}\n`);
await writeFile(reviewResultsPath, `${JSON.stringify(reviewResults, null, 2)}\n`);

const visualStatus = visualStatusLabel(finalVisualStatus);
const freezeStatus = finalVisualStatus === "PRODUCTION_VERIFIED"
  ? "FROZEN"
  : "SCRIPT FROZEN / VISUAL ACCEPTANCE PENDING";
const humanAcceptance = await readCommercialV13HumanAcceptanceDisplay(outputDirectory);
if (humanAcceptance) {
  console.log(
    "Authoritative human visual acceptance is on record; pack README display state preserved.",
    `Automated per-case review status (${visualStatus}) remains recorded in manifest.json and review-results.json.`
  );
} else {
  await writeFile(join(outputDirectory, "README.md"), [
    "# THERUIZ AURA Commercial Film V1.3 Final Seedance Acceptance Pack",
    "",
    "This pack contains the 12 frozen canonical Commercial Film cases produced by the deterministic planner and compact compiler.",
    "",
    "- Group A: QUIET_LUXURY held constant across eight Director Concepts.",
    "- Group B: the control Director Concept held constant across URBAN_MOTION, DAILY_STYLING, PRODUCT_CRAFT, and NEW_ARRIVAL.",
    "- The harness does not call Seedance and does not upload references.",
    "- Reviewers must use the same product, external reference set, model/version, duration, aspect ratio, and generation settings where possible.",
    "- Do not edit canonical text per case and do not choose only a best regeneration.",
    "",
    "## Status",
    "",
    "SCRIPT STATUS:",
    "VERIFIED",
    "",
    "VISUAL STATUS:",
    visualStatus,
    "",
    "V1.3 FREEZE STATUS:",
    freezeStatus,
    "",
    "## Review Protocol",
    "",
    "1. Generate each canonical script in Seedance without prompt edits.",
    "2. Record every attempt in `review-results.json`.",
    "3. A PASS requires a real video reference, model/version, positive attempt number, controlled comparison flags, all review dimensions at PASS, and no failure codes.",
    "4. A missing real result must remain NOT_REVIEWED.",
    "5. Re-run the final validation after all reviews are recorded.",
    "",
  ].join("\n"));
}

const intentCatalog = new Map(api.COMMERCIAL_INTENT_CATALOG.map((intent) => [intent.id, intent.labelEn]));
for (const testCase of reviewedMatrix.cases) {
  const review = reviewResults.find((entry) => entry.caseId === testCase.caseId);
  await writeFile(
    join(outputDirectory, "cases", `${testCase.caseId}.md`),
    caseMarkdown(testCase, review, intentCatalog.get(testCase.intent) ?? testCase.intent)
  );
}

console.log("Exported Commercial Film V1.3 final Seedance acceptance pack:", outputDirectory);
console.log("SCRIPT STATUS: VERIFIED");
console.log(`VISUAL STATUS: ${visualStatus}`);
