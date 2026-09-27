import { build } from "esbuild";
import { readFile, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

/**
 * Proves that authoritative Commercial Film state comes only from the
 * structured Event Contract and deterministic reducer. Prose fields and the
 * compiled script are outputs or defensive diagnostics, never state sources.
 */

const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-commercial-state-authority-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const stateAuthoritySources = [
  "src/commercial-film/event-spine/world-state.ts",
  "src/commercial-film/event-spine/execution-contracts.ts",
  "src/commercial-film/event-spine/continuity.ts",
  "src/commercial-film/event-spine/micro-decision.ts",
  "src/commercial-film/event-spine/takes.ts",
  "src/commercial-film/event-spine/continuity-lock.ts",
  "src/commercial-film/event-spine/planner.ts",
];

const proseStateMarkers = /whatHappens|whyItHappens|physicalActionLine|compiledText/;

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
  referenceSetId: "commercial-state-authority-reference-set",
  taskId: "commercial-state-authority-task",
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
    compileCommercialExecutionScript,
    planCommercialContinuity,
    planCommercialTakes,
    renderCommercialFilmPlanText,
    runCommercialFilmPipeline,
  } = api;

  const request = {
    commercialIntent: "DAILY_STYLING",
    characterSelection: { ageProfileId: "age_33_37", appearanceGroupId: "asian" },
    season: "秋",
    lifestyleFeeling: "安静 / 自然 / 克制",
    duration: 15,
    reference,
  };
  const outcome = runCommercialFilmPipeline(request);
  assert(outcome.status === "GENERATED", "State Authority validator could not generate a Commercial Film plan.");
  const plan = outcome.plan;
  const model = plan.continuity.worldModel;
  const timeline = plan.continuity.worldStateTimeline;
  const beats = plan.eventSpine.shots;

  // ------------------------------------------------------------ AUTHORITY 1
  const baseContinuity = planCommercialContinuity({ worldModel: model, beats });
  const proseChangedBeats = beats.map((shot) => ({
    ...shot,
    whatHappens: "The character teleports to another planet for the duration of this rewritten sentence.",
    whyItHappens: "A completely different motivation that changes no structured state fact.",
    causalFromPrevious: "A rewritten continuity sentence that has no state authority.",
    framingHint: "A rewritten framing sentence that has no state authority.",
  }));
  const proseChangedContinuity = planCommercialContinuity({
    worldModel: model,
    beats: proseChangedBeats,
  });
  assert(
    JSON.stringify(baseContinuity.worldStateTimeline) === JSON.stringify(proseChangedContinuity.worldStateTimeline),
    "AUTHORITY 1: prose wording changed the reduced World State timeline."
  );
  assert(
    JSON.stringify(baseContinuity.conflicts) === JSON.stringify(proseChangedContinuity.conflicts),
    "AUTHORITY 1: prose wording changed continuity conflicts."
  );

  // ------------------------------------------------------------ AUTHORITY 2
  const repeatedContinuity = planCommercialContinuity({ worldModel: model, beats });
  assert(
    JSON.stringify(baseContinuity.worldStateTimeline) === JSON.stringify(repeatedContinuity.worldStateTimeline)
      && JSON.stringify(baseContinuity.finalState) === JSON.stringify(repeatedContinuity.finalState),
    "AUTHORITY 2: the same structured contract did not produce the same deterministic state snapshots."
  );

  // ------------------------------------------------------------ AUTHORITY 3
  const baselineCompiled = compileCommercialExecutionScript(
    plan,
    renderCommercialFilmPlanText(plan)
  ).script.compiledText;
  const proseMutatedPlan = {
    ...plan,
    eventSpine: {
      ...plan.eventSpine,
      shots: plan.eventSpine.shots.map((shot) => ({
        ...shot,
        whatHappens: "A rewritten event sentence.",
        whyItHappens: "A rewritten cause sentence.",
        framingHint: "A rewritten framing sentence.",
      })),
    },
    actionPlan: plan.actionPlan.map((action) => ({
      ...action,
      physicalActionLine: "A rewritten physical action sentence.",
    })),
  };
  const proseMutatedCompiled = compileCommercialExecutionScript(
    proseMutatedPlan,
    renderCommercialFilmPlanText(proseMutatedPlan)
  ).script.compiledText;
  const lockOf = (text) => text.slice(
    text.indexOf("[CONTINUITY LOCK]"),
    text.indexOf("[TIMING]")
  );
  assert(
    lockOf(baselineCompiled) === lockOf(proseMutatedCompiled),
    "AUTHORITY 3: the compiler inferred Continuity Lock state from rewritten prose."
  );
  plan.continuity.continuityLock.lines.forEach((line) => {
    assert(
      lockOf(baselineCompiled).includes(line),
      `AUTHORITY 3: the compiled lock is missing a structured fact: ${line}`
    );
  });

  // ------------------------------------------------------------ AUTHORITY 4
  const baselineLock = buildCommercialContinuityLock({
    model,
    timeline,
    finalState: plan.continuity.finalState,
    beats,
  });
  const proseMutatedLock = buildCommercialContinuityLock({
    model,
    timeline,
    finalState: plan.continuity.finalState,
    beats: proseChangedBeats,
  });
  assert(
    JSON.stringify(baselineLock) === JSON.stringify(proseMutatedLock),
    "AUTHORITY 4: the Continuity Lock changed when only prose wording changed."
  );
  const urbanOutcome = runCommercialFilmPipeline({ ...request, commercialIntent: "URBAN_MOTION" });
  const urbanLock = buildCommercialContinuityLock({
    model: urbanOutcome.plan.continuity.worldModel,
    timeline: urbanOutcome.plan.continuity.worldStateTimeline,
    finalState: urbanOutcome.plan.continuity.finalState,
    beats: urbanOutcome.plan.eventSpine.shots.map((shot) => ({
      ...shot,
      whatHappens: `A hidden phone vibrates inside a closed bag and a door closes. ${shot.whatHappens}`,
    })),
  });
  assert(
    !/\b(?:phone|door|threshold|gate|lid)\b/i.test(urbanLock.lines.join(" ")),
    "AUTHORITY 4: prose mentions of a phone or door created an invented Continuity Lock rule."
  );

  // ------------------------------------------------------------ AUTHORITY 5
  const baseTakes = planCommercialTakes({
    model,
    timeline,
    beats,
  });
  const proseMutatedTakes = planCommercialTakes({
    model,
    timeline,
    beats: proseChangedBeats,
  });
  assert(
    JSON.stringify(baseTakes) === JSON.stringify(proseMutatedTakes),
    "AUTHORITY 5: the take planner read prose fields."
  );
  const cameraWorld = {
    schemaVersion: api.COMMERCIAL_WORLD_STATE_SCHEMA_VERSION,
    entities: [
      {
        id: "character",
        kind: "CHARACTER",
        label: "the character",
        initialAttributes: { space: "inside the room", anchor: "the room" },
        continuityLockAttributes: ["space"],
        containment: null,
      },
    ],
  };
  const cameraBeats = (handoff) => [
    {
      shotIndex: 0,
      durationSeconds: 3,
      stateContract: {
        preconditions: [],
        effects: [],
        requiredVisibleEvidence: [{ id: "establish", statement: "The room is established.", entityId: null }],
        prohibitedTransitions: [],
        singleUseAction: null,
      },
      cameraState: { scale: "ENVIRONMENTAL", subjectRelation: "FULL_PERSON", handoff: "CONTINUOUS" },
      actionContinuity: "CONTINUOUS",
      actionSequenceId: "same_sequence",
      actionRequiresFreshSetup: false,
      takeBoundary: null,
      timeGapSeconds: 0,
    },
    {
      shotIndex: 1,
      durationSeconds: 3,
      stateContract: {
        preconditions: [],
        effects: [],
        requiredVisibleEvidence: [{ id: "detail", statement: "A detail beat.", entityId: null }],
        prohibitedTransitions: [],
        singleUseAction: null,
      },
      cameraState: { scale: "MEDIUM", subjectRelation: "LOWER_BODY", handoff },
      actionContinuity: "CONTINUOUS",
      actionSequenceId: "same_sequence",
      actionRequiresFreshSetup: false,
      takeBoundary: {
        motivation: "CAMERA_STATE_DISCONTINUITY",
        boundaryReason: "The camera must cross a physical wall to reach this photographic state.",
        boundaryEvidence: [
          {
            kind: "CAMERA_STATE_CHANGE",
            statement: "The camera state changes.",
            proof: {
              fromCameraState: { scale: "ENVIRONMENTAL", subjectRelation: "FULL_PERSON", handoff: "CONTINUOUS" },
              toCameraState: { scale: "MEDIUM", subjectRelation: "LOWER_BODY", handoff },
            },
          },
          {
            kind: "PHYSICAL_INTERRUPTION",
            statement: "A physical wall separates the two camera positions.",
            proof: {},
          },
        ],
        whyContinuousTakeFails: "A wall physically prevents the camera from reaching this state continuously.",
      },
      timeGapSeconds: 0,
    },
  ];
  const cameraTimeline = [
    {
      shotIndex: 0,
      before: { shotIndex: 0, attributes: { character: { space: "inside the room", anchor: "the room" } }, completedActions: [] },
      after: { shotIndex: 0, attributes: { character: { space: "inside the room", anchor: "the room" } }, completedActions: [] },
      conflicts: [],
    },
    {
      shotIndex: 1,
      before: { shotIndex: 1, attributes: { character: { space: "inside the room", anchor: "the room" } }, completedActions: [] },
      after: { shotIndex: 1, attributes: { character: { space: "inside the room", anchor: "the room" } }, completedActions: [] },
      conflicts: [],
    },
  ];
  const cutBoundaryTakes = planCommercialTakes({
    model: cameraWorld,
    timeline: cameraTimeline,
    beats: cameraBeats("REQUIRES_CUT"),
  });
  const reframeTakes = planCommercialTakes({
    model: cameraWorld,
    timeline: cameraTimeline,
    beats: cameraBeats("CONTINUOUS"),
  });
  assert(
    cutBoundaryTakes.takes.length === 2 && reframeTakes.takes.length === 1,
    "AUTHORITY 5: the take planner did not react only to structured camera metadata."
  );

  // ------------------------------------------------------------ SOURCE AUDIT
  const sourceAudit = [];
  for (const relativePath of stateAuthoritySources) {
    const text = await readFile(resolve(projectRoot, relativePath), "utf8");
    const matches = proseStateMarkers.test(text);
    sourceAudit.push({ path: relativePath, readsProseOrCompiledText: matches });
    assert(!matches, `State authority source reads prose or compiled text: ${relativePath}`);
  }

  console.log("COMMERCIAL FILM STATE AUTHORITY VALIDATION PASS:", JSON.stringify({
    stage: "COMMERCIAL_FILM_STATE_AUTHORITY",
    stateSourcesAudited: sourceAudit,
    proseToStateDirection: "STRUCTURED_EVENT_CONTRACT -> STATE_REDUCER -> ACTION_WORDING -> FINAL_TEXT",
    reverseInferenceFound: false,
    proseWordingIndependence: true,
    deterministicStateReduction: true,
    compilerStateReinference: false,
    lockStructuredOnly: true,
    takePlannerStructuredOnly: true,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
