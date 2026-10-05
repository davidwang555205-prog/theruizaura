import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { stableStringify } from "./commercialV13Harness.mjs";

const root = resolve(import.meta.dirname, "..");
const temp = await mkdtemp(join(tmpdir(), "theruizaura-face-presence-"));
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const intents = ["QUIET_LUXURY", "URBAN_MOTION", "DAILY_STYLING", "NEW_ARRIVAL", "PRODUCT_CRAFT"];
const coverage = ["silhouette", "toe_structure", "side_panel_structure", "heel_structure", "outsole_profile", "color_blocking", "material_evidence"];
const reference = {
  referenceSetId: "face-presence-validation",
  taskId: "face-presence-validation",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 2,
  confirmedAssetIds: ["front", "side"],
  coverage,
  missingCoverage: [],
  referencePlanReady: true,
  productTruthMode: "reference_bound",
  productTruth: { coverage, status: "draft", referenceEvidenceBound: true, productTruthMode: "reference_bound" },
};

function request(intent) {
  return {
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    generationNonce: 0,
    reference,
  };
}

function expectMissing(api, cameraPlan, label) {
  const result = api.validateCommercialCharacterFacePresence(cameraPlan);
  assert(result.status === "FAIL" && result.code === "CHARACTER_FACE_PRESENCE_MISSING", `${label} should fail with the face-presence code.`);
}

function compareBaseline(before, after, intent) {
  const protectedFields = [
    "eventSpine", "continuity", "productVisibilityPlan", "creativeSpine", "creativeDirection",
    "directorConcept", "character", "actionPlan", "endingStrategy", "referenceState",
  ];
  for (const field of protectedFields) {
    assert(stableStringify(before[field]) === stableStringify(after[field]), `${intent} changed protected ${field}.`);
  }
  assert(stableStringify(before.shotArchitecture.shots.map(({ camera, ...shot }) => shot))
    === stableStringify(after.shotArchitecture.shots.map(({ camera, ...shot }) => shot)), `${intent} changed non-camera shot architecture.`);
}

