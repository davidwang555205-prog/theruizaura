import { build } from "esbuild";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { sha256 } from "./commercialV13Harness.mjs";

/**
 * Exports the three real Commercial Film V1.5 pipeline outputs for Seedance
 * visual acceptance. The compiled text is copied byte-for-byte from the model
 * facing execution compiler; no prompt is authored in this script.
 */

const projectRoot = resolve(import.meta.dirname, "..");
const v2Export = process.argv.includes("--v2");
const v3Export = process.argv.includes("--v3");
const outputDirectory = v3Export
  ? resolve(projectRoot, "artifacts", "commercial-v1.5-seedance-acceptance-v3")
  : v2Export
    ? resolve(projectRoot, "artifacts", "commercial-v1.5-seedance-acceptance-v2")
    : resolve(projectRoot, "artifacts", "commercial-v1.5-seedance-acceptance");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-v15-acceptance-export-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");

const coverage = [];

const externalReference = {
  referenceSetId: "commercial-v15-seedance-acceptance-reference",
  taskId: "commercial-v15-seedance-acceptance-task",
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

const characterInput = {
  ageProfileId: "age_33_37",
  appearanceGroupId: "asian",
};

const busScenario = {
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
  scenarioState: busScenario,
};

const expectedFailureModes = {
  "case-a": [
    "door is unlocked more than once",
    "door is opened more than once",
    "character returns outside after entering",
    "door direction changes between shots",
    "character spatial motion resets",
  ],
  "case-b": [
    "character boards and then reappears outside",
    "bus leaves before the decision",
    "bus returns after departing",
    "decision exists only in prose without visible action",
    "product creates a separate hero stop",
    "phone or another prop enters the story",
  ],
  "case-c": [
    "five separate spatial reinitializations",
    "character stops to present the shoe",
    "standalone shoe close-up",
    "hero pose",
    "city direction or walking axis changes",
  ],
};

const casePurposes = {
  "case-a": "Isolate door/threshold single-use state and inside/outside character continuity.",
  "case-b": "Isolate the Micro Decision commitment and its visible consequence.",
  "case-c": "Prove five narrative beats can remain exactly one continuous take.",
};

function collectSingleUseActions(plan) {
  const records = [];
  const seen = new Set();
  plan.eventSpine.shots.forEach((shot) => {
    shot.stateContract.effects.forEach((effect) => {
      if (effect.actionId && !seen.has(effect.actionId)) {
        seen.add(effect.actionId);
        records.push({
          actionId: effect.actionId,
          actionLabel: effect.actionLabel,
          entityId: effect.entityId,
          attribute: effect.attribute,
          fromValue: effect.fromValue,
          toValue: effect.toValue,
          shotIndex: shot.shotIndex,
        });
      }
    });
    const singleUse = shot.stateContract.singleUseAction;
    if (singleUse && !seen.has(singleUse.actionId)) {
      seen.add(singleUse.actionId);
      records.push({
        actionId: singleUse.actionId,
        actionLabel: singleUse.label,
        entityId: singleUse.entityId,
        attribute: singleUse.attribute,
        fromValue: singleUse.fromValue,
        toValue: singleUse.toValue,
        shotIndex: shot.shotIndex,
      });
    }
  });
  return records;
}

function writeStateJson(plan, caseId) {
  return {
    caseId,
    film: {
      worldModel: plan.continuity.worldModel,
      initialState: plan.continuity.initialState,
      finalState: plan.continuity.finalState,
      timeline: plan.continuity.worldStateTimeline,
      singleUseActions: collectSingleUseActions(plan),
      conflicts: plan.continuity.conflicts,
    },
    microDecision: {
      declared: plan.microDecision.contract !== null,
      contract: plan.microDecision.contract,
      scenarioTimeline: plan.microDecision.scenarioTimeline,
    },
  };
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
  await mkdir(outputDirectory, { recursive: true });

  const allCases = [
    {
      caseId: "case-a",
      slug: "case-a-home-threshold",
      intent: "NEW_ARRIVAL",
      microDecision: null,
    },
    {
      caseId: "case-b",
      slug: "case-b-bus-micro-decision",
      intent: "URBAN_MOTION",
      microDecision: busMicroDecision,
    },
    {
      caseId: "case-c",
      slug: "case-c-continuous-walk",
      intent: "URBAN_MOTION",
      microDecision: null,
    },
  ];
  const cases = v3Export
    ? allCases.filter((testCase) => testCase.caseId !== "case-b")
    : allCases;

  const manifestCases = [];
  for (const testCase of cases) {
    const outcome = runCommercialFilmPipeline({
      commercialIntent: testCase.intent,
      characterSelection: characterInput,
      season: "秋",
      lifestyleFeeling: "安静 / 自然 / 克制",
      duration: 15,
      reference: externalReference,
      ...(testCase.microDecision ? { microDecision: testCase.microDecision } : {}),
    });
    if (outcome.status !== "GENERATED") {
      throw new Error(`${testCase.caseId} did not generate: ${outcome.diagnostics.join(" | ")}`);
    }
    const plan = outcome.plan;
    const scriptText = outcome.modelFacingScript.compiledText;
    const takeCount = plan.continuity.takePlan.takes.length;
    const takeBoundaries = plan.continuity.takePlan.takes
      .filter((take) => take.boundary)
      .map((take) => ({
        takeIndex: take.takeIndex,
        motivation: take.boundary.motivation,
        boundaryReason: take.boundary.boundaryReason,
        boundaryEvidence: take.boundary.boundaryEvidence,
        whyContinuousTakeFails: take.boundary.whyContinuousTakeFails,
      }));

    if (testCase.caseId === "case-a" && takeCount > 2) {
      throw new Error(`case-a requires at most 2 takes, received ${takeCount}.`);
    }
    if (testCase.caseId === "case-b" && takeCount > 2) {
      throw new Error(`case-b requires at most 2 takes, received ${takeCount}.`);
    }
    if (testCase.caseId === "case-c" && takeCount !== 1) {
      throw new Error(`case-c requires exactly 1 take, received ${takeCount}.`);
    }

    const compiledScriptHash = sha256(scriptText);
    manifestCases.push({
      caseId: testCase.caseId,
      purpose: casePurposes[testCase.caseId],
      intent: testCase.intent,
      structuredInitialState: plan.continuity.initialState,
      structuredFinalState: plan.continuity.finalState,
      singleUseActions: collectSingleUseActions(plan),
      microDecision: plan.microDecision.contract,
      decisionStatus: plan.microDecision.contract?.decisionStatus ?? null,
      takeCount,
      takeBoundaries,
      continuityLockFacts: plan.continuity.continuityLock.facts,
      expectedFailureModes: expectedFailureModes[testCase.caseId],
      compiledScriptHash,
    });

    await writeFile(join(outputDirectory, `${testCase.slug}.txt`), scriptText);
    await writeFile(
      join(outputDirectory, `${testCase.caseId}-state.json`),
      `${JSON.stringify(writeStateJson(plan, testCase.caseId), null, 2)}\n`
    );
    await writeFile(
      join(outputDirectory, `${testCase.caseId}-take-plan.json`),
      `${JSON.stringify(plan.continuity.takePlan, null, 2)}\n`
    );
    if (testCase.caseId === "case-b") {
      await writeFile(
        join(outputDirectory, `${testCase.caseId}-micro-decision.json`),
        `${JSON.stringify({
          caseId: testCase.caseId,
          plan: plan.microDecision,
        }, null, 2)}\n`
      );
    }
  }

  const manifest = {
    schemaVersion: "commercial-film/v1.5-seedance-acceptance-manifest-v1",
    stage: "COMMERCIAL_FILM_V1_5_SEEDANCE_VISUAL_ACCEPTANCE",
    compiledFromMain: "28097b2",
    caseCount: manifestCases.length,
    cases: manifestCases,
  };
  await writeFile(
    join(outputDirectory, "commercial-v1.5-seedance-acceptance-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
  console.log("Commercial Film V1.5 Seedance acceptance pack exported:", outputDirectory);
  console.log("cases:", manifestCases.map((entry) => `${entry.caseId}:${entry.takeCount} take(s)`).join(", "));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
