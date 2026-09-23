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

const BRAND_MARK = "THERUIZ AURA";
const VALID_MODES = [
  "LOGO_ONLY",
  "LOGO_OVER_ENDING_IMAGE",
  "LOGO_AND_FILM_LINE_OVER_ENDING_IMAGE",
  "END_CARD_LOGO_ONLY",
  "END_CARD_LOGO_AND_FILM_LINE",
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
const DIRECTOR_SCRIPT_ORDER = [
  "CREATIVE PROPOSITION",
  "DIRECTOR CONCEPT",
  "CINEMATIC DEVICE",
  "SIGNATURE MOMENT",
  "FILM ARC",
  "SHOT 1 — ",
  "ENDING IMAGE",
  "BRAND-SIGN-OFF",
  "SEEDANCE EXECUTION DIRECTION",
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

function directorScriptOrderFailures(script) {
  const indices = DIRECTOR_SCRIPT_ORDER.map((token) => script.indexOf(token));
  const lines = script.split("\n");
  const firstLine = lines[0].trim();
  const titleLinePresent = firstLine.length > 4
    && !DIRECTOR_SCRIPT_ORDER.includes(firstLine)
    && lines[1] === "";
  const orderPresent = indices.every((index) => index >= 0)
    && indices.every((index, position) => position === 0 || index > indices[position - 1]);
  return orderPresent && titleLinePresent
    ? []
    : ["director script order is not title -> proposition -> concept -> device -> moment -> arc -> shots -> ending -> sign-off -> execution direction"];
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

  const brandMarkFailures = [];
  const filmLineFailures = [];
  const sloganFailures = [];
  const timingFailures = [];
  const endingOverwriteFailures = [];
  const creativeEngineDrift = [];
  const caseReports = [];
  const seenLines = new Map();
  let filmLineCount = 0;
  let logoOnlyCount = 0;

  for (const testCase of matrix.cases) {
    const outcome = api.runCommercialV14Pipeline(v14RequestForCase(testCase));
    assert(outcome.status === "GENERATED", `${testCase.caseId} V1.4 pipeline blocked.`);
    const plan = outcome.plan;
    const treatment = plan.creativeTreatment;
    const signOff = plan.presentation.brandSignOff;
    assert(signOff, `${testCase.caseId} has no brand sign-off record.`);

    if (signOff.brandMark !== BRAND_MARK) {
      brandMarkFailures.push(`${testCase.caseId}: brand mark is ${signOff.brandMark}`);
    }
    if (!VALID_MODES.includes(signOff.mode)) {
      brandMarkFailures.push(`${testCase.caseId}: unknown sign-off mode ${signOff.mode}`);
    }

    const leakedSloganKeys = sloganKeys(signOff);
    if (leakedSloganKeys.length > 0) {
      sloganFailures.push(`${testCase.caseId}: permanent slogan field ${leakedSloganKeys.join(", ")}`);
    }

    if (signOff.filmLine === null) {
      logoOnlyCount += 1;
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
    const hold = Math.round((timing.endSecond - timing.startSecond) * 100) / 100;
    if (timing.endSecond !== plan.basePlan.duration
      || signOff.filmDurationSeconds !== plan.basePlan.duration
      || plan.basePlan.duration > 15
      || timing.startSecond >= timing.endSecond
      || timing.startSecond < signatureBeatEndSecond
      || timing.startSecond < endingImageStartSecond
      || hold !== timing.holdSeconds
      || hold < MIN_HOLD_SECONDS) {
      timingFailures.push(
        `${testCase.caseId}: sign-off timing ${timing.startSecond}-${timing.endSecond}s is not inside the ${plan.basePlan.duration}s film`
      );
    }

    const script = plan.presentation.presentationScript;
    const endingImageIndex = script.indexOf(`ENDING IMAGE\n${treatment.endingImage}`);
    const signOffIndex = script.indexOf("BRAND-SIGN-OFF");
    const directionIndex = script.indexOf("SEEDANCE EXECUTION DIRECTION");
    if (endingImageIndex < 0) {
      endingOverwriteFailures.push(`${testCase.caseId}: ending image is missing from the director script`);
    }
    if (signOffIndex < 0 || directionIndex < 0) {
      endingOverwriteFailures.push(`${testCase.caseId}: brand sign-off block is missing from the director script`);
    }
    if (endingImageIndex >= 0 && signOffIndex >= 0 && directionIndex >= 0
      && !(endingImageIndex < signOffIndex && signOffIndex < directionIndex)) {
      endingOverwriteFailures.push(`${testCase.caseId}: sign-off does not follow the ending image`);
    }
    for (const failure of directorScriptOrderFailures(script)) {
      endingOverwriteFailures.push(`${testCase.caseId}: ${failure}`);
    }
    if (signOff.presentation !== "OVERLAY_OVER_ENDING_IMAGE" || !signOff.endingImagePreserved) {
      endingOverwriteFailures.push(`${testCase.caseId}: sign-off does not preserve the ending image`);
    }
    if (!signOff.postProductionOnly || !/(?:post overlay|applied in post)/i.test(signOff.seedanceDirection)) {
      endingOverwriteFailures.push(`${testCase.caseId}: brand mark is not framed as a post overlay`);
    }
    if (!/\bdo not render brand lettering\b/i.test(signOff.seedanceDirection)) {
      endingOverwriteFailures.push(`${testCase.caseId}: sign-off does not protect against generated brand typography`);
    }
    if (!plan.presentation.v14CompiledText.includes(`Brand sign-off: hold ${timing.startSecond.toFixed(1)}-`)
      || !plan.presentation.v14CompiledText.includes(`Brand mark: ${BRAND_MARK} is applied in post`)
      || !plan.presentation.v14CompiledText.includes("do not render brand lettering")) {
      endingOverwriteFailures.push(`${testCase.caseId}: model-facing extension has no sign-off direction`);
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
      brandMark: signOff.brandMark,
      filmLine: signOff.filmLine,
      timing,
      presentation: signOff.presentation,
      sourceEvents: plan.presentation.sourceEvents,
      presentationScriptSha256: sha256(script),
      v14CompiledTextSha256: sha256(plan.presentation.v14CompiledText),
      treatmentSha256: hashCommercialTreatment(treatment),
    });
  }

  assert(brandMarkFailures.length === 0, `Brand mark failures: ${brandMarkFailures.join(" | ")}`);
  assert(filmLineFailures.length === 0, `Film line failures: ${filmLineFailures.join(" | ")}`);
  assert(sloganFailures.length === 0, `Permanent slogan risk: ${sloganFailures.join(" | ")}`);
  assert(timingFailures.length === 0, `Sign-off timing failures: ${timingFailures.join(" | ")}`);
  assert(endingOverwriteFailures.length === 0, `Ending image failures: ${endingOverwriteFailures.join(" | ")}`);
  assert(creativeEngineDrift.length === 0, `Creative engine drift: ${creativeEngineDrift.join(", ")}`);

  const humanAcceptancePath = join(outputDirectory, "BRAND_SIGNOFF_HUMAN_ACCEPTANCE.json");
  const humanAcceptance = await readJson(humanAcceptancePath);
  assert(
    humanAcceptance.authority === "HUMAN_APPROVED",
    "Human acceptance record does not declare HUMAN_APPROVED authority."
  );
  assert(
    humanAcceptance.brandMark === BRAND_MARK,
    "Human acceptance record declares a different brand mark."
  );
  const humanByCaseId = new Map(
    humanAcceptance.cases.map((entry) => [entry.caseId, entry])
  );
  assert(humanByCaseId.size === 12, `Human acceptance record needs 12 cases, received ${humanByCaseId.size}.`);

  const humanBrandMarkFailures = [];
  const humanFilmLineFailures = [];
  const humanModeFailures = [];
  const humanTimingFailures = [];
  const humanEndingFailures = [];
  const humanLineReuse = [];
  const humanCaseReports = [];
  const acceptedLines = new Map();
  let acceptedFilmLineCount = 0;
  let acceptedLogoOnlyCount = 0;

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
      humanAcceptance: { filmLine: accepted.filmLine, mode: accepted.mode },
    });

    if (signOff.authority !== "HUMAN_APPROVED" || signOff.brandMark !== BRAND_MARK) {
      humanBrandMarkFailures.push(`${testCase.caseId}: accepted record is not branded as HUMAN_APPROVED ${BRAND_MARK}`);
    }
    if (signOff.filmLine !== accepted.filmLine || signOff.mode !== accepted.mode) {
      humanModeFailures.push(`${testCase.caseId}: accepted sign-off does not match the recorded decision`);
    }
    if (accepted.filmLine === null) {
      acceptedLogoOnlyCount += 1;
      if (accepted.mode !== "LOGO_ONLY") {
        humanModeFailures.push(`${testCase.caseId}: logo-only decision is not recorded as LOGO_ONLY`);
      }
    } else {
      acceptedFilmLineCount += 1;
      const normalized = accepted.filmLine.replace(/[.!?]+$/, "").toLowerCase();
      if (accepted.mode !== "LOGO_AND_FILM_LINE_OVER_ENDING_IMAGE") {
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

    const expectedStart = accepted.filmLine === null
      ? humanAcceptance.timingRule.logoOnly.startSecond
      : humanAcceptance.timingRule.withFilmLine.startSecond;
    const signatureBeatEndSecond =
      shots[treatment.signatureMoment.signatureBeatIndex]?.endSecond ?? 0;
    if (signOff.timing.startSecond !== expectedStart
      || signOff.timing.endSecond !== plan.basePlan.duration
      || signOff.timing.endSecond > 15
      || signOff.timing.startSecond < signatureBeatEndSecond
      || signOff.timing.holdSeconds < MIN_HOLD_SECONDS) {
      humanTimingFailures.push(
        `${testCase.caseId}: accepted sign-off timing ${signOff.timing.startSecond}-${signOff.timing.endSecond}s violates the accepted ${expectedStart}-15s rule`
      );
    }

    if (signOff.presentation !== "OVERLAY_OVER_ENDING_IMAGE"
      || !signOff.endingImagePreserved
      || !signOff.postProductionOnly
      || !/(?:post overlay|applied in post)/i.test(signOff.seedanceDirection)
      || !/\bdo not render brand lettering\b/i.test(signOff.seedanceDirection)) {
      humanEndingFailures.push(`${testCase.caseId}: accepted sign-off does not stay a post overlay over the ending image`);
    }

    humanCaseReports.push({
      caseId: testCase.caseId,
      title: treatment.title,
      endingImage: treatment.endingImage,
      mode: signOff.mode,
      brandMark: signOff.brandMark,
      filmLine: signOff.filmLine,
      timing: signOff.timing,
      authority: signOff.authority,
      presentation: signOff.presentation,
    });
  }

  assert(humanBrandMarkFailures.length === 0, `Human brand mark failures: ${humanBrandMarkFailures.join(" | ")}`);
  assert(humanFilmLineFailures.length === 0, `Human film line failures: ${humanFilmLineFailures.join(" | ")}`);
  assert(humanModeFailures.length === 0, `Human sign-off mode failures: ${humanModeFailures.join(" | ")}`);
  assert(humanTimingFailures.length === 0, `Human sign-off timing failures: ${humanTimingFailures.join(" | ")}`);
  assert(humanEndingFailures.length === 0, `Human ending image failures: ${humanEndingFailures.join(" | ")}`);
  assert(humanLineReuse.length === 0, `Human film line reuse: ${humanLineReuse.join(" | ")}`);
  assert(
    acceptedFilmLineCount === 7 && acceptedLogoOnlyCount === 5,
    `Accepted distribution must be 7 / 5, received ${acceptedFilmLineCount} / ${acceptedLogoOnlyCount}.`
  );

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    join(outputDirectory, "BRAND_SIGNOFF_REPORT.md"),
    [
      "# COMMERCIAL FILM V1.4 BRAND-SIGNOFF REPORT (GENERATED SIGN-OFF)",
      "",
      "GENERATED SIGN-OFF from the Brand Sign-off engine. The human-approved values are authoritative for the",
      "acceptance pack and live in `BRAND_SIGNOFF_FINAL_ACCEPTANCE.md`.",
      "",
      "Same 12 cases as V1.4.4. Creative treatments are unchanged; this report only adds the brand sign-off layer.",
      `Brand mark: ${BRAND_MARK}. Film line: optional per film, added in post over the ending image.`,
      `Sign-off lives inside the 15 second film (${filmLineCount} films with a film line, ${logoOnlyCount} logo only).`,
      "",
      ...caseReports.flatMap((entry) => [
        `## ${entry.caseId}`,
        "",
        `TITLE: ${entry.title}`,
        `ENDING IMAGE: ${entry.endingImage}`,
        `BRAND SIGN-OFF MODE: ${entry.mode}`,
        `BRAND MARK: ${entry.brandMark}`,
        `FILM LINE: ${entry.filmLine ?? "none (logo only)"}`,
        `SIGN-OFF TIMING: ${entry.timing.startSecond.toFixed(1)}-${entry.timing.endSecond.toFixed(1)}s (inside the ${entry.timing.endSecond.toFixed(1)}s film)`,
        "",
      ]),
    ].join("\n")
  );
  await writeFile(
    join(outputDirectory, "BRAND_SIGNOFF_FINAL_ACCEPTANCE.md"),
    [
      "# COMMERCIAL FILM V1.4 BRAND-SIGNOFF FINAL ACCEPTANCE",
      "",
      "HUMAN-APPROVED SIGN-OFF. This record is authoritative for the upcoming visual acceptance pack.",
      "It is not the general Brand Sign-off generator output; see `BRAND_SIGNOFF_REPORT.md` for the generated values.",
      "",
      `Brand mark: ${BRAND_MARK}. Film Line is creatively optional: a missing Film Line is an accepted result, not a fallback.`,
      `Accepted distribution: Film Line ${acceptedFilmLineCount} / Logo Only ${acceptedLogoOnlyCount}.`,
      "All sign-off stays inside the original 15 second duration; runtime is not extended and the Signature Moment is not shortened.",
      "",
      ...humanCaseReports.flatMap((entry) => [
        `## ${entry.caseId}`,
        "",
        `TITLE: ${entry.title}`,
        `ENDING IMAGE: ${entry.endingImage}`,
        `FINAL MODE: ${entry.mode}`,
        `BRAND MARK: ${entry.brandMark}`,
        `FINAL FILM LINE: ${entry.filmLine ?? "null (LOGO_ONLY)"}`,
        `TIMING: ${entry.timing.startSecond.toFixed(1)}-${entry.timing.endSecond.toFixed(1)}s`,
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
      brandMark: BRAND_MARK,
      generatedCases: caseReports,
      humanApprovedCases: humanCaseReports,
      acceptedDistribution: {
        filmLine: acceptedFilmLineCount,
        logoOnly: acceptedLogoOnlyCount,
      },
    }, null, 2)}\n`
  );

  console.log("COMMERCIAL FILM V1.4 BRAND-SIGNOFF VALIDATION PASS:", JSON.stringify({
    cases: matrix.cases.length,
    brandMarkFailures: brandMarkFailures.length,
    filmLineFailures: filmLineFailures.length,
    permanentSloganFailures: sloganFailures.length,
    timingFailures: timingFailures.length,
    endingOverwriteFailures: endingOverwriteFailures.length,
    creativeEngineDrift,
    filmsWithFilmLine: filmLineCount,
    filmsLogoOnly: logoOnlyCount,
    acceptanceRecord: humanAcceptancePath,
    acceptedFilmLineCases: acceptedFilmLineCount,
    acceptedLogoOnlyCases: acceptedLogoOnlyCount,
    humanBrandMarkFailures: humanBrandMarkFailures.length,
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
