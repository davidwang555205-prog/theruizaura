import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  canonicalRequestForCase,
  computeCommercialV13Baseline,
  hashPath,
  loadCommercialV13Api,
  readJson,
  sha256,
} from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const canonicalBaselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "visual-acceptance",
  "canonical-baseline.json"
);
const protectedBaselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "presentation",
  "protected-source-baseline.json"
);
const outputDirectory = resolve(projectRoot, "artifacts", "commercial-film", "v1.3-final");

const internalPhrases = [
  "selected commercial expression",
  "commercial expression defines",
  "beat 1 contributes",
  "hero inherits the movement",
  "release inherits the movement",
  "externally supported product observation",
  "execution state",
  "canonical",
  "validator",
  "enum",
  "event spine",
  "action causality",
  "product presence",
  "reveal strategy",
  "dramatic function",
  "story spine",
];
const internalEnumTokens = [
  "PRIVATE_MOMENT",
  "CITY_JOURNEY",
  "EVERYDAY_MOVEMENT",
  "STATE_TRANSITION",
  "SENSORY_LIFE",
  "SINGLE_IDEA",
  "STATIC_CAMERA_FILM",
  "PARTIAL_OBSCURATION",
  "EDGE_OF_FRAME",
  "THRESHOLD_CHAIN",
  "REFLECTION_WORLD",
  "LIGHT_REVEAL",
  "WORLD_MOVES_SUBJECT_SETTLES",
  "REPEATED_GESTURE",
  "PRIMARY",
  "SUPPORTING",
  "RESOLUTION",
  "ACTION_CUT",
  "MATCH_MOVEMENT",
  "SENSORY_INSERT",
  "DELAYED_REVEAL",
];
const potentiallyInventedTokens = [
  "umbrella",
  "handbag",
  "coffee cup",
  "taxi",
  "bicycle",
  "phone",
  "notebook",
  "sunglasses",
  "hat",
  "jacket",
  "coat",
  "scarf",
  "earrings",
  "necklace",
  "gold",
  "silver",
  "suede",
  "rubber sole",
  "metal buckle",
  "logo",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function contentLines(text) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && /^[A-Za-z][A-Za-z /-]+:/.test(line))
    .map((line) => line.slice(line.indexOf(":") + 1).trim().toLowerCase())
    .filter((line) => line.length >= 28);
}

function tokenSet(text) {
  return new Set(text.match(/[a-z]+/g) ?? []);
}

function jaccard(left, right) {
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return union === 0 ? 0 : intersection / union;
}

function adjacentDuplicationFailures(text) {
  const failures = [];
  const lines = contentLines(text);
  for (let index = 1; index < lines.length; index += 1) {
    const left = tokenSet(lines[index - 1]);
    const right = tokenSet(lines[index]);
    if (left.size >= 5 && right.size >= 5 && jaccard(left, right) > 0.82) {
      failures.push(`${index}:${index + 1}`);
    }
  }
  return failures;
}

