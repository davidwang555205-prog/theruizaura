import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Narrative Closure V1.1: state progression, micro-event consequence, semantic
// loop prevention, goal completion, resolved ending.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-closure-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const moment = (index, purpose, boundary, overrides = {}) => ({
  index,
  purpose,
  whatHappens: overrides.whatHappens ?? `moment ${index + 1}`,
  completionBoundary: boundary,
  motionState: overrides.motionState ?? "walking",
  interactionState: overrides.interactionState ?? "none",
  spatialAnchor: overrides.spatialAnchor ?? "COMMUNITY_PATH",
  goalProgress: overrides.goalProgress ?? [0.15, 0.35, 0.55, 0.8, 1][index],
});

const chain = (boundaries, options = {}) => boundaries.map((boundary, index) => moment(index, ["establish_state", "approach_trigger", "micro_event", "response", "after_state"][index], boundary, {
  ...options.byIndex?.[index],
  ...(boundary === "SETTLED" && !options.byIndex?.[index]?.motionState ? { motionState: "standing" } : {}),
}));

try {
  await writeFile(
    entryPath,
    `export { evaluateNarrativeClosure } from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/closure.ts"))};\n` +
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const { evaluateNarrativeClosure, NARRATIVE_TOPIC_CATALOG, planImmersiveNarrative } =
    await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  const fixtures = {};
  const resolvedPass = evaluateNarrativeClosure(chain(["WALK_CONTINUES", "SEARCH_STARTED", "SEARCH_CONTINUES", "ITEM_RETRIEVED", "ENTERED"]), "arrive");
  fixtures["resolved-ending-pass"] = resolvedPass.goalCompletion.pass && resolvedPass.resolvedEnding.pass;

  const nearlyArrived = evaluateNarrativeClosure(chain(["WALK_CONTINUES", "WALK_CONTINUES", "OBJECT_HANDLING", "WALK_CONTINUES", "STATE_HELD"], {
    byIndex: { 4: { whatHappens: "She continues toward the nearby destination; the short move is nearly complete." } },
  }), "arrive");
  fixtures["nearly-arrived-fail"] = !nearlyArrived.resolvedEnding.pass && !nearlyArrived.goalCompletion.pass;

  const walkingLoop = evaluateNarrativeClosure([
    moment(0, "establish_state", "WALK_CONTINUES", { goalProgress: 0.5 }),
    moment(1, "approach_trigger", "WALK_CONTINUES", { goalProgress: 0.5 }),
    moment(2, "micro_event", "WALK_CONTINUES", { goalProgress: 0.5 }),
    moment(3, "response", "WALK_CONTINUES", { goalProgress: 0.5 }),
    moment(4, "after_state", "WALK_CONTINUES", { goalProgress: 0.5 }),
  ], "arrive");
  fixtures["walking-loop-fail"] = !walkingLoop.noSemanticLoop.pass && !walkingLoop.goalCompletion.pass;

  const walkingProgress = evaluateNarrativeClosure([
    moment(0, "establish_state", "WALK_CONTINUES", { goalProgress: 0.15, spatialAnchor: "COMMUNITY_PATH" }),
    moment(1, "approach_trigger", "WALK_CONTINUES", { goalProgress: 0.35, spatialAnchor: "COMMUNITY_PATH", interactionState: "reach_started" }),
    moment(2, "micro_event", "OBJECT_HANDLING", { goalProgress: 0.55, spatialAnchor: "COMMUNITY_PATH", motionState: "paused" }),
    moment(3, "response", "WALK_CONTINUES", { goalProgress: 0.8, spatialAnchor: "DESTINATION_APPROACH" }),
    moment(4, "after_state", "SETTLED", { goalProgress: 1, spatialAnchor: "OFFICE_ENTRANCE", motionState: "standing", whatHappens: "She reaches the entrance and stops there; the short move is complete." }),
  ], "arrive");
  fixtures["walking-with-goal-progress-pass"] = walkingProgress.stateProgression.pass && walkingProgress.noSemanticLoop.pass && walkingProgress.goalCompletion.pass;

  const eventWithoutConsequence = evaluateNarrativeClosure([
    moment(0, "establish_state", "WALK_CONTINUES", { goalProgress: 0.15 }),
    moment(1, "approach_trigger", "WALK_CONTINUES", { goalProgress: 0.35 }),
    moment(2, "micro_event", "OBJECT_HANDLING", { goalProgress: 0.55, interactionState: "object_handling", motionState: "paused" }),
    moment(3, "response", "OBJECT_HANDLING", { goalProgress: 0.55, interactionState: "object_handling", motionState: "paused" }),
    moment(4, "after_state", "OBJECT_HANDLING", { goalProgress: 0.55, interactionState: "object_handling", motionState: "paused" }),
  ], "settle");
  fixtures["event-without-consequence-fail"] = !eventWithoutConsequence.microEventConsequence.pass;

  const initialEqualsAfter = evaluateNarrativeClosure([
    moment(0, "establish_state", "WALK_CONTINUES", { goalProgress: 0.15 }),
    moment(1, "approach_trigger", "WALK_CONTINUES", { goalProgress: 0.35, spatialAnchor: "STREET" }),
    moment(2, "micro_event", "OBJECT_HANDLING", { goalProgress: 0.55, motionState: "paused" }),
    moment(3, "response", "WALK_CONTINUES", { goalProgress: 0.8, spatialAnchor: "STREET" }),
    moment(4, "after_state", "WALK_CONTINUES", { goalProgress: 1 }),
  ], "arrive");
  fixtures["initial-equals-after-fail"] = !initialEqualsAfter.noSemanticLoop.pass;

  const bookstore = evaluateNarrativeClosure([
    moment(0, "establish_state", "WALK_CONTINUES", { goalProgress: 0.15, spatialAnchor: "SHOP_FRONT" }),
    moment(1, "approach_trigger", "WALK_CONTINUES", { goalProgress: 0.35, spatialAnchor: "SHOP_WINDOW", interactionState: "none" }),
    moment(2, "micro_event", "STATE_HELD", { goalProgress: 0.55, spatialAnchor: "SHOP_WINDOW", motionState: "paused" }),
    moment(3, "response", "WALK_CONTINUES", { goalProgress: 0.8, spatialAnchor: "SHOP_FRONT" }),
    moment(4, "after_state", "ENTERED", { goalProgress: 1, spatialAnchor: "SHOP_INTERIOR", interactionState: "entered", whatHappens: "She continues into the bookstore and the moment of notice is over." }),
  ], "enter bookstore after notice");
  fixtures["bookstore-notice-to-entry-pass"] = bookstore.goalCompletion.pass && bookstore.noSemanticLoop.pass;

  const homeArrival = evaluateNarrativeClosure([
    moment(0, "establish_state", "WALK_CONTINUES", { goalProgress: 0.15, spatialAnchor: "ELEVATOR_EXIT" }),
    moment(1, "approach_trigger", "SEARCH_STARTED", { goalProgress: 0.35, spatialAnchor: "APARTMENT_HALLWAY", interactionState: "search_started" }),
    moment(2, "micro_event", "SEARCH_CONTINUES", { goalProgress: 0.55, spatialAnchor: "APARTMENT_THRESHOLD", motionState: "paused", interactionState: "search_continues" }),
    moment(3, "response", "ITEM_RETRIEVED", { goalProgress: 0.8, spatialAnchor: "APARTMENT_THRESHOLD", motionState: "standing", interactionState: "item_in_hand" }),
    moment(4, "after_state", "ENTERED", { goalProgress: 1, spatialAnchor: "ENTRYWAY", interactionState: "entered", whatHappens: "She steps into the entryway; the return home is complete." }),
  ], "enter home");
  fixtures["home-arrival-to-inside-pass"] = homeArrival.goalCompletion.pass && homeArrival.resolvedEnding.pass;

  const shortTripFail = evaluateNarrativeClosure(chain(["WALK_CONTINUES", "WALK_CONTINUES", "WALK_CONTINUES", "WALK_CONTINUES", "WALK_CONTINUES"], {
    byIndex: { 4: { whatHappens: "She continues toward the nearby destination; the short move is nearly complete." } },
  }), "arrive");
  fixtures["short-trip-nearly-complete-fail"] = !shortTripFail.goalCompletion.pass;

  for (const [name, passed] of Object.entries(fixtures)) {
    assert(passed, `closure fixture ${name} failed`);
  }

  const perTopic = [];
  let goalCompleted = 0;
  let resolvedEnding = 0;
  let semanticLoops = 0;
  let eventsWithoutConsequence = 0;
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const plan = planImmersiveNarrative({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `closure-${topic.id}-${index}`, label })),
    });
    assert(plan.status === "APPROVED_FOR_SCENE_RESOLUTION", `${topic.label} is not approved: ${Object.values(plan.qc).filter((gate) => gate.status === "FAIL").map((gate) => gate.id).join(", ")}`);
    assert(plan.qc.goal_completion.status === "PASS", `${topic.label} goal_completion FAIL: ${plan.qc.goal_completion.reason}`);
    assert(plan.qc.resolved_ending.status === "PASS", `${topic.label} resolved_ending FAIL: ${plan.qc.resolved_ending.reason}`);
    assert(plan.qc.no_semantic_loop.status === "PASS", `${topic.label} no_semantic_loop FAIL: ${plan.qc.no_semantic_loop.reason}`);
    assert(plan.qc.micro_event_consequence.status === "PASS", `${topic.label} micro_event_consequence FAIL: ${plan.qc.micro_event_consequence.reason}`);
    if (plan.goalState === "COMPLETED") goalCompleted += 1;
    if (plan.qc.resolved_ending.status === "PASS") resolvedEnding += 1;
    if (plan.qc.no_semantic_loop.status === "FAIL") semanticLoops += 1;
    if (plan.qc.micro_event_consequence.status === "FAIL") eventsWithoutConsequence += 1;
    perTopic.push({
      topic: topic.label,
      localGoal: plan.localGoal,
      goalState: plan.goalState,
      boundaries: plan.moments.map((moment) => moment.completionBoundary),
      goalProgress: plan.moments.map((moment) => moment.goalProgress),
      finalMoment: plan.moments[4].whatHappens,
    });
  }
  assert(goalCompleted === 13, `${goalCompleted} of 13 goals completed`);
  assert(resolvedEnding === 13, `${resolvedEnding} of 13 endings resolved`);
  assert(semanticLoops === 0, `${semanticLoops} semantic loops remain`);
  assert(eventsWithoutConsequence === 0, `${eventsWithoutConsequence} micro events without consequence remain`);

  console.log("NARRATIVE CLOSURE VALIDATION PASS:", JSON.stringify({
    stage: "NARRATIVE_CLOSURE_V1_1",
    topics: NARRATIVE_TOPIC_CATALOG.length,
    goalCompleted,
    resolvedEnding,
    semanticLoops,
    eventWithoutConsequence: eventsWithoutConsequence,
    fixtures: Object.keys(fixtures).length,
    perTopic,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