try {
  const entry = join(temp, "entry.ts");
  const bundle = join(temp, "bundle.mjs");
  await writeFile(entry, `export * from ${JSON.stringify(resolve(root, "src/commercial-film/index.ts"))};\nexport * from ${JSON.stringify(resolve(root, "src/commercial-film/brand-adapter/index.ts"))};\n`);
  await build({ entryPoints: [entry], bundle: true, format: "esm", platform: "node", outfile: bundle, logLevel: "silent" });
  const api = await import(pathToFileURL(bundle).href);
  const baselineArg = process.argv.indexOf("--baseline");
  const baseline = baselineArg >= 0
    ? JSON.parse(await readFile(process.argv[baselineArg + 1], "utf8"))
    : null;
  const baselineByIntent = new Map((baseline ?? []).map((entry) => [entry.intent, entry.outcome]));

  for (const intent of intents) {
    const input = baseline?.find((entry) => entry.intent === intent)?.request ?? request(intent);
    const outcome = api.runCommercialFilmPipeline(input);
    assert(outcome.status === "GENERATED", `${intent} failed to generate: ${outcome.code} ${outcome.diagnostics?.join(" | ")}`);
    const plan = outcome.plan;
    assert(plan.shotArchitecture.shots.length === 5, `${intent} changed beat count.`);
    const face = api.validateCommercialCharacterFacePresence(plan.cameraPlan);
    assert(face.status === "PASS", `${intent} lacks a face-readable beat.`);
    const faceShot = plan.cameraPlan.shots[face.beatIndex];
    assert(!["DETAIL", "RELEASE"].includes(faceShot.shotRole), `${intent} used DETAIL or RELEASE for face presence.`);
    assert(faceShot.viewAngle === "three_quarter_front" || faceShot.viewAngle === "profile_parallel", `${intent} used a rear angle.`);
    assert(plan.cameraPlan.shots[4].shotRole === "RELEASE" && plan.cameraPlan.shots[4].viewAngle === "three_quarter_back", `${intent} changed the rear-facing RELEASE.`);
    assert(/head, face, and upper-body context naturally readable/.test(faceShot.framing), `${intent} cropped the face.`);
    assert(/without direct eye contact, portrait posing, or camera-aware performance/.test(faceShot.movementLine), `${intent} lost the observational constraint.`);
    const prompt = outcome.modelFacingScript.compiledText;
    assert(prompt.includes("Character face presence:") && prompt.includes("No forced direct eye contact, portrait posing, or camera-aware performance."), `${intent} lost the model-facing face rule.`);
    assert(prompt.includes("no performance toward camera"), `${intent} lost the existing camera-performance prohibition.`);
    assert(!/must (?:look at|face) (?:the )?camera|beauty close-up|portrait shot/i.test(prompt), `${intent} introduced camera-facing performance.`);
    if (baselineByIntent.has(intent)) {
      const before = baselineByIntent.get(intent);
      assert(before.status === "GENERATED", `${intent} baseline was not generated.`);
      compareBaseline(before.plan, plan, intent);
    }
    const brand = api.runCommercialFilmWithBrandPack({
      brandPack: api.THERUIZ_AURA_BRAND_PACK_V1,
      request: input,
      caseContext: "Face presence validation",
    });
    const previousCameraFeeling = "Observational, grounded, and unobtrusive; movement follows visible action.";
    const legacyVisualPack = {
      ...api.THERUIZ_AURA_BRAND_PACK_V1,
      visualLanguage: { ...api.THERUIZ_AURA_BRAND_PACK_V1.visualLanguage, cameraFeeling: previousCameraFeeling },
    };
    const brandWithoutFaceText = api.runCommercialFilmWithBrandPack({
      brandPack: legacyVisualPack,
      request: input,
      caseContext: "Face presence validation",
    });
    assert(stableStringify(brand.brandContext?.wardrobe) === stableStringify(brandWithoutFaceText.brandContext?.wardrobe), `${intent} changed wardrobe.`);
    assert(stableStringify(brand.intentStrategy) === stableStringify(brandWithoutFaceText.intentStrategy), `${intent} changed Intent Strategy.`);
    assert(brand.baseOutcome.status === "GENERATED" && brandWithoutFaceText.baseOutcome.status === "GENERATED", `${intent} Brand Pack base plan did not generate.`);
    compareBaseline(brandWithoutFaceText.baseOutcome.plan, brand.baseOutcome.plan, `${intent} Brand Pack`);
    console.log(`${intent}: FACE BEAT ${face.beatIndex + 1} (${faceShot.shotRole}); direct-to-camera NO; ${baseline ? "Event/Product Visibility unchanged" : "baseline comparison NOT RUN"}; Wardrobe/Intent Strategy unchanged`);
    plan.cameraPlan.shots.forEach((shot) => console.log(`  Beat ${shot.shotIndex + 1} ${shot.shotRole}: ${shot.viewAngle} | ${shot.framing}`));
    if (brand.outcome.status === "GENERATED") {
      const finalPrompt = brand.outcome.plan.seedancePrompt.text;
      assert(finalPrompt.includes("Character presence:") && finalPrompt.includes("head, face, and upper-body context naturally readable"), `${intent} final Seedance prompt lost face presence.`);
      assert(finalPrompt.includes("influencer posing or direct-to-camera performance"), `${intent} lost the existing negative.`);
      console.log(`  Final Execution Plan ${brand.outcome.plan.finalExecutionPlan.status}; Brand Seedance Face Presence PASS`);
    } else {
      assert(intent === "QUIET_LUXURY" && brand.outcome.code === "DIRECTOR_CONCEPT_EVENT_INCOMPATIBLE", `${intent} brand run blocked unexpectedly: ${brand.outcome.code}`);
      console.log(`  Existing Brand/Final Execution block: ${brand.outcome.code}`);
    }
  }

  const sample = api.runCommercialFilmPipeline(request("URBAN_MOTION"));
  assert(sample.status === "GENERATED", "Negative-case sample did not generate.");
  const stripped = structuredClone(sample.plan.cameraPlan);
  stripped.shots.forEach((shot) => { shot.framing = shot.framing.split("; head, face, and upper-body context naturally readable")[0]; });
  expectMissing(api, stripped, "No face-readable beat");
  const shortPlan = structuredClone(sample.plan.cameraPlan);
  shortPlan.shots.pop();
  expectMissing(api, shortPlan, "Four-beat plan");
  for (const [label, change] of [
    ["DETAIL only", (shot) => { shot.shotRole = "DETAIL"; }],
    ["RELEASE only", (shot) => { shot.shotRole = "RELEASE"; }],
    ["Lower-body", (shot) => { shot.framing = `lower-body ${shot.framing}`; }],
    ["Rear angle", (shot) => { shot.viewAngle = "three_quarter_back"; }],
    ["Severe occlusion", (shot) => { shot.framing = `severely occluded ${shot.framing}`; }],
  ]) {
    const negative = structuredClone(stripped);
    const target = structuredClone(sample.plan.cameraPlan.shots[1]);
    change(target);
    negative.shots[1] = target;
    expectMissing(api, negative, label);
  }
  const noCandidate = structuredClone(stripped);
  noCandidate.shots.forEach((shot) => { if (shot.shotRole !== "DETAIL" && shot.shotRole !== "RELEASE") shot.framing = `lower-body ${shot.framing}`; });
  api.applyCommercialCharacterFacePresence(noCandidate, "URBAN_MOTION", sample.plan.creativeDirection);
  expectMissing(api, noCandidate, "All candidate beats physically incompatible");
  const profile = structuredClone(stripped);
  profile.shots[1].viewAngle = "profile_parallel";
  api.applyCommercialCharacterFacePresence(profile, "URBAN_MOTION", sample.plan.creativeDirection);
  assert(api.validateCommercialCharacterFacePresence(profile).status === "PASS", "A naturally readable profile should satisfy face presence.");
  const zeroReference = {
    ...reference,
    referenceSetId: "face-presence-craft-zero",
    confirmationStatus: "incomplete",
    confirmedReferenceCount: 0,
    confirmedAssetIds: [],
    coverage: [],
    missingCoverage: coverage,
    referencePlanReady: false,
    productTruth: null,
  };
  const craftZero = api.runCommercialFilmPipeline({ ...request("PRODUCT_CRAFT"), reference: zeroReference });
  assert(craftZero.status === "BLOCKED", "PRODUCT_CRAFT bypassed missing evidence because of face presence.");
  console.log("Negative cases: missing, four beats, DETAIL-only, RELEASE-only, lower-body, rear angle, severe occlusion, no eligible beat: PASS");
  console.log("Readable profile: PASS; rear-facing RELEASE: allowed; PRODUCT_CRAFT zero reference: BLOCKED");
} finally {
  await rm(temp, { recursive: true, force: true });
}
