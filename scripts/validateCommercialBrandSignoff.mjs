import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
  computeCommercialV13Baseline,
  hashCommercialTreatment,
  hashPath,
  loadCommercialV13Api,
  readJson,
  sha256,
} from "./commercialV13Harness.mjs";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "artifacts", "commercial-film", "v1.4");
const v13BaselinePath = resolve(
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
const treatmentBaselinePath = resolve(
  projectRoot,
  "src",
  "commercial-film",
  "brand-signoff",
  "treatment-baseline.json"
);

const FILM_LINE_MODE = "FILM_LINE_OVER_ENDING_IMAGE";
const NO_FILM_LINE_MODE = "NO_FILM_LINE";
const VALID_MODES = [FILM_LINE_MODE, NO_FILM_LINE_MODE];
// Automatic logo removal contract: none of these may appear in the model-facing prompt or the
// director script. The frozen GLOBAL NEGATIVES line that forbids readable logos in the environment is
// a pre-existing protective prohibition, not an automatic logo request, and it stays untouched.
const FORBIDDEN_LOGO_TOKENS = [
  { label: "THERUIZ AURA brand mark", pattern: /THERUIZ AURA/i },
  { label: "brand mark field", pattern: /brand mark/i },
  { label: "brand lettering instruction", pattern: /brand lettering/i },
  { label: "legacy logo sign-off mode", pattern: /\b(?:LOGO_ONLY|LOGO_OVER_ENDING_IMAGE|LOGO_AND_FILM_LINE_OVER_ENDING_IMAGE|END_CARD_LOGO_ONLY|END_CARD_LOGO_AND_FILM_LINE)\b/ },
  { label: "logo-only ending", pattern: /logo[-_ ]only/i },
  { label: "logo overlay instruction", pattern: /logo overlay/i },
  { label: "logo animation", pattern: /logo animation/i },
  { label: "logo end card", pattern: /logo end card/i },
  { label: "brand sign-off block", pattern: /BRAND-SIGN-OFF|brand sign[-_ ]off/i },
  { label: "reserved lower-frame logo space", pattern: /lower[- ]frame space/i },
];
// Quality examples from the brief are listed only to prove they were not copied.
const EXAMPLE_LINES = [
  "move at your own pace",
  "seen without asking",
  "made to leave with you",
];
const CLAIM_OR_GENERIC_COPY =
  /\b(?:premium|luxur(?:y|ious)|timeless|elegant|elegance|perfect|perfection|crafted|iconic|effortless|elevate|elevated|discover|indulge|redefine|flawless|modern|sophisticated|refined|unmistakable|guarantee|guaranteed|best|must-have)\b/i;
const MIN_HOLD_SECONDS = 1.2;
const DIRECTOR_SCRIPT_ORDER_HEAD = [
  "CREATIVE PROPOSITION",
  "DIRECTOR CONCEPT",
  "CINEMATIC DEVICE",
  "SIGNATURE MOMENT",
  "FILM ARC",
  "SHOT 1 — ",
  "ENDING IMAGE",
];
const DIRECTOR_SCRIPT_ORDER_WITH_FILM_LINE = [
  ...DIRECTOR_SCRIPT_ORDER_HEAD,
  "ENDING TEXT",
  "SEEDANCE EXECUTION DIRECTION",
];
const DIRECTOR_SCRIPT_ORDER_WITHOUT_FILM_LINE = [
  ...DIRECTOR_SCRIPT_ORDER_HEAD,
  "SEEDANCE EXECUTION",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stems(value) {
  const words = value.toLowerCase().match(/[a-z]{4,}/g) ?? [];
  const output = new Set();
  for (const word of words) {
    let stem = word;
    for (const suffix of ["ing", "ed", "es", "s", "ly"]) {
      if (stem.length - suffix.length >= 4 && stem.endsWith(suffix)) {
        stem = stem.slice(0, -suffix.length);
        break;
      }
    }
    output.add(stem);
  }
  return output;
}

function lineWordCount(line) {
  return (line.match(/[A-Za-z']+/g) ?? []).length;
}

function logoTokenFailures(caseId, surface, text) {
  return FORBIDDEN_LOGO_TOKENS
    .filter(({ pattern }) => pattern.test(text))
    .map(({ label }) => `${caseId}: ${label} appears in the ${surface}`);
}

function v14RequestForCase(testCase) {
  return {
    commercialIntent: testCase.intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    generationNonce: testCase.generationNonce,
    directorConceptOverride: testCase.directorConceptId,
    reference: {
      referenceSetId: `v14-acceptance-${testCase.caseId}`,
      taskId: "v14-creative-directing-acceptance",
      sourceType: "current_task_reference_set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: ["silhouette"],
      referencePlanReady: false,
      productTruthMode: "reference_bound",
      productTruth: null,
    },
  };
}

function sloganKeys(value, path = "") {
  if (value === null || typeof value !== "object") return [];
  const found = [];
  for (const [key, entry] of Object.entries(value)) {
    if (/slogan/i.test(key)) found.push(`${path}${key}`);
    found.push(...sloganKeys(entry, `${path}${key}.`));
  }
  return found;
}

function directorScriptOrderFailures(script, hasFilmLine) {
  const order = hasFilmLine
    ? DIRECTOR_SCRIPT_ORDER_WITH_FILM_LINE
    : DIRECTOR_SCRIPT_ORDER_WITHOUT_FILM_LINE;
  const indices = order.map((token) => script.indexOf(token));
  const lines = script.split("\n");
  const firstLine = lines[0].trim();
  const titleLinePresent = firstLine.length > 4
    && !order.includes(firstLine)
    && lines[1] === "";
  const orderPresent = indices.every((index) => index >= 0)
    && indices.every((index, position) => position === 0 || index > indices[position - 1]);
  if (!hasFilmLine && script.includes("ENDING TEXT")) {
    return ["a film line closing block is present in a case without a film line"];
  }
  return orderPresent && titleLinePresent
    ? []
    : [`director script order is not title -> proposition -> concept -> device -> moment -> arc -> shots -> ending -> ${hasFilmLine ? "film line -> execution direction" : "execution"}`];
}

try {
  const api = await loadCommercialV13Api(projectRoot);
  const v13Matrix = api.buildCommercialVisualAcceptanceMatrix();
  const canonicalBaseline = await readJson(v13BaselinePath);
  const currentCanonicalBaseline = await computeCommercialV13Baseline(projectRoot, v13Matrix, api);
  assert(
    JSON.stringify(currentCanonicalBaseline) === JSON.stringify(canonicalBaseline),
    "V1.3 canonical baseline changed."
  );

  const protectedBaseline = await readJson(protectedBaselinePath);
  for (const expected of protectedBaseline.sources) {
    assert(
      await hashPath(projectRoot, expected.path) === expected.sha256,
      `Protected generation source changed: ${expected.path}`
    );
  }

  const treatmentBaseline = await readJson(treatmentBaselinePath);
  const baselineByCaseId = new Map(
    treatmentBaseline.cases.map((entry) => [entry.caseId, entry.treatmentSha256])
  );

  const matrix = api.buildCommercialV14AcceptanceMatrix();
  assert(matrix.cases.length === 12, `Brand sign-off expects the same 12 cases, received ${matrix.cases.length}.`);

  const logoTokenFailuresList = [];
  const filmLineFailures = [];
  const sloganFailures = [];
  const timingFailures = [];
  const endingOverwriteFailures = [];
  const creativeEngineDrift = [];
  const caseReports = [];
  const seenLines = new Map();
  let filmLineCount = 0;
  let noFilmLineCount = 0;

  for (const testCase of matrix.cases) {
    const outcome = api.runCommercialV14Pipeline(v14RequestForCase(testCase));
    assert(outcome.status === "GENERATED", `${testCase.caseId} V1.4 pipeline blocked.`);
    const plan = outcome.plan;
    const treatment = plan.creativeTreatment;
    const signOff = plan.presentation.brandSignOff;
    assert(signOff, `${testCase.caseId} has no brand sign-off record.`);

    if (!VALID_MODES.includes(signOff.mode)) {
      endingOverwriteFailures.push(`${testCase.caseId}: unknown sign-off mode ${signOff.mode}`);
    }
    if (Object.prototype.hasOwnProperty.call(signOff, "brandMark")) {
      endingOverwriteFailures.push(`${testCase.caseId}: sign-off record still carries a brand mark field`);
    }
    logoTokenFailuresList.push(
      ...logoTokenFailures(testCase.caseId, "model-facing Seedance prompt", plan.presentation.v14CompiledText),
      ...logoTokenFailures(testCase.caseId, "director script", plan.presentation.presentationScript),
    );
    if (signOff.mode !== (signOff.filmLine === null ? NO_FILM_LINE_MODE : FILM_LINE_MODE)) {
      endingOverwriteFailures.push(
        `${testCase.caseId}: sign-off mode ${signOff.mode} does not match its film line state`
      );
    }

    const leakedSloganKeys = sloganKeys(signOff);
    if (leakedSloganKeys.length > 0) {
      sloganFailures.push(`${testCase.caseId}: permanent slogan field ${leakedSloganKeys.join(", ")}`);
    }

    if (signOff.filmLine === null) {
      noFilmLineCount += 1;
      if (signOff.timing !== null || signOff.seedanceDirection !== null) {
        endingOverwriteFailures.push(
          `${testCase.caseId}: a case without a film line still emits a sign-off window`
        );
      }
    } else {
      filmLineCount += 1;
      const line = signOff.filmLine;
      const normalized = line.replace(/[.!?]+$/, "").toLowerCase();
      if (lineWordCount(line) < 2 || lineWordCount(line) > 7) {
        filmLineFailures.push(`${testCase.caseId}: film line is ${lineWordCount(line)} words`);
      }
      if (CLAIM_OR_GENERIC_COPY.test(line)) {
        filmLineFailures.push(`${testCase.caseId}: film line uses claim or generic luxury copy`);
      }
      if (EXAMPLE_LINES.includes(normalized)) {
        filmLineFailures.push(`${testCase.caseId}: film line copies a brief example`);
      }
      if (seenLines.has(normalized)) {
        sloganFailures.push(`${testCase.caseId}: film line reused from ${seenLines.get(normalized)}`);
      }
      seenLines.set(normalized, testCase.caseId);
      const sourceStems = stems([
        treatment.creativeProposition.presentationText,
        treatment.signatureMoment.momentDescription,
        treatment.endingImage,
      ].join(" "));
      const shared = [...stems(line)].filter((stem) => sourceStems.has(stem));
      if (shared.length === 0) {
        filmLineFailures.push(`${testCase.caseId}: film line is not traceable to proposition, Signature Moment or ending image`);
      }
      const sources = signOff.filmLineSources;
      if (!sources
        || sources.creativeProposition !== treatment.creativeProposition.presentationText
        || sources.signatureMoment !== treatment.signatureMoment.momentDescription
        || sources.endingImage !== treatment.endingImage) {
        filmLineFailures.push(`${testCase.caseId}: film line sources are not the case's own treatment text`);
      }
    }

    const shots = plan.basePlan.shotArchitecture.shots;
    const signatureBeatEndSecond = shots[treatment.signatureMoment.signatureBeatIndex]?.endSecond ?? 0;
    const endingImageStartSecond = shots[shots.length - 1]?.startSecond ?? 0;
    const timing = signOff.timing;
    if (signOff.filmDurationSeconds !== plan.basePlan.duration || plan.basePlan.duration > 15) {
      timingFailures.push(
        `${testCase.caseId}: film duration ${plan.basePlan.duration}s is not the frozen 15s film`
      );
    }
    if (timing) {
      const hold = Math.round((timing.endSecond - timing.startSecond) * 100) / 100;
      if (timing.endSecond !== plan.basePlan.duration
        || timing.startSecond >= timing.endSecond
        || timing.startSecond < signatureBeatEndSecond
        || timing.startSecond < endingImageStartSecond
        || hold !== timing.holdSeconds
        || hold < MIN_HOLD_SECONDS) {
        timingFailures.push(
          `${testCase.caseId}: film line timing ${timing.startSecond}-${timing.endSecond}s is not inside the ${plan.basePlan.duration}s film`
        );
      }
    }

    const script = plan.presentation.presentationScript;
    const endingImageIndex = script.indexOf(`ENDING IMAGE\n${treatment.endingImage}`);
    const openingIndex = script.indexOf("ENDING TEXT");
    const directionIndex = script.indexOf(
      signOff.filmLine ? "SEEDANCE EXECUTION DIRECTION" : "SEEDANCE EXECUTION"
    );
    if (endingImageIndex < 0) {
      endingOverwriteFailures.push(`${testCase.caseId}: ending image is missing from the director script`);
    }
    if (signOff.filmLine === null) {
      if (endingImageIndex < 0 || directionIndex < 0
        || !(endingImageIndex < directionIndex)) {
        endingOverwriteFailures.push(
          `${testCase.caseId}: the case without a film line does not end on the ending image`
        );
      }
    } else if (openingIndex < 0 || directionIndex < 0
      || !(endingImageIndex < openingIndex && openingIndex < directionIndex)) {
      endingOverwriteFailures.push(`${testCase.caseId}: film line block is missing from the director script`);
    }
    for (const failure of directorScriptOrderFailures(script, signOff.filmLine !== null)) {
      endingOverwriteFailures.push(`${testCase.caseId}: ${failure}`);
    }
    if (!signOff.endingImagePreserved || !signOff.postProductionOnly) {
      endingOverwriteFailures.push(`${testCase.caseId}: sign-off does not preserve the ending image`);
    }
    if (signOff.filmLine !== null) {
      if (!/\badded in post\b/i.test(signOff.seedanceDirection ?? "")
        || !/\bdo not render lettering\b/i.test(signOff.seedanceDirection ?? "")) {
        endingOverwriteFailures.push(
          `${testCase.caseId}: the film line is not framed as a post-production text overlay`
        );
      }
      if (!plan.presentation.v14CompiledText.includes("Film line: added in post as a text overlay")
        || !script.includes(`Film Line: ${signOff.filmLine}`)
        || !script.includes("Added in post over the ending image")) {
        endingOverwriteFailures.push(
          `${testCase.caseId}: the film line is missing from the model-facing or director output`
        );
      }
    } else {
      if (plan.presentation.v14CompiledText.includes("Film line:")) {
        endingOverwriteFailures.push(
          `${testCase.caseId}: a case without a film line still advertises closing text`
        );
      }
    }
    if (!plan.presentation.v14CompiledText.includes(`Ending image: ${treatment.endingImage}`)) {
      endingOverwriteFailures.push(
        `${testCase.caseId}: the model-facing prompt no longer carries the unchanged ending image`
      );
    }

    const expectedFingerprint = baselineByCaseId.get(testCase.caseId);
    assert(Boolean(expectedFingerprint), `${testCase.caseId} is missing from the treatment baseline.`);
    if (hashCommercialTreatment(treatment) !== expectedFingerprint) {
      creativeEngineDrift.push(testCase.caseId);
    }

    const second = api.runCommercialV14Pipeline(v14RequestForCase(testCase));
    assert(
      second.plan.presentation.presentationScript === script
      && second.plan.presentation.brandSignOff.filmLine === signOff.filmLine,
      `${testCase.caseId} brand sign-off is not deterministic.`
    );

    caseReports.push({
      caseId: testCase.caseId,
      title: treatment.title,
      endingImage: treatment.endingImage,
      mode: signOff.mode,
      filmLine: signOff.filmLine,
      timing,
      sourceEvents: plan.presentation.sourceEvents,
      presentationScriptSha256: sha256(script),
      v14CompiledTextSha256: sha256(plan.presentation.v14CompiledText),
      treatmentSha256: hashCommercialTreatment(treatment),
    });
  }

  assert(
    logoTokenFailuresList.length === 0,
    `Automatic logo tokens: ${logoTokenFailuresList.join(" | ")}`
  );
  assert(filmLineFailures.length === 0, `Film line failures: ${filmLineFailures.join(" | ")}`);
  assert(sloganFailures.length === 0, `Permanent slogan risk: ${sloganFailures.join(" | ")}`);
  assert(timingFailures.length === 0, `Film line timing failures: ${timingFailures.join(" | ")}`);
  assert(endingOverwriteFailures.length === 0, `Ending image failures: ${endingOverwriteFailures.join(" | ")}`);
  assert(creativeEngineDrift.length === 0, `Creative engine drift: ${creativeEngineDrift.join(", ")}`);

  const humanAcceptancePath = join(outputDirectory, "BRAND_SIGNOFF_HUMAN_ACCEPTANCE.json");
  const humanAcceptance = await readJson(humanAcceptancePath);
  assert(
    humanAcceptance.authority === "HUMAN_APPROVED",
    "Human acceptance record does not declare HUMAN_APPROVED authority."
  );
  const humanByCaseId = new Map(
    humanAcceptance.cases.map((entry) => [entry.caseId, entry])
  );
  assert(humanByCaseId.size === 12, `Human acceptance record needs 12 cases, received ${humanByCaseId.size}.`);

  const humanLogoTokenFailures = [];
  const humanFilmLineFailures = [];
  const humanModeFailures = [];
  const humanTimingFailures = [];
  const humanEndingFailures = [];
  const humanLineReuse = [];
  const humanCaseReports = [];
  const acceptedLines = new Map();
  let acceptedFilmLineCount = 0;
  let acceptedNoFilmLineCount = 0;

  for (const testCase of matrix.cases) {
    const accepted = humanByCaseId.get(testCase.caseId);
    assert(Boolean(accepted), `${testCase.caseId} is missing from the human acceptance record.`);
    const outcome = api.runCommercialV14Pipeline(v14RequestForCase(testCase));
    assert(outcome.status === "GENERATED", `${testCase.caseId} V1.4 pipeline blocked.`);
    const plan = outcome.plan;
    const treatment = plan.creativeTreatment;
    const shots = plan.basePlan.shotArchitecture.shots.map((shot) => ({
      startSecond: shot.timeRange.startSecond,
      endSecond: shot.timeRange.endSecond,
    }));
    const signOff = api.buildCommercialBrandSignOff({
      treatment,
      durationSeconds: plan.basePlan.duration,
      shots,
      humanAcceptance: { filmLine: accepted.filmLine },
    });

    humanLogoTokenFailures.push(
      ...logoTokenFailures(testCase.caseId, "human-accepted sign-off record", JSON.stringify(signOff))
    );
    if (signOff.authority !== "HUMAN_APPROVED") {
      humanLogoTokenFailures.push(`${testCase.caseId}: accepted record is not HUMAN_APPROVED`);
    }
    if (signOff.filmLine !== accepted.filmLine) {
      humanModeFailures.push(`${testCase.caseId}: accepted sign-off does not match the recorded decision`);
    }
    if (accepted.filmLine === null) {
      acceptedNoFilmLineCount += 1;
      if (signOff.mode !== NO_FILM_LINE_MODE || signOff.timing !== null) {
        humanModeFailures.push(
          `${testCase.caseId}: a case without a film line still emits a closing window`
        );
      }
    } else {
      acceptedFilmLineCount += 1;
      const normalized = accepted.filmLine.replace(/[.!?]+$/, "").toLowerCase();
      if (signOff.mode !== FILM_LINE_MODE) {
        humanModeFailures.push(`${testCase.caseId}: film line decision is not recorded as an overlay mode`);
      }
      if (lineWordCount(accepted.filmLine) < 2 || lineWordCount(accepted.filmLine) > 7) {
        humanFilmLineFailures.push(`${testCase.caseId}: accepted film line is ${lineWordCount(accepted.filmLine)} words`);
      }
      if (CLAIM_OR_GENERIC_COPY.test(accepted.filmLine)) {
        humanFilmLineFailures.push(`${testCase.caseId}: accepted film line uses claim or generic luxury copy`);
      }
      if (EXAMPLE_LINES.includes(normalized)) {
        humanFilmLineFailures.push(`${testCase.caseId}: accepted film line copies a brief example`);
      }
      if (acceptedLines.has(normalized)) {
        humanLineReuse.push(`${testCase.caseId}: accepted film line reused from ${acceptedLines.get(normalized)}`);
      }
      acceptedLines.set(normalized, testCase.caseId);
    }

    const signatureBeatEndSecond =
      shots[treatment.signatureMoment.signatureBeatIndex]?.endSecond ?? 0;
    const expectedStart = humanAcceptance.timingRule.withFilmLine.startSecond;
    if (accepted.filmLine !== null && (signOff.timing === null
      || signOff.timing.startSecond !== expectedStart
      || signOff.timing.endSecond !== plan.basePlan.duration
      || signOff.timing.endSecond > 15
      || signOff.timing.startSecond < signatureBeatEndSecond
      || signOff.timing.holdSeconds < MIN_HOLD_SECONDS)) {
      humanTimingFailures.push(
        `${testCase.caseId}: accepted film line timing ${signOff.timing?.startSecond}-${signOff.timing?.endSecond}s violates the accepted ${expectedStart}-15s rule`
      );
    }

    if (!signOff.endingImagePreserved
      || !signOff.postProductionOnly
      || (accepted.filmLine !== null && signOff.seedanceDirection === null)) {
      humanEndingFailures.push(`${testCase.caseId}: accepted closing text does not stay a post-production overlay`);
    }

    humanCaseReports.push({
      caseId: testCase.caseId,
      title: treatment.title,
      endingImage: treatment.endingImage,
      mode: signOff.mode,
      filmLine: signOff.filmLine,
      timing: signOff.timing,
      authority: signOff.authority,
    });
  }

  assert(humanLogoTokenFailures.length === 0, `Human automatic logo failures: ${humanLogoTokenFailures.join(" | ")}`);
  assert(humanFilmLineFailures.length === 0, `Human film line failures: ${humanFilmLineFailures.join(" | ")}`);
  assert(humanModeFailures.length === 0, `Human sign-off mode failures: ${humanModeFailures.join(" | ")}`);
  assert(humanTimingFailures.length === 0, `Human film line timing failures: ${humanTimingFailures.join(" | ")}`);
  assert(humanEndingFailures.length === 0, `Human ending image failures: ${humanEndingFailures.join(" | ")}`);
  assert(humanLineReuse.length === 0, `Human film line reuse: ${humanLineReuse.join(" | ")}`);
  assert(
    acceptedFilmLineCount === 7 && acceptedNoFilmLineCount === 5,
    `Accepted distribution must be 7 / 5, received ${acceptedFilmLineCount} / ${acceptedNoFilmLineCount}.`
  );

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    join(outputDirectory, "BRAND_SIGNOFF_REPORT.md"),
    [
      "# COMMERCIAL FILM V1.4 CLOSING-TEXT REPORT (GENERATED)",
      "",
      "GENERATED closing text from the Brand Sign-off engine. The human-approved values are authoritative for the",
      "acceptance pack and live in `BRAND_SIGNOFF_FINAL_ACCEPTANCE.md`.",
      "",
      "Same 12 cases as V1.4.4. Creative treatments are unchanged; this report only carries the optional film line.",
      "Automatic logo: REMOVED. No brand mark, logo overlay, logo animation or end card is generated or requested.",
      `Film line: optional per film, added in post over the ending image (${filmLineCount} films with a film line, ${noFilmLineCount} ending on the ending image alone).`,
      "",
      ...caseReports.flatMap((entry) => [
        `## ${entry.caseId}`,
        "",
        `TITLE: ${entry.title}`,
        `ENDING IMAGE: ${entry.endingImage}`,
        `CLOSING MODE: ${entry.mode}`,
        `FILM LINE: ${entry.filmLine ?? "none (the film ends on the ending image)"}`,
        entry.timing
          ? `FILM LINE TIMING: ${entry.timing.startSecond.toFixed(1)}-${entry.timing.endSecond.toFixed(1)}s (inside the ${entry.timing.endSecond.toFixed(1)}s film)`
          : "FILM LINE TIMING: none",
        "",
      ]),
    ].join("\n")
  );
  await writeFile(
    join(outputDirectory, "BRAND_SIGNOFF_FINAL_ACCEPTANCE.md"),
    [
      "# COMMERCIAL FILM V1.4 CLOSING-TEXT FINAL ACCEPTANCE",
      "",
      "HUMAN-APPROVED CLOSING TEXT. This record is authoritative for the upcoming visual acceptance pack.",
      "It is not the general Brand Sign-off generator output; see `BRAND_SIGNOFF_REPORT.md` for the generated values.",
      "",
      "Automatic logo: REMOVED. Film Line is creatively optional: a missing Film Line is an accepted result, not a fallback.",
      `Accepted distribution: Film Line ${acceptedFilmLineCount} / no Film Line ${acceptedNoFilmLineCount}.`,
      "All closing text stays inside the original 15 second duration; runtime is not extended and the Signature Moment is not shortened.",
      "",
      ...humanCaseReports.flatMap((entry) => [
        `## ${entry.caseId}`,
        "",
        `TITLE: ${entry.title}`,
        `ENDING IMAGE: ${entry.endingImage}`,
        `FINAL MODE: ${entry.mode}`,
        `FINAL FILM LINE: ${entry.filmLine ?? "null (no closing text)"}`,
        entry.timing
          ? `TIMING: ${entry.timing.startSecond.toFixed(1)}-${entry.timing.endSecond.toFixed(1)}s`
          : "TIMING: none",
        "AUTHORITY: HUMAN_APPROVED",
        "",
      ]),
    ].join("\n")
  );
  await writeFile(
    join(outputDirectory, "brand-signoff-regression.json"),
    `${JSON.stringify({
      schemaVersion: api.COMMERCIAL_BRAND_SIGNOFF_SCHEMA_VERSION,
      stage: "COMMERCIAL_FILM_V1_4_BRAND_SIGNOFF",
      automaticLogo: "REMOVED",
      generatedCases: caseReports,
      humanApprovedCases: humanCaseReports,
      acceptedDistribution: {
        filmLine: acceptedFilmLineCount,
        noFilmLine: acceptedNoFilmLineCount,
      },
    }, null, 2)}\n`
  );

  console.log("COMMERCIAL FILM V1.4 BRAND-SIGNOFF VALIDATION PASS:", JSON.stringify({
    cases: matrix.cases.length,
    automaticLogo: "REMOVED",
    automaticLogoTokenFailures: logoTokenFailuresList.length,
    filmLineFailures: filmLineFailures.length,
    permanentSloganFailures: sloganFailures.length,
    timingFailures: timingFailures.length,
    endingOverwriteFailures: endingOverwriteFailures.length,
    creativeEngineDrift,
    filmsWithFilmLine: filmLineCount,
    filmsWithoutFilmLine: noFilmLineCount,
    acceptanceRecord: humanAcceptancePath,
    acceptedFilmLineCases: acceptedFilmLineCount,
    acceptedNoFilmLineCases: acceptedNoFilmLineCount,
    humanAutomaticLogoFailures: humanLogoTokenFailures.length,
    humanFilmLineFailures: humanFilmLineFailures.length,
    humanModeFailures: humanModeFailures.length,
    humanTimingFailures: humanTimingFailures.length,
    humanEndingFailures: humanEndingFailures.length,
    humanFilmLineReuse: humanLineReuse.length,
    v13CanonicalBaseline: "UNCHANGED",
    v13ProtectedSources: "UNCHANGED",
    narrativeModified: "NO",
    actionsModified: "NO",
    v14VisualStatus: "NOT_VERIFIED",
    output: outputDirectory,
  }, null, 2));
} catch (error) {
  console.error(
    "COMMERCIAL FILM V1.4 BRAND-SIGNOFF VALIDATION FAILED:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
}
