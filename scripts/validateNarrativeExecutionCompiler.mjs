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
  assert(/first touch misses the key.*second touch finds it.*door/i.test(homeBody(2)), "home M3 does not complete the brief key retrieval and unlock");
  assert(home.moments[2].timeRange.endSecond - home.moments[2].timeRange.startSecond <= 3, "home key retrieval exceeds the compact event window");
  assert(/opens the already unlocked door/i.test(homeBody(3)), "home M4 repeats the unlock or omits the door opening");
  assert(home.moments.every((moment) => moment.timeRange.endSecond > moment.timeRange.startSecond), "home timeline has an unscheduled Moment");
  assert(!home.compiledText.includes("CORRECT_UNSUPPORTED"), "home model-facing script leaks an unsupported marker");

  // Cafe regression.
  const cafe = outcomes.get("午后咖啡").modelFacingScript;
  const cafeBody = (index) => cafe.moments[index].bodyBehavior;
  assert(!cafe.compiledText.includes("One person only"), "cafe still forbids incidental background people");
  assert(!cafe.compiledText.includes("No new person"), "cafe still forbids background occupancy");
  assert(cafe.compiledText.includes("actively operating cafe, not an empty set"), "cafe lacks positive operating-world direction");
  assert(cafe.compiledText.includes("barista is naturally working behind the counter") && cafe.compiledText.includes("a few unrelated customers occupy the seating area"), "cafe lacks visible staff and customer occupancy");
  assert(cafe.compiledText.includes("no foreground dialogue"), "cafe lacks the foreground dialogue restriction");
  assert(cafe.moments.some((moment) => moment.naturalSound.some((cue) => cue.includes("background voices"))), "cafe has no background voices in a Moment");
  assert(!/card|pocket|retrieve|retrieval|check the card/i.test(cafe.compiledText), "cafe still introduces an unmotivated card action");
  assert(/open seat/i.test(cafe.moments[1].whatHappens), "cafe M2 does not establish the visible destination");
  assert(/gaze naturally registers an open seat/i.test(cafe.moments[1].whatHappens) && /stride does not break/i.test(cafe.moments[1].whatHappens), "cafe M2 does not show a subtle attention change while walking");
  assert(/turns .*shoulders .*toward the open seat/i.test(cafe.moments[2].whatHappens) && /next step .*clear aisle/i.test(cafe.moments[2].whatHappens), "cafe M3 does not naturally reorient toward the seat while moving");
  assert(/slows as the open chair draws near/i.test(cafe.moments[3].whatHappens) && /takes a seat/i.test(cafe.moments[4].whatHappens), "cafe M4-M5 do not decelerate into and reach the seat");
  assert(cafe.moments.every((moment) => !/card|pocket|retriev|search/i.test(`${moment.whatHappens} ${moment.bodyBehavior}`)), "cafe reintroduces card retrieval in a Moment");
  const cafePlan = outcomes.get("午后咖啡").plan;
  assert(cafePlan.moments[1].causalLink?.includes("open seat") && cafePlan.moments[2].causalLink?.includes("open seat"), "cafe trigger and route adjustment lack direct environmental causality");
  assert(cafe.moments[2].timeRange.endSecond > cafe.moments[2].timeRange.startSecond, "cafe route adjustment has no scheduled duration");
  assert(cafe.diagnostics.forcedInsertShots === 0, "cafe created a forced insert shot");
  assert(!/insert shot|cutaway/i.test(cafe.moments[2].cameraObservation) || /do not create an insert shot/i.test(cafe.moments[2].cameraObservation), "cafe M3 requests an extra shot");

  const officialCafe = runImmersiveNarrativePipeline({
    topic: "午后咖啡",
    characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 克制",
    availableSceneLibrary: [{ id: "lifestyle-cafe-interior", label: "咖啡馆内" }],
    referenceMapping: { mode: "reference_bound_manual", confirmedReferenceCount: 0, instruction: "" },
  });
  assert(officialCafe.status === "GENERATED", "official cafe pipeline blocked");
  const cafeStates = officialCafe.physicalAction.report.moments.map((moment) => moment.selectedMovementState);
  assert(cafeStates.join(",") === "walking_ongoing,walking_ongoing,turning,walking_finish,seated", `official cafe physical progression changed: ${cafeStates.join(", ")}`);
  const officialCafeBodies = officialCafe.modelFacingScript.moments.map((moment) => moment.bodyBehavior);
  assert(officialCafe.plan.moments.every((moment) => !/card|pocket|retrieve|search/i.test(`${moment.whatHappens} ${moment.causalLink ?? ""}`)), "official cafe Narrative contains an unmotivated card event");
  assert(officialCafeBodies.every((body) => !/card|pocket|retrieve|search/i.test(body)), "official cafe execution BODY contains an unmotivated card action");
  assert(/gaze naturally registers an open seat/i.test(officialCafe.plan.moments[1].whatHappens) && /stride does not break/i.test(officialCafe.plan.moments[1].whatHappens), "official cafe M2 lacks a subtle attention change during continuous movement");
  assert(/turns .*shoulders .*toward the open seat/i.test(officialCafe.plan.moments[2].whatHappens) && /next step .*clear aisle/i.test(officialCafe.plan.moments[2].whatHappens), "official cafe M3 lacks an in-motion route/body orientation change");
  assert(/slows as the open chair draws near/i.test(officialCafe.plan.moments[3].whatHappens) && /takes a seat, then settles/i.test(officialCafe.plan.moments[4].whatHappens), "official cafe M4-M5 lack deceleration and seated arrival");
  assert(officialCafe.plan.moments.every((moment, index) => index === 0 || Boolean(moment.causalLink)), "official cafe contains a Moment without an explicit causal link");
  assert(officialCafe.plan.moments.at(-1).endState.toLowerCase().includes("settled"), "official cafe does not reach a settled end state");
  assert(officialCafe.physicalAction.report.moments.at(-1).selectedMovementState === "seated", "official cafe M5 does not use the existing seated capability");
  assert(/lowers into a settled seated position/i.test(officialCafe.modelFacingScript.moments.at(-1).bodyBehavior), "official cafe M5 does not render the seated transition");
  assert(!officialCafe.modelFacingScript.moments[3].bodyBehavior.includes("Nothing is taken out yet"), "official cafe M4 leaks object-retrieval continuity into the seat approach");
  assert(JSON.stringify(officialCafe.plan.moments.map((moment) => moment.spatialAnchor)) === JSON.stringify(["CAFE_INTERIOR", "CAFE_COUNTER", "CAFE_COUNTER", "CAFE_INTERIOR", "CAFE_INTERIOR"]), "official cafe does not progress through existing cafe anchors");
  assert(officialCafe.modelFacingScript.compiledText.includes("This is an actively operating cafe, not an empty set")
    && officialCafe.modelFacingScript.compiledText.includes("barista is naturally working behind the counter")
    && officialCafe.modelFacingScript.compiledText.includes("a few unrelated customers occupy the seating area"), "official cafe lost explicit operating-world occupancy");
  assert(!officialCafe.modelFacingScript.compiledText.includes("card interaction") && !officialCafe.modelFacingScript.compiledText.includes("nothing else happens yet"), "official cafe execution retains stale card or no-progress directions");
  assert(officialCafe.presentation.presentationScript.includes("World occupancy: This is an actively operating cafe, not an empty set"), "official director script lacks positive world occupancy");
  assert(!officialCafe.presentation.presentationScript.includes("nothing else has happened yet"), "official director script negates the visible route progression");
  assert(officialCafe.script.compiledText.includes("This is an actively operating cafe, not an empty set"), "official Seedance script lacks positive world occupancy");
  assert(!/no other people|empty environment|one person only/i.test(officialCafe.modelFacingScript.compiledText), "official cafe has conflicting people restrictions");
  const cafeDoorCue = officialCafe.modelFacingScript.diagnostics.soundVerdicts.find((verdict) => verdict.momentIndex === 0 && verdict.cue === "door handle movement");
  assert(officialCafe.soundWorld.moments[0].object.includes("door handle movement"), "official cafe M1 lost the raw door cue");
  assert(cafeDoorCue?.kept === false && cafeDoorCue.rejectionReason === "NO_EVENT_EVIDENCE", "official cafe M1 kept a door cue without door interaction");
  assert(!officialCafe.modelFacingScript.moments[0].naturalSound.includes("door handle movement"), "official cafe M1 final sound still has door handle movement");
  assert(officialCafe.modelFacingScript.moments[0].naturalSound.includes("quiet cafe room tone with restrained background voices and soft counter appliance hum"), "official cafe M1 lost its environment sound");
  assert(officialCafe.modelFacingScript.moments[0].naturalSound.includes("subtle body and fabric movement"), "official cafe M1 lost its body and fabric sound");
  const doorOpening = outcomes.get("出门办事");
  assert(/opens the door/i.test(doorOpening.plan.moments[1].whatHappens), "official door-opening Moment changed");
  assert(doorOpening.modelFacingScript.moments[1].naturalSound.includes("door handle movement"), "official door-opening Moment lost its door sound");
  const bookstore = outcomes.get("逛书店");
  const street = outcomes.get("城市闲逛");
  const privateHome = outcomes.get("周末独处");
  assert(bookstore.modelFacingScript.compiledText.includes("actively operating bookstore, not an empty set") && bookstore.modelFacingScript.compiledText.includes("few unrelated browsers"), "bookstore lacks positive background presence");
  assert(street.modelFacingScript.compiledText.includes("actively used public route, not an empty set") && street.modelFacingScript.compiledText.includes("few pedestrians move independently"), "city street lacks positive independent pedestrians");
  assert(privateHome.modelFacingScript.compiledText.includes("This is a private home environment. Keep the room private and do not add unfamiliar people."), "private home allows unfamiliar people");
  for (const [label, outcome] of [["cafe", officialCafe], ["bookstore", bookstore], ["street", street]]) {
    assert(!/no other people|empty environment|one person only/i.test(outcome.modelFacingScript.compiledText), `${label} contains a conflicting empty-public-space restriction`);
    assert(outcome.modelFacingScript.compiledText.includes("Do not change the camera to show a sound source or an ambient person"), `${label} permits a camera change for ambient people`);
  }
  assert(!privateHome.modelFacingScript.compiledText.includes("incidental staff") && !privateHome.modelFacingScript.compiledText.includes("incidental pedestrians"), "private home inherits public occupancy");
  assert(!/take(?:s)? (?:a|the) book/i.test(bookstore.plan.moments.map((moment) => moment.whatHappens).join(" ")), "official bookstore unexpectedly invented a book retrieval event");
  const sleeve = outcomes.get("出门办事").modelFacingScript.moments;
  assert(sleeve.filter((moment) => /adjusts her sleeve/i.test(moment.whatHappens)).length === 1, "sleeve adjustment repeats across Moments");
  assert(sleeve[3].timeRange.endSecond - sleeve[3].timeRange.startSecond <= 3, "ordinary sleeve adjustment occupies more than three seconds");
  const wait = outcomes.get("等朋友").modelFacingScript.moments;
  assert(wait[2].timeRange.endSecond - wait[2].timeRange.startSecond >= 3, "intentional waiting was compressed like a minor hand action");

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
