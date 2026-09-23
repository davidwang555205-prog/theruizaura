import { createHash } from "node:crypto";
import { build } from "esbuild";
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function loadCommercialV13Api(projectRoot) {
  const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-v13-"));
  const entryPath = join(tempDirectory, "entry.ts");
  const bundlePath = join(tempDirectory, "bundle.mjs");
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
  const api = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  await rm(tempDirectory, { recursive: true, force: true });
  return api;
}

export function stableStringify(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  const entries = Object.keys(value)
    .filter((key) => value[key] !== undefined)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(",")}}`;
}

export function sha256(value) {
  if (Buffer.isBuffer(value)) {
    return createHash("sha256").update(value).digest("hex");
  }
  const text = typeof value === "string" ? value : stableStringify(value);
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function referenceForCase(caseId) {
  return {
    referenceSetId: `visual-acceptance-${caseId}`,
    taskId: "visual-acceptance-control-task",
    sourceType: "current_task_reference_set",
    confirmationStatus: "incomplete",
    confirmedReferenceCount: 0,
    confirmedAssetIds: [],
    coverage: [],
    missingCoverage: [
      "silhouette",
      "toe_structure",
      "side_panel_structure",
      "heel_structure",
      "outsole_profile",
      "color_blocking",
      "material_evidence",
    ],
    referencePlanReady: false,
    productTruthMode: "reference_bound",
    productTruth: null,
  };
}

export function canonicalRequestForCase(testCase) {
  return {
    commercialIntent: testCase.intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    generationNonce: testCase.generationNonce,
    directorConceptOverride: testCase.directorConceptId,
    reference: referenceForCase(testCase.caseId),
  };
}

export async function hashPath(projectRoot, relativePath) {
  const absolutePath = resolve(projectRoot, relativePath);
  const pathStat = await stat(absolutePath);
  if (pathStat.isFile()) {
    return sha256(await readFile(absolutePath));
  }
  if (!pathStat.isDirectory()) {
    throw new Error(`Protected source path is not a file or directory: ${relativePath}`);
  }
  const entryNames = (await readdir(absolutePath)).sort();
  const lines = [];
  for (const entryName of entryNames) {
    if (entryName === ".DS_Store") continue;
    const childRelativePath = join(relativePath, entryName);
    const childStat = await stat(resolve(projectRoot, childRelativePath));
    if (childStat.isDirectory()) {
      lines.push(`${childRelativePath}/ ${await hashPath(projectRoot, childRelativePath)}`);
    } else if (childStat.isFile()) {
      lines.push(`${childRelativePath} ${await hashPath(projectRoot, childRelativePath)}`);
    }
  }
  return sha256(lines.join("\n"));
}

export async function computeCommercialV13Baseline(projectRoot, matrix, api) {
  const cases = [];
  for (const testCase of matrix.cases) {
    const request = canonicalRequestForCase(testCase);
    const outcome = api.runCommercialFilmPipeline(request);
    if (outcome.status !== "GENERATED") {
      throw new Error(`${testCase.caseId} baseline generation blocked: ${outcome.diagnostics.join(" | ")}`);
    }
    cases.push({
      caseId: testCase.caseId,
      intent: testCase.intent,
      directorConceptId: testCase.directorConceptId,
      generationNonce: testCase.generationNonce,
      duration: 15,
      aspectRatio: testCase.aspectRatio,
      canonicalInputSha256: sha256(request),
      directorPlanSha256: sha256(outcome.plan),
      compiledTextSha256: sha256(outcome.modelFacingScript.compiledText),
    });
  }

  const protectedSourcePaths = [
    "src/immersive-narrative",
    "src/data/personActionLibrary.ts",
  ];
  const protectedSources = [];
  for (const relativePath of protectedSourcePaths) {
    protectedSources.push({
      path: relativePath,
      sha256: await hashPath(projectRoot, relativePath),
    });
  }

  return {
    schemaVersion: api.COMMERCIAL_VISUAL_ACCEPTANCE_BASELINE_SCHEMA_VERSION,
    stage: "COMMERCIAL_FILM_V1.3_CANONICAL_BASELINE",
    hashAlgorithm: "sha256",
    cases,
    protectedSources,
  };
}

export function validateReviewCollection(api, reviews, expectedCaseIds) {
  const failures = [];
  if (!Array.isArray(reviews)) return ["review-results.json must contain an array."];
  const reviewIds = reviews.map((review) => review?.caseId);
  if (new Set(reviewIds).size !== reviewIds.length) failures.push("Review result case IDs are not unique.");
  if (reviewIds.length !== expectedCaseIds.length) {
    failures.push(`Expected ${expectedCaseIds.length} review results, received ${reviewIds.length}.`);
  }
  for (const caseId of expectedCaseIds) {
    if (!reviewIds.includes(caseId)) failures.push(`Review results are missing ${caseId}.`);
  }
  for (const caseId of reviewIds) {
    if (!expectedCaseIds.includes(caseId)) failures.push(`Review results contain unknown case ${caseId}.`);
  }
  for (const review of reviews) {
    if (!review || typeof review !== "object" || typeof review.caseId !== "string") {
      failures.push("Review results contain a malformed entry without a valid caseId.");
      continue;
    }
    failures.push(...api.validateCommercialVisualReviewResult(review));
  }
  return failures;
}

export function mergeReviewResults(api, matrix, existingReviews) {
  const existingByCaseId = new Map(existingReviews.map((review) => [review.caseId, review]));
  return matrix.cases.map((testCase) => (
    existingByCaseId.get(testCase.caseId)
    ?? api.createEmptyCommercialVisualReview(testCase.caseId)
  ));
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

// Creative-engine fingerprint: the text surface the brand sign-off layer must never rewrite.
export function hashCommercialTreatment(treatment) {
  return sha256(JSON.stringify({
    title: treatment.title,
    commercialIntent: treatment.commercialIntent,
    directorConceptId: treatment.directorConceptId,
    proposition: treatment.creativeProposition.presentationText,
    signatureMoment: treatment.signatureMoment,
    signatureEvent: treatment.signatureEvent,
    eventSequence: treatment.eventSequence.map((beat) => ({ event: beat.event, cause: beat.cause })),
    deviceArc: treatment.deviceArc.map((beat) => ({ state: beat.deviceState, carrier: beat.deviceCarrier })),
    structureType: treatment.structureType,
    structure: treatment.structure.map((beat) => ({ role: beat.structureRole, function: beat.function })),
    productRevealLogic: treatment.productRevealLogic,
    endingImage: treatment.endingImage,
    worldBehavior: treatment.worldBehavior,
  }));
}

async function readTextIfExists(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return null;
  }
}

// The pack README is a presentation surface, not a second evidence store. Once an authoritative
// human visual acceptance is on record, the README displays that decision and must not be
// replaced by the automated per-case review state.
export async function readCommercialV13HumanAcceptanceDisplay(outputDirectory) {
  const reportPath = join(outputDirectory, "FINAL_VISUAL_ACCEPTANCE_REPORT.md");
  const readmePath = join(outputDirectory, "README.md");
  const [report, readme] = await Promise.all([
    readTextIfExists(reportPath),
    readTextIfExists(readmePath),
  ]);
  if (report === null || readme === null) return null;

  const reportRecordsAcceptance = /APPROVED FOR FREEZE/.test(report)
    && /PRODUCTION FROZEN:\s*\n?\s*YES/.test(report);
  const readmeDisplaysAcceptance = readme.includes("FINAL_VISUAL_ACCEPTANCE_REPORT.md")
    && /VISUAL STATUS:\s*\n\s*VERIFIED/.test(readme)
    && /V1\.3 FREEZE STATUS:\s*\n\s*FROZEN/.test(readme)
    && /PRODUCTION FROZEN:\s*\n\s*YES/.test(readme);
  if (!reportRecordsAcceptance || !readmeDisplaysAcceptance) return null;

  return { reportPath, readmePath };
}
