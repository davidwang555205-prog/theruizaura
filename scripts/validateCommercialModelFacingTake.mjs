import { build } from "esbuild";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { sha256 } from "./commercialV13Harness.mjs";

/**
 * CASES 22-28: proves the final Seedance script follows the structured Take
 * Plan instead of the five legacy WORLD/WEAR/DETAIL/HERO/RELEASE shots.
 */

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-model-facing-take-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const coverage = [];
const reference = {
  referenceSetId: "commercial-model-facing-take-reference-set",
  taskId: "commercial-model-facing-take-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "incomplete",
  confirmedReferenceCount: 0,
  confirmedAssetIds: [],
  coverage,
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

const busMicroDecision = {
  routine: "The character waits at an ordinary bus stop during a city walk.",
  expectation: "The viewer expects her to board the bus when it arrives.",
  trigger: "The bus arrives at the stop.",
  expectedAction: "board the bus",
  chosenAction: "she visibly stays on the pavement and does not board",
  visibleConsequence: "the bus departs without her",
  continuation: "she turns and continues walking",
  decisionBeatIndex: 3,
  consequenceBeatIndex: 4,
  triggerState: {
    entityId: "bus",
    attribute: "state",
    value: "approaching the stop",
    reason: "The bus must be arriving before the boarding decision.",
  },
  decisionPrecondition: {
    entityId: "character",
    attribute: "space",
    value: "on the city route",
    reason: "The character is already on the city route when the decision happens.",
  },
  decisionEffect: null,
  consequencePrecondition: {
    entityId: "character",
    attribute: "space",
    value: "on the city route",
    reason: "The STAY decision preserves her physical location.",
  },
  consequenceEffect: {
    entityId: "bus",
    attribute: "state",
    fromValue: "approaching the stop",
    toValue: "departed without her",
    cause: "ENVIRONMENT",
    actionId: null,
    actionLabel: null,
    reason: "The bus departs after the decision is committed.",
  },
  chosenActionId: "STAY",
  consequenceDecisionStatusRequirement: "COMMITTED",
  scenarioState: {
    entities: [
      {
        id: "bus",
        kind: "OBJECT",
        label: "the bus",
        initialAttributes: { state: "approaching the stop" },
        continuityLockAttributes: [],
        containment: null,
      },
    ],
    beatEffects: [
      {
        beatIndex: 4,
        effects: [
          {
            entityId: "bus",
            attribute: "state",
            fromValue: "approaching the stop",
            toValue: "departed without her",
            cause: "ENVIRONMENT",
            actionId: null,
            actionLabel: null,
            reason: "The bus departs after the decision is committed.",
          },
        ],
      },
    ],
  },
};

const caseResults = [];

function record(caseId, title, detail) {
  caseResults.push({ caseId, title, detail, status: "PASS" });
}

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
  const baseline = JSON.parse(await readFile(
    resolve(projectRoot, "src", "commercial-film", "v1.5-continuity-baseline.json"),
    "utf8"
  ));

  const request = (intent, microDecision = null) => ({
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference,
    ...(microDecision ? { microDecision } : {}),
  });

  const oneTake = runCommercialFilmPipeline(request("URBAN_MOTION"));
  const twoTake = runCommercialFilmPipeline(request("NEW_ARRIVAL"));
  const decision = runCommercialFilmPipeline(request("URBAN_MOTION", busMicroDecision));
  assert(
    oneTake.status === "GENERATED" && twoTake.status === "GENERATED" && decision.status === "GENERATED",
    "One of the model-facing take validation cases did not generate."
  );
  const oneTakeText = oneTake.modelFacingScript.compiledText;
  const twoTakeText = twoTake.modelFacingScript.compiledText;
  const decisionText = decision.modelFacingScript.compiledText;

  // ---------------------------------------------------------------- CASE 22
  assert(
    oneTake.plan.continuity.takePlan.takes.length === 1
      && !/\bSHOT\s+\d+\s*[—:-]/i.test(oneTakeText)
      && /^TAKE 1 — ONE CONTINUOUS SHOT/m.test(oneTakeText),
    "CASE 22: a one-take film still exposes SHOT 1-5 as top-level structure."
  );
  record("CASE 22", "TakePlan=1 final script must not expose SHOT 1-5 top-level structure", "one TAKE heading, zero legacy SHOT headings");

  // ---------------------------------------------------------------- CASE 23
  assert(
    oneTakeText.includes("This entire take is uninterrupted.")
      && oneTakeText.includes("Do not cut.")
      && (
        oneTakeText.includes("Do not treat the timed beats below as separate shots.")
        || oneTakeText.includes("Beat windows are timing metadata only, not cuts")
      )
      && !/\bhard cut\b/i.test(oneTakeText)
      && !/\bnew camera setup\b/i.test(oneTakeText),
    "CASE 23: the one-take script is missing explicit no-cut / no-beat-as-cut language."
  );
  record("CASE 23", "TakePlan=1 must declare ONE CONTINUOUS SHOT and no beat-as-cut semantics", "explicit uninterrupted-take declaration is present");

  // ---------------------------------------------------------------- CASE 24
  assert(
    !/\b(?:WORLD|WEAR|DETAIL|HERO|RELEASE)\b/.test(oneTakeText)
      && !/\b(?:WORLD|WEAR|DETAIL|HERO|RELEASE)\b/.test(twoTakeText)
      && !/\b(?:WORLD|WEAR|DETAIL|HERO|RELEASE)\b/.test(decisionText),
    "CASE 24: an internal DETAIL/HERO role token remains in the final text."
  );
  record("CASE 24", "Internal DETAIL/HERO roles must not appear in final structural headings", "zero uppercase role tokens across all three scripts");

  // ---------------------------------------------------------------- CASE 25
  {
    const secondTake = twoTake.plan.continuity.takePlan.takes.find((take) => take.takeIndex === 1);
    assert(Boolean(secondTake), "CASE 25: the two-take case has no second take.");
    const secondTakeHeading = `TAKE ${secondTake.takeIndex + 1} — ONE CONTINUOUS SHOT`;
    const headingStart = twoTakeText.indexOf(secondTakeHeading);
    const section = twoTakeText.slice(headingStart, twoTakeText.indexOf("[SOUND ENVIRONMENT]"));
    assert(
      section.includes("START STATE INHERITED FROM PREVIOUS TAKE"),
      "CASE 25: Take 2 is missing its inherited start state."
    );
    assert(
      section.includes("outside on the approach")
        && section.includes("already locked")
        && section.includes("already closed"),
      "CASE 25: Take 2 inherited state does not carry the previous take's structured facts."
    );
    record("CASE 25", "TakePlan=2 Take 2 must include inherited start state", "door lock/open and character spatial state are inherited");
  }

  // ---------------------------------------------------------------- CASE 26
  {
    const tokens = ["ONLY AFTER", "WHILE", "UNTIL", "ONLY THEN"];
    const positions = tokens.map((token) => decisionText.indexOf(token));
    assert(
      positions.every((position) => position >= 0)
        && positions.every((position, index) => index === 0 || position > positions[index - 1]),
      "CASE 26: Micro Decision consequence and continuation lack explicit temporal dependency."
    );
    record("CASE 26", "Micro Decision consequence and continuation must have explicit temporal dependency", "ONLY AFTER -> WHILE -> UNTIL -> ONLY THEN");
  }

  // ---------------------------------------------------------------- CASE 27
  assert(
    oneTakeText.includes("[FINAL STATE CLOSURE]")
      && oneTakeText.includes("do not invent a new human task, destination, pose, seated action, object interaction, or product presentation."),
    "CASE 27: final state closure does not forbid unscripted new tasks."
  );
  record("CASE 27", "Final state closure must forbid unscripted new tasks", "generic end-state closure is present");

  // ---------------------------------------------------------------- CASE 28
  {
    const baselineCase = (intent) => baseline.functionalCases.find((entry) => entry.intent === intent);
    const unchanged = [
      ["URBAN_MOTION", oneTake.plan],
      ["NEW_ARRIVAL", twoTake.plan],
      ["URBAN_MOTION", decision.plan],
    ].every(([intent, plan]) => (
      baselineCase(intent).worldStateTimelineSha256 === sha256(plan.continuity.worldStateTimeline)
      && baselineCase(intent).continuityLockLinesSha256 === sha256(plan.continuity.continuityLock.lines)
      && plan.continuity.conflicts.length === 0
    ));
    assert(unchanged, "CASE 28: model-facing take translation changed the structured state snapshots.");
  record("CASE 28", "Model-facing Take translation must not change structured state snapshots", "V1.5 state timeline and lock hashes remain identical");
  }

  // ---------------------------------------------------------------- CASE 29
  assert(
    oneTakeText.includes("LOCOMOTION STATE:")
      && oneTakeText.includes("The character remains in continuous locomotion throughout this take."),
    "CASE 29: the continuous-locomotion take lacks its authoritative motion fact."
  );
  record("CASE 29", "Continuous locomotion Take must contain explicit locomotion authority", "positive LOCOMOTION STATE is present");

  // ---------------------------------------------------------------- CASE 30
  {
    const flowBody = oneTakeText.slice(
      oneTakeText.indexOf("[ONE CONTINUOUS ACTION FLOW]"),
      oneTakeText.indexOf("[SOUND ENVIRONMENT]")
    );
    assert(
      !/\b(?:stops?|settles?|holds? position|plants? both feet|pauses? for product|hero-like stationary|stationary)\b/i.test(flowBody),
      "CASE 30: product readability created stationary wording inside a locomotion state."
    );
    record("CASE 30", "Product readability cannot create stationary wording in a locomotion take", "flow body has zero stop/settle/hold wording");
  }

  // ---------------------------------------------------------------- CASE 31
  assert(
    oneTakeText.includes("[ONE CONTINUOUS ACTION FLOW]")
      && !/^BEAT \d+/m.test(oneTakeText)
      && (oneTakeText.match(/^Beat window \d+:/gm) ?? []).length === 5,
    "CASE 31: TakePlan=1 continuous locomotion is not compiled as one action-flow body."
  );
  record("CASE 31", "Continuous locomotion compiles to one action-flow body", "five beat windows inside one flow, zero independent BEAT blocks");

  // ---------------------------------------------------------------- CASE 32
  assert(
    twoTakeText.includes("The same destination threshold must be visibly unlocked.")
      && twoTakeText.includes("The same destination threshold must be visibly opened.")
      && twoTakeText.includes("Crossing the destination threshold must visibly happen."),
    "CASE 32: a single-use state-changing event is missing from the mandatory list."
  );
  record("CASE 32", "All single-use state-changing events appear as mandatory visual events", "unlock / open / crossing are mandatory");

  // ---------------------------------------------------------------- CASE 33
  assert(
    twoTakeText.includes("The character must visibly move into inside the arrival space."),
    "CASE 33: the spatial goal-completion event is missing from the mandatory list."
  );
  record("CASE 33", "Spatial goal-completion event cannot be omitted", "character crossing into the arrival space is mandatory");

  // ---------------------------------------------------------------- CASE 34
  assert(
    twoTakeText.includes("[EVENT COMPLETION GATE]")
      && twoTakeText.includes("only after every mandatory visual event above has visibly completed")
      && twoTakeText.includes("do not replace it with walking continuation, posing, product observation, or another destination"),
    "CASE 34: final continuation can begin before mandatory visual events complete."
  );
  record("CASE 34", "Final continuation cannot begin before mandatory events complete", "event completion gate blocks generic continuation");

  // ---------------------------------------------------------------- CASE 35
  {
    const v2TakePlan = JSON.parse(await readFile(
      resolve(projectRoot, "artifacts", "commercial-v1.5-seedance-acceptance-v2", "case-c-take-plan.json"),
      "utf8"
    ));
    const v2State = JSON.parse(await readFile(
      resolve(projectRoot, "artifacts", "commercial-v1.5-seedance-acceptance-v2", "case-c-state.json"),
      "utf8"
    ));
    assert(
      JSON.stringify(oneTake.plan.continuity.takePlan) === JSON.stringify(v2TakePlan)
        && JSON.stringify(oneTake.plan.continuity.worldStateTimeline) === JSON.stringify(v2State.film.timeline),
      "CASE 35: action-flow translation changed state snapshots or TakePlan."
    );
    record("CASE 35", "Action-flow translation must not change state snapshots or TakePlan", "V2 and V3 TakePlan and state timeline remain identical");
  }

  const expected = Array.from({ length: 14 }, (_, index) => `CASE ${index + 22}`);
  assert(
    caseResults.map((entry) => entry.caseId).join("|") === expected.join("|"),
    "Cases 22-28 did not run in order."
  );
  console.log("COMMERCIAL FILM MODEL-FACING TAKE VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_FILM_MODEL_FACING_TAKE",
    cases: caseResults,
    takeCounts: {
      oneTake: oneTake.plan.continuity.takePlan.takes.length,
      twoTake: twoTake.plan.continuity.takePlan.takes.length,
      microDecision: decision.plan.continuity.takePlan.takes.length,
    },
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
