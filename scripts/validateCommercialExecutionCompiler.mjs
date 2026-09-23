import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-compiler-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

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
  referenceSetId: "commercial-compiler-reference-set",
  taskId: "commercial-compiler-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 3,
  confirmedAssetIds: ["front", "side", "material"],
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

  let compiled = 0;
  let validated = 0;
  let shotBlocksChecked = 0;
  let internalMarkerLeaks = 0;
  let actionIdLeaks = 0;
  let qcLanguageLeaks = 0;
  let nonDeterministic = 0;
  const perIntent = [];

  for (const intent of intents) {
    const request = {
      commercialIntent: intent,
      characterSelection: { ageProfileId: "age_38_42", appearanceGroupId: "european" },
      season: "冬",
      lifestyleFeeling: "轻奢 / 克制 / 自然",
      duration: 15,
      reference,
    };
    const outcome = runCommercialFilmPipeline(request);
    assert(outcome.status === "GENERATED", `${intent} did not compile: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`);
    const script = outcome.modelFacingScript;
    const text = script.compiledText;
    compiled += 1;
    if (outcome.executionValidation.status === "COMMERCIAL_EXECUTION_VALIDATED") validated += 1;

    for (const marker of [
      "SEEDANCE — COMMERCIAL FILM",
      "[FILM IDEA]",
      "[CHARACTER / WORLD]",
      "[TIMING]",
      "SHOT 1 — WORLD",
      "SHOT 2 — WEAR",
      "SHOT 3 — DETAIL",
      "SHOT 4 — HERO",
      "SHOT 5 — RELEASE",
      "[SOUND WORLD]",
      "[VISUAL LOOK]",
      "[GLOBAL PRODUCT PROTECTION]",
      "[NEGATIVES]",
    ]) {
      assert(text.includes(marker), `${intent} is missing ${marker}.`);
    }
    for (const internal of ["[COMMERCIAL PLAN]", "[SHOT PLAN]", "[CAMERA PLAN]", "[SOUND PLAN]", "[REFERENCE STATE]"]) {
      if (text.includes(internal)) internalMarkerLeaks += 1;
      assert(!text.includes(internal), `${intent} leaked ${internal}.`);
    }
    if (/\b(?:walking|transition|standing|turning|garment-task|scene-interaction|environment-response|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(text)) {
      actionIdLeaks += 1;
    }
    if (/\b(?:QC|validator|validation status|source id|primitive id|enum)\b/i.test(text)) {
      qcLanguageLeaks += 1;
    }
    assert(!/\b(?:walking|transition|standing|turning|garment-task|scene-interaction|environment-response|on-foot|seated|studio-[a-z-]+|mirror-[a-z-]+)-\d{3}\b/i.test(text), `${intent} leaked an Action ID.`);
    assert(!/\b(?:QC|validator|validation status|source id|primitive id|enum)\b/i.test(text), `${intent} leaked QC language.`);
    const durations = outcome.plan.shotArchitecture.shots.map((shot) => shot.timeRange.durationSeconds);
    assert(Math.abs(durations.reduce((sum, duration) => sum + duration, 0) - 15) < 0.01, `${intent} timing does not sum to 15s.`);
    assert(new Set(durations).size > 1, `${intent} timing is still equal across shots.`);
    assert(text.includes(`Time: ${outcome.plan.shotArchitecture.shots[0].timeRange.startSecond.toFixed(1)}-${outcome.plan.shotArchitecture.shots[0].timeRange.endSecond.toFixed(1)}s`), `${intent} SHOT 1 timing is wrong.`);
    assert(text.includes(`Time: ${outcome.plan.shotArchitecture.shots[4].timeRange.startSecond.toFixed(1)}-${outcome.plan.shotArchitecture.shots[4].timeRange.endSecond.toFixed(1)}s`), `${intent} SHOT 5 timing is wrong.`);
    assert(!text.includes("MOMENT "), `${intent} reused Narrative Moment language.`);
    assert(!text.includes("Product Presence"), `${intent} reused Narrative Product Presence language.`);
    assert(!text.includes("Camera Narrative Role"), `${intent} reused Narrative Camera Role language.`);
    assert(!text.includes("music bed") && !text.includes("voiceover narration"), `${intent} added music or narration.`);
    assert(text.includes("No dialogue, no voiceover, no music unless explicitly requested."), `${intent} does not prohibit music, voiceover, and dialogue.`);
    assert(!text.includes("ACTION PRIMITIVE") && !text.includes("SOURCE ID"), `${intent} leaked internal source language.`);

    const rerun = runCommercialFilmPipeline(request);
    if (rerun.status !== "GENERATED" || rerun.modelFacingScript.compiledText !== text) {
      nonDeterministic += 1;
    }
    assert(rerun.status === "GENERATED" && rerun.modelFacingScript.compiledText === text, `${intent} is not deterministic.`);

    shotBlocksChecked += script.shotBlocks.length;
    perIntent.push({
      intent,
      compilerStatus: outcome.executionValidation.status,
      shotBlocks: script.shotBlocks.length,
      modelFacingLength: script.diagnostics.modelFacingLength,
      referenceCount: script.diagnostics.referenceCount,
    });
  }

  const zeroReferenceOutcome = runCommercialFilmPipeline({
    commercialIntent: "URBAN_MOTION",
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    duration: 15,
    reference: {
      ...reference,
      referenceSetId: "zero-reference-compiler-set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: coverage,
      referencePlanReady: false,
      productTruth: null,
    },
  });
  assert(zeroReferenceOutcome.status === "GENERATED", "Zero-reference Commercial Film compiler path was blocked.");
  assert(zeroReferenceOutcome.modelFacingScript.compiledText.includes("Use the footwear reference images uploaded in the external video generation tool as the only source of truth for the product."), "Zero-reference compiler output lacks external-reference protection.");
  assert(!/\b(?:burgundy|ivory|leather|suede|mesh|outsole construction|logo detail)\b/i.test(zeroReferenceOutcome.modelFacingScript.compiledText), "Zero-reference compiler output invented an exact product fact.");

  assert(compiled === 5, `${compiled}/5 intents compiled.`);
  assert(validated === 5, `${validated}/5 execution validations passed.`);
  assert(shotBlocksChecked === 25, `${shotBlocksChecked}/25 shot blocks checked.`);
  assert(internalMarkerLeaks === 0, `${internalMarkerLeaks} internal marker leaks remain.`);
  assert(actionIdLeaks === 0, `${actionIdLeaks} Action ID leaks remain.`);
  assert(qcLanguageLeaks === 0, `${qcLanguageLeaks} QC-language leaks remain.`);
  assert(nonDeterministic === 0, `${nonDeterministic} deterministic compilation failures remain.`);

  console.log("COMMERCIAL EXECUTION COMPILER V1 VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_EXECUTION_COMPILER_V1",
    intents: intents.length,
    compiled,
    validated,
    shotBlocksChecked,
    internalMarkerLeaks,
    actionIdLeaks,
    qcLanguageLeaks,
    nonDeterministic,
    zeroReferenceGeneration: zeroReferenceOutcome.status,
    perIntent,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