function leakageFailures(text) {
  const failures = [];
  const lower = text.toLowerCase();
  for (const phrase of internalPhrases) {
    if (lower.includes(phrase)) failures.push(`internal phrase: ${phrase}`);
  }
  for (const token of internalEnumTokens) {
    if (new RegExp(`\\b${token}\\b`).test(text)) failures.push(`enum token: ${token}`);
  }
  if (/\b(?:QC|validator|validation status|source id|primitive id|enum)\b/i.test(text)) {
    failures.push("validator or internal-ID language");
  }
  if (/\b(?:walking|transition|standing|turning|garment-task|scene-interaction|environment-response|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(text)) {
    failures.push("Action ID");
  }
  return failures;
}

function inventedFactFailures(presentationText, canonicalText) {
  const failures = [];
  const canonicalLower = canonicalText.toLowerCase();
  const presentationLower = presentationText.toLowerCase();
  for (const token of potentiallyInventedTokens) {
    if (presentationLower.includes(token) && !canonicalLower.includes(token)) {
      failures.push(token);
    }
  }
  return failures;
}

const api = await loadCommercialV13Api(projectRoot);
const matrix = api.buildCommercialVisualAcceptanceMatrix();
const canonicalBaseline = await readJson(canonicalBaselinePath);
const protectedBaseline = await readJson(protectedBaselinePath);
const currentCanonicalBaseline = await computeCommercialV13Baseline(projectRoot, matrix, api);

assert(
  JSON.stringify(currentCanonicalBaseline) === JSON.stringify(canonicalBaseline),
  "Canonical baseline hashes changed."
);
for (const expected of protectedBaseline.sources) {
  const currentHash = await hashPath(projectRoot, expected.path);
  assert(
    currentHash === expected.sha256,
    `Protected generation source changed: ${expected.path}`
  );
}

const regressionCases = [];
for (const testCase of matrix.cases) {
  const request = canonicalRequestForCase(testCase);
  const outcome = api.runCommercialFilmPipeline(request);
  assert(outcome.status === "GENERATED", `${testCase.caseId} did not generate.`);

  const canonicalText = outcome.modelFacingScript.compiledText;
  const baselineCase = canonicalBaseline.cases.find((entry) => entry.caseId === testCase.caseId);
  assert(Boolean(baselineCase), `${testCase.caseId} is missing from the canonical baseline.`);
  assert(
    sha256(canonicalText) === baselineCase.compiledTextSha256,
    `${testCase.caseId} canonicalCompiledText changed.`
  );
  assert(
    canonicalText === testCase.canonicalCompiledText,
    `${testCase.caseId} canonical text diverged from the frozen matrix.`
  );

  const first = api.buildCommercialFinalScriptPresentation({
    plan: outcome.plan,
    canonicalCompiledText: canonicalText,
  });
  const second = api.buildCommercialFinalScriptPresentation({
    plan: outcome.plan,
    canonicalCompiledText: canonicalText,
  });
  assert(
    first.presentationScript === second.presentationScript,
    `${testCase.caseId} presentationScript is not deterministic.`
  );
  assert(
    first.canonicalCompiledText === canonicalText,
    `${testCase.caseId} presentation layer changed canonicalCompiledText.`
  );
  assert(
    first.directorScript.shots.length === outcome.plan.shotArchitecture.shots.length,
    `${testCase.caseId} presentation lost or added shots.`
  );

  outcome.plan.shotArchitecture.shots.forEach((shot, index) => {
    const presentationShot = first.directorScript.shots[index];
    assert(Boolean(presentationShot), `${testCase.caseId} is missing presentation shot ${index + 1}.`);
    assert(
      presentationShot.shotIndex === shot.shotIndex
      && presentationShot.shotRole === shot.role
      && presentationShot.timeRange.startSecond === shot.timeRange.startSecond
      && presentationShot.timeRange.endSecond === shot.timeRange.endSecond
      && presentationShot.timeRange.durationSeconds === shot.timeRange.durationSeconds,
      `${testCase.caseId} shot ${index + 1} identity or timing changed.`
    );
    assert(
      presentationShot.sourceEvent === shot.event.whatHappens,
      `${testCase.caseId} shot ${index + 1} has no canonical source event trace.`
    );
  });

  const leakFailures = leakageFailures(first.presentationScript);
  assert(leakFailures.length === 0, `${testCase.caseId} presentation leakage: ${leakFailures.join(", ")}`);
  const inventedFacts = inventedFactFailures(first.presentationScript, canonicalText);
  assert(inventedFacts.length === 0, `${testCase.caseId} presentation invented product facts: ${inventedFacts.join(", ")}`);
  const duplication = adjacentDuplicationFailures(first.presentationScript);
  assert(duplication.length === 0, `${testCase.caseId} presentation has adjacent semantic duplication at ${duplication.join(", ")}.`);

  regressionCases.push({
    caseId: testCase.caseId,
    canonicalCompiledTextSha256: sha256(canonicalText),
    presentationScriptSha256: sha256(first.presentationScript),
  });
}

await mkdir(outputDirectory, { recursive: true });
await writeFile(
  join(outputDirectory, "presentation-regression.json"),
  `${JSON.stringify({
    schemaVersion: api.COMMERCIAL_FINAL_SCRIPT_PRESENTATION_SCHEMA_VERSION,
    stage: "COMMERCIAL_FILM_V1.3_FINAL_SCRIPT_PRESENTATION",
    canonicalBaseline: "UNCHANGED",
    protectedGenerationSources: "UNCHANGED",
    cases: regressionCases,
  }, null, 2)}\n`
);

console.log("COMMERCIAL FILM V1.3 FINAL SCRIPT PRESENTATION VALIDATION PASS:", JSON.stringify({
  stage: "COMMERCIAL_FILM_V1.3_FINAL_SCRIPT_PRESENTATION",
  cases: regressionCases.length,
  canonicalBaseline: "UNCHANGED",
  directorEngine: "UNCHANGED",
  actions: "UNCHANGED",
  narrative: "UNCHANGED",
  presentationDeterminismFailures: 0,
  canonicalHashFailures: 0,
  leakageFailures: 0,
  adjacentSemanticDuplicationFailures: 0,
  inventedEventFailures: 0,
  inventedProductFactFailures: 0,
  output: join(outputDirectory, "presentation-regression.json"),
}, null, 2));
