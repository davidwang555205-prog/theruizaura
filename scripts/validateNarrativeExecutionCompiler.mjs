import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Model-Facing Execution Compiler V1.1: canonical boundary consumption, safe
// continuation, sound evidence, camera persistence, spatial/closure fail-closed.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-execution-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const INTERNAL_MARKERS = [
  "CORRECT_UNSUPPORTED",
  "REAL_CAPABILITY_GAP",
  "SMALL_OBJECT_RETRIEVAL",
  "CONTAINER_OBJECT_SEARCH",
  "EXACT stride phase",
  "Capability Matrix",
  "Eligibility",
  "narrative-",
  "[NARRATIVE CORE]",
];
const PRODUCT_FACTS = ["burgundy", "ivory", "outsole", "leather", "suede", "toe box", "color blocking", "heel counter", "laces", "silhouette"];

const request = (topic) => ({
  topic: topic.label,
  characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
  season: "秋",
  lifestyleFeeling: "安静 / 克制",
  availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `exec-${topic.id}-${index}`, label })),
});

try {
  await writeFile(
    entryPath,
    `export { compileModelFacingExecutionScript, validateModelFacingExecutionScript } from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/execution-compiler/index.ts"))};\n` +
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    compileModelFacingExecutionScript,
    validateModelFacingExecutionScript,
    NARRATIVE_TOPIC_CATALOG,
    runImmersiveNarrativePipeline,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const outcomes = new Map();
  const perTopic = [];
  let executable = 0;
  let internalMarkerHits = 0;
  let timelineHoles = 0;
  let productFactHits = 0;
  let determinismFailures = 0;
  let validationFailures = 0;

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline(request(topic));
    assert(outcome.status === "GENERATED", `${topic.label} pipeline blocked`);
    const script = outcome.modelFacingScript;
    outcomes.set(topic.label, outcome);
    if (script.status === "EXECUTABLE") executable += 1;
    if (outcome.executionValidation.status !== "EXECUTION_SCRIPT_VALIDATED") {
      validationFailures += 1;
      throw new Error(`${topic.label} execution validation failed: ${outcome.executionValidation.failureReasons.join(" | ")}`);
    }
    internalMarkerHits += INTERNAL_MARKERS.filter((marker) => script.compiledText.includes(marker)).length;
    if (!script.diagnostics.timelineCoverage.contiguous) timelineHoles += 1;
    productFactHits += PRODUCT_FACTS.filter((token) => new RegExp(`\\b${token}\\b`, "i").test(script.compiledText)).length;
    const rerun = compileModelFacingExecutionScript(outcome.executionInput);
    if (rerun.compiledText !== script.compiledText) determinismFailures += 1;
    perTopic.push({
      topic: topic.label,
      status: script.status,
      spatialGate: script.diagnostics.spatialGate.pass,
      closureGate: script.diagnostics.closureGate.pass,
      safeContinuations: script.diagnostics.safeContinuations.length,
      rejectedSounds: script.diagnostics.rejectedSoundCount,
      productDowngrades: script.diagnostics.productDowngrades,
      cameraStateChanges: script.diagnostics.cameraStateChanges,
      modelFacingLength: script.diagnostics.modelFacingLength,
      internalLength: script.diagnostics.internalScriptLength,
    });
  }

  assert(executable === 13, `${executable} of 13 topics are executable`);
  assert(internalMarkerHits === 0, `${internalMarkerHits} internal markers leaked into model-facing output`);
  assert(timelineHoles === 0, `${timelineHoles} timeline holes remain`);
  assert(productFactHits === 0, `${productFactHits} product facts leaked with zero confirmed references`);
  assert(determinismFailures === 0, `${determinismFailures} non-deterministic outputs`);
  assert(validationFailures === 0, `${validationFailures} execution validations failed`);

  // Home arrival regression.
  const home = outcomes.get("下班回家").modelFacingScript;
  const homeBody = (index) => home.moments[index].bodyBehavior;
  assert(!/finds the key|brings it out/i.test(homeBody(1)), `home M2 advances retrieval: ${homeBody(1)}`);
  assert(/not yet found or brought out/i.test(homeBody(1)), "home M2 does not clamp the search boundary");
  assert(/continues the same quiet search/i.test(homeBody(2)), "home M3 has no safe continuation");
  assert(!/door handle movement/i.test(home.moments[2].naturalSound.join("; ")), "home M3 still carries a door-handle sound");
  assert(/finds the key/i.test(homeBody(3)) && /door/i.test(homeBody(3)), "home M4 does not complete the key and door interaction");
  assert(home.moments.every((moment) => moment.timeRange.endSecond > moment.timeRange.startSecond), "home timeline has an unscheduled Moment");
  assert(!home.compiledText.includes("CORRECT_UNSUPPORTED"), "home model-facing script leaks an unsupported marker");

  // Cafe regression.
  const cafe = outcomes.get("午后咖啡").modelFacingScript;
  const cafeBody = (index) => cafe.moments[index].bodyBehavior;
  assert(!/brings it out|finds the card/i.test(cafeBody(1)), `cafe M2 advances retrieval: ${cafeBody(1)}`);
  assert(!/brings it out|finds the card/i.test(cafeBody(2)), `cafe M3 advances retrieval: ${cafeBody(2)}`);
  assert(/finds the card/i.test(cafeBody(3)) && /brings it out/i.test(cafeBody(3)), "cafe M4 does not retrieve the card");
  assert(cafe.diagnostics.forcedInsertShots === 0, "cafe created a forced insert shot");
  assert(cafe.moments[2].cameraObservation.includes("do not create an insert shot"), "cafe M3 does not state natural partial visibility");

  // 采购归来 / 短途出行 production regressions.
  const purchases = outcomes.get("采购归来");
  assert(!purchases.sceneResolution.resolvedMoments.some((moment) => /超市|日常采购/.test(moment.sceneName)), "采购归来 still resolves a supermarket scene");
  assert(purchases.modelFacingScript.status === "EXECUTABLE", "采购归来 is not executable");
  const shortTrip = outcomes.get("短途出行");
  assert(!/nearly complete/i.test(shortTrip.modelFacingScript.compiledText), "短途出行 still ends with a nearly-complete state");
  assert(/short move is complete/i.test(shortTrip.modelFacingScript.compiledText), "短途出行 does not state a completed arrival");

  // Reference safety: zero references hide product truth, confirmed references keep it.
  const withReferences = runImmersiveNarrativePipeline({
    ...request(NARRATIVE_TOPIC_CATALOG[0]),
    referenceMapping: { mode: "reference_bound_manual", confirmedReferenceCount: 2, instruction: "Upload the two confirmed references in Reference Plan order." },
  });
  assert(withReferences.status === "GENERATED", "reference scenario blocked");
  assert(/burgundy and ivory/i.test(withReferences.modelFacingScript.compiledText), "confirmed references did not restore product truth");

  // Fail-closed fixtures.
  const base = outcomes.get("下班回家");
  const spatialClone = structuredClone(base.executionInput);
  spatialClone.sceneResolution.resolvedMoments[2].spatialContinuityStatus = "FAIL";
  const spatialScript = compileModelFacingExecutionScript(spatialClone);
  assert(spatialScript.status === "NOT_EXECUTABLE_SPATIAL_DISCONTINUITY", `spatial fail-closed gave ${spatialScript.status}`);

  const closureClone = structuredClone(base.executionInput);
  closureClone.plan.goalState = "IN_PROGRESS";
  const closureScript = compileModelFacingExecutionScript(closureClone);
  assert(closureScript.status === "NOT_EXECUTABLE_INCOMPLETE_NARRATIVE", `closure fail-closed gave ${closureScript.status}`);

  const unsafeClone = structuredClone(base.executionInput);
  unsafeClone.physicalAction.moments[4] = {
    ...unsafeClone.physicalAction.moments[4],
    status: "UNRESOLVED",
    selectedActionId: null,
  };
  const unsafeScript = compileModelFacingExecutionScript(unsafeClone);
  assert(unsafeScript.status === "NOT_EXECUTABLE_UNSAFE_CONTINUATION", `unsafe continuation fail-closed gave ${unsafeScript.status}`);

  const validation = validateModelFacingExecutionScript(base.modelFacingScript, base.executionInput);
  assert(validation.status === "EXECUTION_SCRIPT_VALIDATED", `home validation failed: ${validation.failureReasons.join(" | ")}`);

  console.log("MODEL-FACING EXECUTION COMPILER VALIDATION PASS:", JSON.stringify({
    stage: "EXECUTION_COMPILER_V1_1",
    topics: NARRATIVE_TOPIC_CATALOG.length,
    executable,
    internalMarkerHits,
    timelineHoles,
    productFactHits,
    determinismFailures,
    homeRegression: "PASS",
    cafeRegression: "PASS",
    purchasesRegression: "PASS",
    shortTripRegression: "PASS",
    referenceSafety: "PASS",
    failClosedFixtures: ["spatial", "closure", "unsafe-continuation"],
    perTopic,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
