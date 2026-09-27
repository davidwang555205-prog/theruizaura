import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Commercial Film continuity regression validator.
 * It exercises the structured Event Spine state layer, the take planner, and
 * the model-facing Continuity Lock. Every hard conflict must block, not warn.
 */

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-continuity-"));
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
  referenceSetId: "commercial-continuity-reference-set",
  taskId: "commercial-continuity-task",
  sourceType: "current_task_reference_set",
  confirmationStatus: "confirmed",
  confirmedReferenceCount: 2,
  confirmedAssetIds: ["asset-front", "asset-side"],
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
  const api = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);
  const {
    buildCommercialContinuityLock,
    COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    planCommercialContinuity,
    planCommercialMicroDecision,
    runCommercialFilmPipeline,
    runCommercialFilmQc,
  } = api;

  const worldModel = (entities) => ({
    schemaVersion: COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    entities,
  });
  const character = ({ space, anchor = "the room" }) => ({
    id: "character",
    kind: "CHARACTER",
    label: "the character",
    initialAttributes: { space, anchor },
    continuityLockAttributes: ["space"],
    containment: null,
  });
  const threshold = ({ id, label, state = "closed", crossings = "0" }) => ({
    id,
    kind: "THRESHOLD",
    label,
    initialAttributes: { state, crossings },
    continuityLockAttributes: ["state"],
    containment: null,
  });
  const objectEntity = ({ id, label, state }) => ({
    id,
    kind: "OBJECT",
    label,
    initialAttributes: { state },
    continuityLockAttributes: ["state"],
    containment: null,
  });
  const stateContract = ({
    preconditions = [],
    effects = [],
    evidence = [],
    prohibited = [],
    singleUseAction = null,
  }) => ({
    preconditions,
    effects,
    requiredVisibleEvidence: evidence,
    prohibitedTransitions: prohibited,
    singleUseAction,
  });
  const requireState = (entityId, attribute, value) => ({
    entityId,
    attribute,
    value,
    reason: "regression case state assumption",
  });
  const actionEffect = (entityId, attribute, fromValue, toValue, actionId, actionLabel = "changed") => ({
    entityId,
    attribute,
    fromValue,
    toValue,
    cause: "ACTION",
    actionId,
    actionLabel,
    reason: "regression case action change",
  });
  const visibleEvidence = (id) => ({
    id,
    statement: `Visible evidence for ${id}.`,
    entityId: null,
  });
  const prohibitedTransition = (entityId, attribute, fromValue, toValue) => ({
    entityId,
    attribute,
    fromValue,
    toValue,
    reason: "regression case prohibited transition",
  });
  const beat = ({
    shotIndex,
    durationSeconds = 3,
    stateContract: contract,
    cameraState = { scale: "MEDIUM", subjectRelation: "FULL_PERSON", handoff: "CONTINUOUS" },
    actionContinuity = "CONTINUOUS",
    actionSequenceId = "sequence",
    actionRequiresFreshSetup = false,
    takeBoundary = null,
    timeGapSeconds = 0,
  }) => ({
    shotIndex,
    durationSeconds,
    stateContract: contract,
    cameraState,
    actionContinuity,
    actionSequenceId,
    actionRequiresFreshSetup,
    takeBoundary,
    timeGapSeconds,
  });
  const conflictCodes = (plan) => plan.conflicts.map((conflict) => conflict.code);
  const pipelineRequest = (intent, extra = {}) => ({
    commercialIntent: intent,
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference,
    ...extra,
  });

  // ---------------------------------------------------------------- CASE 01
  {
    const plan = planCommercialContinuity({
      worldModel: worldModel([
        character({ space: "outside the home" }),
        threshold({ id: "front_door", label: "the front door" }),
      ]),
      beats: [
        beat({
          shotIndex: 0,
          stateContract: stateContract({
            effects: [actionEffect("front_door", "state", "closed", "open", "OPEN_DOOR", "opened")],
          }),
        }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({
            effects: [actionEffect("front_door", "state", "closed", "open", "OPEN_DOOR", "opened")],
          }),
        }),
      ],
    });
    assert(plan.status === "BLOCKED", "CASE 01 did not block a duplicated door opening.");
    assert(
      conflictCodes(plan).includes("DUPLICATE_SINGLE_USE_ACTION"),
      `CASE 01 blocked without the single-use conflict: ${conflictCodes(plan).join(", ")}`
    );
    record("CASE 01", "door cannot be opened twice", conflictCodes(plan).join(", "));
  }

  // ---------------------------------------------------------------- CASE 02
  {
    const plan = planCommercialContinuity({
      worldModel: worldModel([
        character({ space: "outside on the corridor" }),
        threshold({ id: "home_door", label: "the home door" }),
      ]),
      beats: [
        beat({
          shotIndex: 0,
          stateContract: stateContract({
            effects: [
              actionEffect("character", "space", "outside on the corridor", "inside the home", "ENTER_HOME", "entered"),
            ],
          }),
        }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({
            preconditions: [requireState("character", "space", "outside on the corridor")],
            evidence: [visibleEvidence("spatial_reset_check")],
          }),
        }),
      ],
    });
    assert(plan.status === "BLOCKED", "CASE 02 did not block a spatial reset after ENTER_HOME.");
    assert(
      conflictCodes(plan).includes("IMPOSSIBLE_SPATIAL_RESET"),
      `CASE 02 blocked without the spatial reset conflict: ${conflictCodes(plan).join(", ")}`
    );
    record(
      "CASE 02",
      "after ENTER_HOME the character cannot appear outside without an explicit exit",
      conflictCodes(plan).join(", ")
    );
  }

  // ---------------------------------------------------------------- CASE 03
  {
    const openDoorAction = {
      actionId: "OPEN_DOOR",
      label: "Opening the front door",
      entityId: "front_door",
      attribute: "state",
      fromValue: "closed",
      toValue: "open",
    };
    const plan = planCommercialContinuity({
      worldModel: worldModel([
        character({ space: "outside the home" }),
        threshold({ id: "front_door", label: "the front door" }),
      ]),
      beats: [
        beat({
          shotIndex: 0,
          stateContract: stateContract({
            effects: [actionEffect("front_door", "state", "closed", "open", "OPEN_DOOR", "opened")],
            singleUseAction: openDoorAction,
          }),
        }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({ evidence: [visibleEvidence("middle_beat")] }),
        }),
        beat({
          shotIndex: 2,
          stateContract: stateContract({
            preconditions: [requireState("front_door", "state", "open")],
            effects: [actionEffect("front_door", "state", "closed", "open", "OPEN_DOOR", "opened")],
            singleUseAction: openDoorAction,
          }),
        }),
      ],
    });
    assert(plan.status === "BLOCKED", "CASE 03 did not block a restarted single-use action.");
    assert(
      conflictCodes(plan).includes("DUPLICATE_SINGLE_USE_ACTION"),
      `CASE 03 blocked without the single-use restart conflict: ${conflictCodes(plan).join(", ")}`
    );
    record("CASE 03", "single-use action cannot restart later", conflictCodes(plan).join(", "));
  }

  // ---------------------------------------------------------------- CASE 04
  {
    const plan = planCommercialContinuity({
      worldModel: worldModel([
        character({ space: "inside the room" }),
        objectEntity({ id: "phone", label: "the phone", state: "on the table" }),
      ]),
      beats: [
        beat({
          shotIndex: 0,
          stateContract: stateContract({
            effects: [actionEffect("phone", "state", "on the table", "in her hand", "PICK_UP_PHONE", "picked up")],
          }),
        }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({
            preconditions: [requireState("phone", "state", "on the table")],
            evidence: [visibleEvidence("object_persistence")],
          }),
        }),
      ],
    });
    assert(plan.status === "BLOCKED", "CASE 04 did not block an object state reset.");
    assert(
      conflictCodes(plan).includes("IMPOSSIBLE_OBJECT_RESET"),
      `CASE 04 blocked without the object reset conflict: ${conflictCodes(plan).join(", ")}`
    );
    record("CASE 04", "object state must persist across adjacent beats", conflictCodes(plan).join(", "));
  }

  // ---------------------------------------------------------------- CASE 05
  {
    const statelessConsequence = runCommercialFilmPipeline(pipelineRequest("DAILY_STYLING", {
      microDecision: {
        routine: "She is leaving the house for an ordinary working day.",
        expectation: "The viewer expects her to step straight into the street.",
        trigger: "The outfit is already complete at the doorway.",
        expectedAction: "walk out immediately",
        chosenAction: "she pauses at the threshold and checks the finished look once before stepping out",
        visibleConsequence: "the outfit state holds while she crosses the threshold once",
        continuation: "she continues into the ordinary street step",
        decisionBeatIndex: 0,
        consequenceBeatIndex: 4,
        triggerState: requireState("outfit", "state", "not yet resolved"),
        decisionPrecondition: requireState("character", "space", "inside the private entryway"),
        decisionEffect: actionEffect("outfit", "state", "not yet resolved", "resolved and worn", "COMPLETE_OUTFIT", "completed"),
        consequencePrecondition: requireState("outfit", "state", "resolved and worn"),
        consequenceEffect: actionEffect("home_threshold", "state", "open", "closed", "CLOSE_THRESHOLD", "closed"),
        chosenActionId: "STAY_AT_THRESHOLD",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
    }));
    assert(
      statelessConsequence.status === "BLOCKED",
      "CASE 05 did not block a Micro Decision whose consequence beat changes no state."
    );
    assert(
      statelessConsequence.diagnostics.some((line) => line.includes("MICRO_DECISION_CONSEQUENCE_STATELESS")),
      `CASE 05 blocked without the consequence failure: ${statelessConsequence.diagnostics.join(" | ")}`
    );
    const visibleConsequence = runCommercialFilmPipeline(pipelineRequest("DAILY_STYLING", {
      microDecision: {
        routine: "She is leaving the house for an ordinary working day.",
        expectation: "The viewer expects her to step straight into the street.",
        trigger: "The outfit is already complete at the doorway.",
        expectedAction: "walk out immediately",
        chosenAction: "she pauses at the threshold and checks the finished look once before stepping out",
        visibleConsequence: "the threshold opens once and she crosses it with the completed outfit",
        continuation: "she continues into the ordinary street step",
        decisionBeatIndex: 0,
        consequenceBeatIndex: 1,
        triggerState: requireState("outfit", "state", "not yet resolved"),
        decisionPrecondition: requireState("character", "space", "inside the private entryway"),
        decisionEffect: actionEffect("outfit", "state", "not yet resolved", "resolved and worn", "COMPLETE_OUTFIT", "completed"),
        consequencePrecondition: requireState("outfit", "state", "resolved and worn"),
        consequenceEffect: actionEffect("home_threshold", "crossings", "0", "1", "CROSS_THRESHOLD", "crossed"),
        chosenActionId: "STAY_AT_THRESHOLD",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
    }));
    assert(
      visibleConsequence.status === "GENERATED",
      `CASE 05 blocked a valid Micro Decision: ${visibleConsequence.status === "BLOCKED" ? visibleConsequence.diagnostics.join(" | ") : ""}`
    );
    assert(
      visibleConsequence.plan.microDecision.status === "MICRO_DECISION_VALIDATED",
      "CASE 05 did not validate the visible-consequence Micro Decision."
    );
    assert(
      visibleConsequence.modelFacingScript.compiledText.includes(
        "Visible consequence: the threshold opens once and she crosses it with the completed outfit"
      ),
      "CASE 05 did not render the visible consequence into the final script."
    );
    record(
      "CASE 05",
      "Micro Decision must contain a visible consequence",
      "a stateless consequence blocks, a stateful consequence renders in the final script"
    );
  }

  // ---------------------------------------------------------------- CASE 06
  {
    const outOfOrder = runCommercialFilmPipeline(pipelineRequest("DAILY_STYLING", {
      microDecision: {
        routine: "She is leaving the house for an ordinary working day.",
        expectation: "The viewer expects her to step straight into the street.",
        trigger: "The outfit is already complete at the doorway.",
        expectedAction: "walk out immediately",
        chosenAction: "she pauses at the threshold and checks the finished look once before stepping out",
        visibleConsequence: "the threshold opens once and she crosses it with the completed outfit",
        continuation: "she continues into the ordinary street step",
        decisionBeatIndex: 1,
        consequenceBeatIndex: 0,
        triggerState: requireState("outfit", "state", "not yet resolved"),
        decisionPrecondition: requireState("character", "space", "inside the private entryway"),
        decisionEffect: actionEffect("outfit", "state", "not yet resolved", "resolved and worn", "COMPLETE_OUTFIT", "completed"),
        consequencePrecondition: requireState("outfit", "state", "resolved and worn"),
        consequenceEffect: actionEffect("home_threshold", "crossings", "0", "1", "CROSS_THRESHOLD", "crossed"),
        chosenActionId: "STAY_AT_THRESHOLD",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
    }));
    assert(outOfOrder.status === "BLOCKED", "CASE 06 did not block a consequence that happens before the decision.");
    assert(
      outOfOrder.diagnostics.some((line) => line.includes("MICRO_DECISION_ORDER")),
      `CASE 06 blocked without the ordering failure: ${outOfOrder.diagnostics.join(" | ")}`
    );
    record("CASE 06", "decision consequence cannot happen before the decision", "MICRO_DECISION_ORDER");
  }

  // ------------------------------------------------- CASE 07 / 08 / 10 pipeline level
  const pipelinePlans = new Map();
  const takeCounts = [];
  for (const intent of intents) {
    const outcome = runCommercialFilmPipeline(pipelineRequest(intent));
    assert(
      outcome.status === "GENERATED",
      `${intent} was blocked in the continuity validator: ${outcome.status === "BLOCKED" ? outcome.diagnostics.join(" | ") : ""}`
    );
    const plan = outcome.plan;
    pipelinePlans.set(intent, { outcome, plan });
    const takes = plan.continuity.takePlan.takes;
    takeCounts.push(takes.length);

    assert(takes.length >= 1 && takes.length <= 3, `${intent} produced ${takes.length} takes, outside the allowed 1-3 range.`);
    assert(takes.length < plan.shotArchitecture.shots.length, `${intent} still maps one narrative beat to one take.`);
    const coveredShots = takes.flatMap((take) => take.shotIndexes).sort((left, right) => left - right);
    assert(
      coveredShots.join(",") === plan.shotArchitecture.shots.map((shot) => shot.shotIndex).join(","),
      `${intent} take plan does not cover every narrative beat exactly once.`
    );

    plan.continuity.takePlan.boundaryDecisions.forEach((decision) => {
      if (!decision.admittedMotivation) return;
      assert(
        ["SPATIAL_BOUNDARY", "CAMERA_STATE_DISCONTINUITY", "TIME_DISCONTINUITY", "ACTION_CANNOT_CONTINUE_IN_ONE_STATE"]
          .includes(decision.admittedMotivation),
        `${intent} admitted an unsupported take boundary motivation: ${decision.admittedMotivation}`
      );
      assert(
        !/\b(?:product detail|hero moment|visual emphasis|packshot)\b/i.test(decision.reason),
        `${intent} justified a take boundary with product emphasis: ${decision.reason}`
      );
    });

    const releaseStep = plan.continuity.worldStateTimeline[4];
    plan.eventSpine.shots[4].stateContract.effects.forEach((effect) => {
      if (!effect.actionId) return;
      assert(
        !releaseStep.before.completedActions.includes(effect.actionId),
        `${intent} release restarts the completed action ${effect.actionId}.`
      );
    });

    const lock = plan.continuity.continuityLock;
    assert(lock.lines.length > 0, `${intent} emitted an empty Continuity Lock.`);
    lock.facts.forEach((fact) => {
      const entity = plan.continuity.worldModel.entities.find((entry) => entry.id === fact.entityId);
      assert(Boolean(entity), `${intent} emitted a Continuity Lock fact for an undeclared entity: ${fact.entityId}`);
      if (fact.attribute) {
        assert(
          Object.prototype.hasOwnProperty.call(entity.initialAttributes, fact.attribute),
          `${intent} emitted a Continuity Lock fact for an undeclared attribute: ${fact.entityId}.${fact.attribute}`
        );
      }
    });
    const hasThreshold = plan.continuity.worldModel.entities.some((entity) => entity.kind === "THRESHOLD");
    if (!hasThreshold) {
      assert(
        !/\b(?:door|doors|doorway|threshold|gate|lid)\b/i.test(lock.lines.join(" ")),
        `${intent} emitted threshold or door rules without a declared threshold entity.`
      );
    }
    assert(
      outcome.modelFacingScript.compiledText.includes("[CONTINUITY LOCK]"),
      `${intent} final Seedance script is missing the Continuity Lock section.`
    );
    assert(
      outcome.executionValidation.status === "COMMERCIAL_EXECUTION_VALIDATED",
      `${intent} execution validation failed: ${outcome.executionValidation.failureReasons.join(" | ")}`
    );
  }
  assert(takeCounts.some((count) => count === 1), "No intent compiles five narrative beats into one take.");
  assert(
    pipelinePlans.get("URBAN_MOTION").plan.continuity.takePlan.takes.length === 1,
    "URBAN_MOTION must resolve its framing changes through continuous camera movement, not a new take."
  );
  assert(
    pipelinePlans.get("PRODUCT_CRAFT").plan.continuity.takePlan.takes.length === 1,
    "PRODUCT_CRAFT preparation-to-worn-use transition must stay inside one continuous take."
  );
  record(
    "CASE 07",
    "five narrative beats may compile into fewer than five Takes",
    `take counts: ${intents.map((intent, index) => `${intent}=${takeCounts[index]}`).join(", ")}`
  );

  {
    const dismissed = planCommercialContinuity({
      worldModel: worldModel([character({ space: "inside the room" })]),
      beats: [
        beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("establish")] }) }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({ evidence: [visibleEvidence("detail_beat")] }),
          cameraState: { scale: "PROXIMAL", subjectRelation: "LOWER_BODY", handoff: "REQUIRES_CUT" },
          takeBoundary: {
            motivation: "SPATIAL_BOUNDARY",
            boundaryReason: "A product detail would be easier to read with a new setup.",
            boundaryEvidence: [
              {
                kind: "SPATIAL_TRANSITION",
                statement: "A product detail would be easier to read with a new setup.",
                proof: {
                  entityId: "character",
                  attribute: "space",
                  fromValue: "inside the room",
                  toValue: "somewhere else",
                },
              },
            ],
            whyContinuousTakeFails: "The product would read more clearly from another setup.",
          },
        }),
      ],
    });
    assert(dismissed.takePlan.takes.length === 1, "An unproven spatial boundary still created a new take.");
    assert(
      dismissed.takePlan.boundaryDecisions.some((decision) => decision.admitted === false),
      "The dropped boundary decision is not recorded."
    );
    record(
      "CASE 08",
      "DETAIL / HERO cannot create an unnecessary spatial reset",
      "an unproven product-emphasis boundary is dropped and the take stays continuous"
    );
  }

  {
    let continuousHeroSeen = false;
    for (const intent of intents) {
      const { plan } = pipelinePlans.get(intent);
      const heroShot = plan.shotArchitecture.shots[3];
      const heroEvent = plan.eventSpine.shots[3];
      assert(
        plan.qc.hero_moment_exists.status === "PASS",
        `${intent} HERO gate failed under the continuity rule: ${plan.qc.hero_moment_exists.reason}`
      );
      if (heroEvent.actionContinuity !== "CONTINUOUS") continue;
      continuousHeroSeen = true;
      assert(
        heroShot.camera.movement !== "brief_hero_hold",
        `${intent} still forces brief_hero_hold on a continuous HERO action.`
      );
      assert(
        !/hold/i.test(heroShot.camera.movementLine),
        `${intent} continuous HERO movement line still asks for a hold: ${heroShot.camera.movementLine}`
      );
      assert(
        Boolean(heroShot.productMessageDimension),
        `${intent} continuous HERO shot lost its reference-bound readability dimension.`
      );
      const forced = {
        ...plan,
        shotArchitecture: {
          ...plan.shotArchitecture,
          shots: plan.shotArchitecture.shots.map((shot) => (
            shot.shotIndex === 3
              ? { ...shot, camera: { ...shot.camera, movement: "brief_hero_hold" } }
              : shot
          )),
        },
      };
      const forcedQc = runCommercialFilmQc(forced);
      assert(
        forcedQc.qc.hero_moment_exists.status === "FAIL",
        `${intent} accepted a forced hero hold inside a continuous action.`
      );
    }
    assert(continuousHeroSeen, "No intent exercises HERO readability inside a continuous action.");
    record(
      "CASE 09",
      "HERO product readability can happen during continuous natural action",
      "continuous HERO beats keep moving, and a forced hold fails the HERO gate"
    );
  }

  // ---------------------------------------------------------------- CASE 10
  {
    const plan = planCommercialContinuity({
      worldModel: worldModel([
        character({ space: "inside the home" }),
        threshold({ id: "front_door", label: "the front door" }),
      ]),
      beats: [
        beat({
          shotIndex: 0,
          stateContract: stateContract({
            effects: [actionEffect("front_door", "state", "closed", "open", "OPEN_DOOR", "opened")],
          }),
        }),
        beat({ shotIndex: 1, stateContract: stateContract({ evidence: [visibleEvidence("beat_two")] }) }),
        beat({ shotIndex: 2, stateContract: stateContract({ evidence: [visibleEvidence("beat_three")] }) }),
        beat({ shotIndex: 3, stateContract: stateContract({ evidence: [visibleEvidence("beat_four")] }) }),
        beat({
          shotIndex: 4,
          stateContract: stateContract({
            effects: [actionEffect("front_door", "state", "closed", "open", "OPEN_DOOR", "opened")],
            prohibited: [prohibitedTransition("front_door", "state", "open", "closed")],
          }),
        }),
      ],
    });
    assert(plan.status === "BLOCKED", "CASE 10 did not block a release that restarts a completed event.");
    assert(
      conflictCodes(plan).includes("DUPLICATE_SINGLE_USE_ACTION"),
      `CASE 10 blocked without the duplicate action conflict: ${conflictCodes(plan).join(", ")}`
    );
    record("CASE 10", "final RELEASE cannot restart an already completed event", conflictCodes(plan).join(", "));
  }

  // ---------------------------------------------------------------- CASE 11
  {
    const base = planCommercialContinuity({
      worldModel: pipelinePlans.get("DAILY_STYLING").plan.continuity.worldModel,
      beats: pipelinePlans.get("DAILY_STYLING").plan.eventSpine.shots,
    });
    const proseChanged = pipelinePlans.get("DAILY_STYLING").plan.eventSpine.shots.map((shot) => ({
      ...shot,
      whatHappens: "A completely different piece of descriptive prose.",
      whyItHappens: "A different creative explanation that must not change state.",
      causalFromPrevious: "A different continuity sentence.",
      framingHint: "A different camera sentence.",
    }));
    const afterProseChange = planCommercialContinuity({
      worldModel: pipelinePlans.get("DAILY_STYLING").plan.continuity.worldModel,
      beats: proseChanged,
    });
    assert(
      JSON.stringify(base.worldStateTimeline) === JSON.stringify(afterProseChange.worldStateTimeline),
      "CASE 11 prose wording changed the deterministic world-state reduction."
    );
    assert(
      JSON.stringify(base.conflicts) === JSON.stringify(afterProseChange.conflicts),
      "CASE 11 prose wording changed the continuity conflicts."
    );
    record(
      "CASE 11",
      "changing prose while preserving the structured contract must not change state",
      "world-state timeline and conflicts stay identical"
    );
  }

  // ------------------------------------------------- CASE 12 / 13 (pipeline level)
  {
    for (const intent of intents) {
      const { plan } = pipelinePlans.get(intent);
      const takes = plan.continuity.takePlan.takes;
      const detailShot = plan.shotArchitecture.shots.find((shot) => shot.role === "DETAIL");
      const heroShot = plan.shotArchitecture.shots.find((shot) => shot.role === "HERO");
      assert(
        takes.some((take) => take.shotIndexes.includes(detailShot.shotIndex - 1) && take.shotIndexes.includes(detailShot.shotIndex)),
        `${intent} creates a take boundary at the DETAIL beat.`
      );
      assert(
        takes.some((take) => take.shotIndexes.includes(heroShot.shotIndex - 1) && take.shotIndexes.includes(heroShot.shotIndex)),
        `${intent} creates a take boundary at the HERO beat.`
      );
    }
    record("CASE 12", "DETAIL role alone cannot create a Take boundary", "every DETAIL beat shares its take with the previous beat");
    record("CASE 13", "HERO role alone cannot create a Take boundary", "every HERO beat shares its take with the previous beat");
  }

  // ---------------------------------------------------------------- CASE 14
  {
    const plan = planCommercialContinuity({
      worldModel: worldModel([character({ space: "on the city route" })]),
      beats: [
        beat({
          shotIndex: 0,
          stateContract: stateContract({ evidence: [visibleEvidence("establish")] }),
          cameraState: { scale: "ENVIRONMENTAL", subjectRelation: "FULL_PERSON", handoff: "CONTINUOUS" },
        }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({ evidence: [visibleEvidence("lower_body_reframe")] }),
          cameraState: { scale: "MEDIUM", subjectRelation: "LOWER_BODY", handoff: "REQUIRES_CUT" },
          takeBoundary: {
            motivation: "CAMERA_STATE_DISCONTINUITY",
            boundaryReason: "The lower body would read from a ground-level frame.",
            boundaryEvidence: [
              {
                kind: "CAMERA_STATE_CHANGE",
                statement: "The framing changes from full figure to lower body.",
                proof: {
                  fromCameraState: { scale: "ENVIRONMENTAL", subjectRelation: "FULL_PERSON", handoff: "CONTINUOUS" },
                  toCameraState: { scale: "MEDIUM", subjectRelation: "LOWER_BODY", handoff: "REQUIRES_CUT" },
                },
              },
            ],
            whyContinuousTakeFails: "The lower body is easier to read from the new framing.",
          },
        }),
      ],
    });
    assert(plan.takePlan.takes.length === 1, "CASE 14 admitted a lower-body reframing as a take boundary.");
    record(
      "CASE 14",
      "Lower-body reframing alone cannot create a Take boundary",
      "a camera-state change without narrative, spatial, or physical motivation is not admitted"
    );
  }

  // ---------------------------------------------------------------- CASE 15
  {
    for (const intent of intents) {
      const { plan } = pipelinePlans.get(intent);
      plan.continuity.takePlan.boundaryDecisions.forEach((decision) => {
        if (!decision.admitted) return;
        assert(
          decision.whyContinuousTakeFails.trim().length > 0,
          `${intent} admitted a take boundary with an empty whyContinuousTakeFails.`
        );
        assert(
          decision.boundaryEvidence.length > 0,
          `${intent} admitted a take boundary without structured evidence.`
        );
      });
    }
    const emptyWhy = planCommercialContinuity({
      worldModel: worldModel([character({ space: "inside the room" })]),
      beats: [
        beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("establish")] }) }),
        beat({
          shotIndex: 1,
          stateContract: stateContract({ evidence: [visibleEvidence("empty_why")] }),
          takeBoundary: {
            motivation: "CAMERA_STATE_DISCONTINUITY",
            boundaryReason: "A cut would be convenient.",
            boundaryEvidence: [],
            whyContinuousTakeFails: "",
          },
        }),
      ],
    });
    assert(emptyWhy.takePlan.takes.length === 1, "CASE 15 admitted a boundary with an empty whyContinuousTakeFails.");
    record(
      "CASE 15",
      "Every Take boundary must have non-empty whyContinuousTakeFails",
      "empty or unevidenced declarations stay continuous"
    );
  }

  // ---------------------------------------------------------------- CASE 16
  {
    const busWorld = worldModel([
      character({ space: "waiting at the stop" }),
      objectEntity({ id: "bus", label: "the bus", state: "at the stop" }),
    ]);
    const busBeats = [
      beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("approach")] }) }),
      beat({ shotIndex: 1, stateContract: stateContract({ evidence: [visibleEvidence("decision")] }) }),
      beat({
        shotIndex: 2,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "at the stop",
              toValue: "departed without her",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus leaves while she stays.",
            },
          ],
          evidence: [visibleEvidence("bus_departs")],
        }),
      }),
      beat({ shotIndex: 3, stateContract: stateContract({ evidence: [visibleEvidence("walk_on")] }) }),
      beat({ shotIndex: 4, stateContract: stateContract({ evidence: [visibleEvidence("end")] }) }),
    ];
    const reduced = planCommercialContinuity({ worldModel: busWorld, beats: busBeats });
    const validDecision = planCommercialMicroDecision({
      declaration: {
        routine: "A bus arrives while she is walking.",
        expectation: "The viewer expects her to board the bus.",
        trigger: "The bus arrives at the stop.",
        expectedAction: "board the bus",
        chosenAction: "she stays on the pavement and lets the bus leave",
        visibleConsequence: "the bus departs without her",
        continuation: "she continues walking",
        decisionBeatIndex: 1,
        consequenceBeatIndex: 2,
        triggerState: requireState("bus", "state", "at the stop"),
        decisionPrecondition: requireState("character", "space", "waiting at the stop"),
        decisionEffect: null,
        consequencePrecondition: requireState("character", "space", "waiting at the stop"),
        consequenceEffect: {
          entityId: "bus",
          attribute: "state",
          fromValue: "at the stop",
          toValue: "departed without her",
          cause: "ENVIRONMENT",
          actionId: null,
          actionLabel: null,
          reason: "The bus leaves.",
        },
        chosenActionId: "STAY",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
      beats: busBeats,
      timeline: reduced.worldStateTimeline,
    });
    assert(
      validDecision.status === "MICRO_DECISION_VALIDATED",
      `CASE 16 rejected a state-mutating consequence: ${validDecision.failureReasons.join(" | ")}`
    );
    const statelessDecision = planCommercialMicroDecision({
      declaration: {
        ...validDecision.contract,
        consequenceEffect: {
          entityId: "bus",
          attribute: "state",
          fromValue: "departed without her",
          toValue: "departed without her",
          cause: "ENVIRONMENT",
          actionId: null,
          actionLabel: null,
          reason: "No visible change.",
        },
      },
      beats: [
        ...busBeats.slice(0, 2),
        {
          ...busBeats[2],
          stateContract: stateContract({
            effects: [
              {
                entityId: "bus",
                attribute: "state",
                fromValue: "departed without her",
                toValue: "departed without her",
                cause: "ENVIRONMENT",
                actionId: null,
                actionLabel: null,
                reason: "No visible change.",
              },
            ],
            evidence: [visibleEvidence("bus_departs")],
          }),
        },
        ...busBeats.slice(3),
      ],
      timeline: reduced.worldStateTimeline,
    });
    assert(
      statelessDecision.failureReasons.some((line) => line.includes("MICRO_DECISION_CONSEQUENCE_EFFECT_STATELESS")),
      `CASE 16 accepted a consequence that changes no state: ${statelessDecision.failureReasons.join(" | ")}`
    );
    record(
      "CASE 16",
      "Micro Decision consequence must mutate observable structured state",
      "a no-op consequence fails; a bus location change validates"
    );
  }

  // ---------------------------------------------------------------- CASE 17
  {
    const busWorld = worldModel([
      character({ space: "waiting at the stop" }),
      objectEntity({ id: "bus", label: "the bus", state: "at the stop" }),
    ]);
    const busBeats = [
      beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("approach")] }) }),
      beat({ shotIndex: 1, stateContract: stateContract({ evidence: [visibleEvidence("decision")] }) }),
      beat({
        shotIndex: 2,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "at the stop",
              toValue: "departed without her",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus leaves.",
            },
          ],
          evidence: [visibleEvidence("bus_departs")],
        }),
      }),
      beat({ shotIndex: 3, stateContract: stateContract({ evidence: [visibleEvidence("walk_on")] }) }),
      beat({
        shotIndex: 4,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "departed without her",
              toValue: "at the stop",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus returns.",
            },
          ],
          evidence: [visibleEvidence("bus_returns")],
        }),
      }),
    ];
    const reduced = planCommercialContinuity({ worldModel: busWorld, beats: busBeats });
    const restarted = planCommercialMicroDecision({
      declaration: {
        routine: "A bus arrives while she is walking.",
        expectation: "The viewer expects her to board the bus.",
        trigger: "The bus arrives at the stop.",
        expectedAction: "board the bus",
        chosenAction: "she stays on the pavement and lets the bus leave",
        visibleConsequence: "the bus departs without her",
        continuation: "she continues walking",
        decisionBeatIndex: 1,
        consequenceBeatIndex: 2,
        triggerState: requireState("bus", "state", "at the stop"),
        decisionPrecondition: requireState("character", "space", "waiting at the stop"),
        decisionEffect: null,
        consequencePrecondition: requireState("character", "space", "waiting at the stop"),
        consequenceEffect: {
          entityId: "bus",
          attribute: "state",
          fromValue: "at the stop",
          toValue: "departed without her",
          cause: "ENVIRONMENT",
          actionId: null,
          actionLabel: null,
          reason: "The bus leaves.",
        },
        chosenActionId: "STAY",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
      beats: busBeats,
      timeline: reduced.worldStateTimeline,
    });
    assert(
      restarted.failureReasons.some((line) => line.includes("MICRO_DECISION_EXPECTED_ACTION_RESTARTS")),
      `CASE 17 accepted a later restoration of the expected action trigger: ${restarted.failureReasons.join(" | ")}`
    );
    record(
      "CASE 17",
      "Expected action cannot restart after the chosen action commits",
      "restoring the bus trigger after the decision is rejected"
    );
  }

  // ---------------------------------------------------------------- CASE 18
  {
    const daily = pipelinePlans.get("DAILY_STYLING").plan;
    const baselineLock = buildCommercialContinuityLock({
      model: daily.continuity.worldModel,
      timeline: daily.continuity.worldStateTimeline,
      finalState: daily.continuity.finalState,
      beats: daily.eventSpine.shots,
    });
    const proseOnlyChange = daily.eventSpine.shots.map((shot) => ({
      ...shot,
      whatHappens: `A hidden phone inside a closed bag. ${shot.whatHappens}`,
      whyItHappens: "A different reason that mentions a phone and a door.",
    }));
    const changedLock = buildCommercialContinuityLock({
      model: daily.continuity.worldModel,
      timeline: daily.continuity.worldStateTimeline,
      finalState: daily.continuity.finalState,
      beats: proseOnlyChange,
    });
    assert(
      JSON.stringify(baselineLock) === JSON.stringify(changedLock),
      "CASE 18 prose wording changed the Continuity Lock."
    );
    const urban = pipelinePlans.get("URBAN_MOTION").plan;
    const urbanLock = buildCommercialContinuityLock({
      model: urban.continuity.worldModel,
      timeline: urban.continuity.worldStateTimeline,
      finalState: urban.continuity.finalState,
      beats: urban.eventSpine.shots.map((shot) => ({
        ...shot,
        whatHappens: `A phone hides in a bag and a door closes. ${shot.whatHappens}`,
      })),
    });
    assert(
      !/\b(?:phone|door|threshold|gate|lid)\b/i.test(urbanLock.lines.join(" ")),
      "CASE 18 emitted phone or door rules for prose words instead of structured entities."
    );
    record(
      "CASE 18",
      "Continuity Lock changes only when structured world facts change",
      "prose mutations and prose-only phone/door words produce no lock change or invented rule"
    );
  }

  // ---------------------------------------------------------------- CASE 19
  {
    const stayWorld = worldModel([
      character({ space: "waiting at the stop" }),
      objectEntity({ id: "bus", label: "the bus", state: "at the stop" }),
    ]);
    const stayBeats = [
      beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("approach")] }) }),
      beat({ shotIndex: 1, stateContract: stateContract({ evidence: [visibleEvidence("decision")] }) }),
      beat({
        shotIndex: 2,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "at the stop",
              toValue: "departed without her",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus leaves.",
            },
          ],
          evidence: [visibleEvidence("bus_departs")],
        }),
      }),
      beat({ shotIndex: 3, stateContract: stateContract({ evidence: [visibleEvidence("walk_on")] }) }),
      beat({ shotIndex: 4, stateContract: stateContract({ evidence: [visibleEvidence("end")] }) }),
    ];
    const reduced = planCommercialContinuity({ worldModel: stayWorld, beats: stayBeats });
    const stayPlan = planCommercialMicroDecision({
      declaration: {
        routine: "A bus arrives while she is waiting.",
        expectation: "The viewer expects her to board the bus.",
        trigger: "The bus arrives at the stop.",
        expectedAction: "board the bus",
        chosenAction: "she stays on the pavement and lets the bus leave",
        visibleConsequence: "the bus departs without her",
        continuation: "she continues walking",
        decisionBeatIndex: 1,
        consequenceBeatIndex: 2,
        triggerState: requireState("bus", "state", "at the stop"),
        decisionPrecondition: requireState("character", "space", "waiting at the stop"),
        decisionEffect: null,
        consequencePrecondition: requireState("character", "space", "waiting at the stop"),
        consequenceEffect: {
          entityId: "bus",
          attribute: "state",
          fromValue: "at the stop",
          toValue: "departed without her",
          cause: "ENVIRONMENT",
          actionId: null,
          actionLabel: null,
          reason: "The bus leaves.",
        },
        chosenActionId: "STAY",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
      beats: stayBeats,
      timeline: reduced.worldStateTimeline,
    });
    assert(stayPlan.status === "MICRO_DECISION_VALIDATED", `CASE 19 rejected a committed STAY decision: ${stayPlan.failureReasons.join(" | ")}`);
    assert(stayPlan.contract.decisionStatus === "COMMITTED", "CASE 19 did not record the committed decision state.");
    assert(stayPlan.contract.committedAtBeatIndex === 1, "CASE 19 committed the decision at the wrong beat.");
    assert(stayPlan.contract.chosenActionId === "STAY", "CASE 19 lost the generic chosen action token.");
    assert(
      reduced.finalState.attributes.character.space === "waiting at the stop",
      "CASE 19 changed the character's physical location instead of committing decision status."
    );
    record(
      "CASE 19",
      "A chosen action that preserves location still commits a structured decision state",
      "decisionStatus becomes COMMITTED while character.space remains waiting at the stop"
    );
  }

  // ---------------------------------------------------------------- CASE 20
  {
    const stayWorld = worldModel([
      character({ space: "waiting at the stop" }),
      objectEntity({ id: "bus", label: "the bus", state: "at the stop" }),
    ]);
    const stayBeats = [
      beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("approach")] }) }),
      beat({ shotIndex: 1, stateContract: stateContract({ evidence: [visibleEvidence("decision")] }) }),
      beat({
        shotIndex: 2,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "at the stop",
              toValue: "departed without her",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus leaves.",
            },
          ],
          evidence: [visibleEvidence("bus_departs")],
        }),
      }),
      beat({ shotIndex: 3, stateContract: stateContract({ evidence: [visibleEvidence("walk_on")] }) }),
      beat({ shotIndex: 4, stateContract: stateContract({ evidence: [visibleEvidence("end")] }) }),
    ];
    const reduced = planCommercialContinuity({ worldModel: stayWorld, beats: stayBeats });
    const uncommitted = planCommercialMicroDecision({
      declaration: {
        routine: "A bus arrives while she is waiting.",
        expectation: "The viewer expects her to board the bus.",
        trigger: "The bus arrives at the stop.",
        expectedAction: "board the bus",
        chosenAction: "she stays on the pavement and lets the bus leave",
        visibleConsequence: "the bus departs without her",
        continuation: "she continues walking",
        decisionBeatIndex: 1,
        consequenceBeatIndex: 2,
        triggerState: requireState("bus", "state", "at the stop"),
        decisionPrecondition: requireState("character", "space", "waiting at the stop"),
        decisionEffect: null,
        consequencePrecondition: requireState("character", "space", "waiting at the stop"),
        consequenceEffect: {
          entityId: "bus",
          attribute: "state",
          fromValue: "at the stop",
          toValue: "departed without her",
          cause: "ENVIRONMENT",
          actionId: null,
          actionLabel: null,
          reason: "The bus leaves.",
        },
        chosenActionId: "STAY",
        consequenceDecisionStatusRequirement: "UNCOMMITTED",
      },
      beats: stayBeats,
      timeline: reduced.worldStateTimeline,
    });
    assert(
      uncommitted.failureReasons.some((line) => line.includes("MICRO_DECISION_COMMITMENT_REQUIRED")),
      `CASE 20 accepted a consequence without a committed decision: ${uncommitted.failureReasons.join(" | ")}`
    );
    record(
      "CASE 20",
      "Visible consequence cannot execute unless decisionStatus == COMMITTED",
      "a consequence precondition other than COMMITTED is rejected"
    );
  }

  // ---------------------------------------------------------------- CASE 21
  {
    const stayWorld = worldModel([
      character({ space: "waiting at the stop" }),
      objectEntity({ id: "bus", label: "the bus", state: "at the stop" }),
    ]);
    const returnBeats = [
      beat({ shotIndex: 0, stateContract: stateContract({ evidence: [visibleEvidence("approach")] }) }),
      beat({ shotIndex: 1, stateContract: stateContract({ evidence: [visibleEvidence("decision")] }) }),
      beat({
        shotIndex: 2,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "at the stop",
              toValue: "departed without her",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus leaves.",
            },
          ],
          evidence: [visibleEvidence("bus_departs")],
        }),
      }),
      beat({ shotIndex: 3, stateContract: stateContract({ evidence: [visibleEvidence("walk_on")] }) }),
      beat({
        shotIndex: 4,
        stateContract: stateContract({
          effects: [
            {
              entityId: "bus",
              attribute: "state",
              fromValue: "departed without her",
              toValue: "at the stop",
              cause: "ENVIRONMENT",
              actionId: null,
              actionLabel: null,
              reason: "The bus returns.",
            },
          ],
          evidence: [visibleEvidence("bus_returns")],
        }),
      }),
    ];
    const reduced = planCommercialContinuity({ worldModel: stayWorld, beats: returnBeats });
    const reactivated = planCommercialMicroDecision({
      declaration: {
        routine: "A bus arrives while she is waiting.",
        expectation: "The viewer expects her to board the bus.",
        trigger: "The bus arrives at the stop.",
        expectedAction: "board the bus",
        chosenAction: "she stays on the pavement and lets the bus leave",
        visibleConsequence: "the bus departs without her",
        continuation: "she continues walking",
        decisionBeatIndex: 1,
        consequenceBeatIndex: 2,
        triggerState: requireState("bus", "state", "at the stop"),
        decisionPrecondition: requireState("character", "space", "waiting at the stop"),
        decisionEffect: null,
        consequencePrecondition: requireState("character", "space", "waiting at the stop"),
        consequenceEffect: {
          entityId: "bus",
          attribute: "state",
          fromValue: "at the stop",
          toValue: "departed without her",
          cause: "ENVIRONMENT",
          actionId: null,
          actionLabel: null,
          reason: "The bus leaves.",
        },
        chosenActionId: "STAY",
        consequenceDecisionStatusRequirement: "COMMITTED",
      },
      beats: returnBeats,
      timeline: reduced.worldStateTimeline,
    });
    assert(
      reactivated.failureReasons.some((line) => line.includes("MICRO_DECISION_EXPECTED_ACTION_RESTARTS")),
      `CASE 21 accepted an expected action reactivation after commitment: ${reactivated.failureReasons.join(" | ")}`
    );
    assert(
      reactivated.contract.decisionStatus === "COMMITTED",
      "CASE 21 lost the committed status while rejecting the later reactivation."
    );
    record(
      "CASE 21",
      "After COMMITTED, expectedAction cannot become active again without a new decision cycle",
      "restoring the bus trigger after STAY commits is rejected"
    );
  }

  const firstRun = runCommercialFilmPipeline(pipelineRequest("DAILY_STYLING"));
  const secondRun = runCommercialFilmPipeline(pipelineRequest("DAILY_STYLING"));
  assert(firstRun.status === "GENERATED" && secondRun.status === "GENERATED", "Determinism check could not generate a plan.");
  assert(
    JSON.stringify(firstRun.plan.continuity) === JSON.stringify(secondRun.plan.continuity),
    "The continuity state layer is not deterministic."
  );

  const expectedCaseIds = Array.from({ length: 21 }, (_, index) => `CASE ${String(index + 1).padStart(2, "0")}`);
  assert(
    caseResults.map((entry) => entry.caseId).join("|") === expectedCaseIds.join("|"),
    "Not all ten regression cases ran in order."
  );

  console.log("COMMERCIAL FILM CONTINUITY REGRESSION PASS:", JSON.stringify({
    stage: "COMMERCIAL_FILM_CONTINUITY",
    cases: caseResults,
    takeCounts: intents.map((intent, index) => ({ intent, takes: takeCounts[index] })),
    continuityDeterministic: true,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
