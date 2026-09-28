import { build } from "esbuild";
import { mkdtemp, rm, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = resolve(import.meta.dirname, "..");
const previous = join(projectRoot, "artifacts/immersive-naturalistic-execution-v1-acceptance");
const tempDirectory = await mkdtemp(join(tmpdir(), "immersive-camera-naturalism-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n`
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
    NARRATIVE_TOPIC_CATALOG,
    AURA_CAMERA_EXECUTION_ROLE_RULES,
    IMMERSIVE_CAMERA_NATURALISM_RULES,
    EMOTION_NEVER_ACTS_RULE,
    findForbiddenEmotionalReleaseWording,
    findForbiddenSoundCueWording,
    runImmersiveNarrativePipeline,
    buildCameraNarrativeInput,
    planCameraNarrative,
  } = api;

  const outcomes = new Map();
  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const outcome = runImmersiveNarrativePipeline({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({
        id: `camera-naturalism-${topic.id}-${index}`,
        label,
      })),
    });
    assert(outcome.status === "GENERATED", `${topic.id} did not generate`);
    outcomes.set(topic.id, outcome);
  }

  const checks = [];
  const check = (id, name, passed) => checks.push({ id, name, status: passed ? "PASS" : "FAIL" });
  const allOutcomes = [...outcomes.values()];

  // Walking is not a follower warrant. The warrant remains available for a
  // future rule that declares a real narrative or spatial handoff.
  const walk = outcomes.get("weekend_walk");
  const fixtureInput = buildCameraNarrativeInput(
    walk.plan,
    walk.sceneResolution,
    walk.productPresence,
    walk.soundWorld
  );
  const noWarrantRule = {
    topicId: "weekend_walk",
    label: "No-warrant fixture",
    baseline: ["WAITING_CAMERA", "FOLLOWER", "OBSERVER", "OBSERVER", "AFTER_ACTION"],
    description: "Fixture proving walking alone cannot force FOLLOWER.",
  };
  const warrantedRule = {
    ...noWarrantRule,
    label: "Warranted fixture",
    followerWarrant: true,
  };
  const noWarrant = planCameraNarrative(fixtureInput, { rules: [noWarrantRule] });
  const warranted = planCameraNarrative(fixtureInput, { rules: [warrantedRule] });
  check(
    "01",
    "walking alone cannot force FOLLOWER",
    allOutcomes.every((outcome) => outcome.cameraNarrative.moments.every((moment) => moment.role !== "FOLLOWER"))
      && noWarrant.moments.every((moment) => moment.role !== "FOLLOWER")
      && warranted.moments.some((moment) => moment.role === "FOLLOWER")
  );

  check(
    "02",
    "product readability cannot force FOLLOWER",
    allOutcomes.every((outcome) => outcome.cameraExecution.plan.moments
      .filter((moment) => moment.productPresence === "READABLE" || moment.productPresence === "HERO")
      .every((moment) => moment.cameraRole !== "FOLLOWER"))
      && allOutcomes.every((outcome) => outcome.cameraExecution.plan.moments
        .filter((moment) => moment.productPresence === "READABLE")
        .every((moment) => /intermittent|temporal/i.test(moment.productVisibilityGuard)))
  );

  const followerRule = AURA_CAMERA_EXECUTION_ROLE_RULES.FOLLOWER;
  check(
    "03",
    "FOLLOWER does not imply continuous center lock",
    !/fixed working distance|parallel to the travel direction|full figure stays inside|centered|centre/i.test(
      `${followerRule.movementRelationToSubject} ${followerRule.subjectVisibility}`
    ) && /may lag/i.test(followerRule.movementRelationToSubject)
  );

  check(
    "04",
    "FOLLOWER permits temporary product unreadability",
    /not guaranteed|partially obscured/i.test(followerRule.subjectVisibility)
      && allOutcomes.every((outcome) => outcome.cameraExecution.plan.moments
        .filter((moment) => moment.productPresence === "READABLE")
        .every((moment) => /no guaranteed duration|intermittent/i.test(moment.productVisibilityGuard)))
  );

  check(
    "05",
    "camera cannot recover solely for shoe visibility",
    IMMERSIVE_CAMERA_NATURALISM_RULES.some((rule) => /shoe readability/i.test(rule))
      && walk.modelFacingScript.compiledText.includes("does not guarantee full-body, centered, or continuously readable presentation")
      && walk.modelFacingScript.compiledText.includes("temporary loss of product readability")
  );

  const boundaryIndexesByTopic = new Map();
  const boundaryTransitions = [];
  const nonBoundaryTransitions = [];
  for (const outcome of allOutcomes) {
    const boundaries = new Set(outcome.modelFacingScript.contracts
      .filter((contract) => contract.takeBoundary?.evidence && contract.takeBoundary?.whyContinuousCoverageFails)
      .map((contract) => contract.momentIndex));
    boundaryIndexesByTopic.set(outcome.plan.topicId, boundaries);
    for (const transition of outcome.modelFacingScript.diagnostics.cameraTransitions) {
      if (transition.momentIndex === 0) continue;
      if (boundaries.has(transition.momentIndex)) boundaryTransitions.push({ outcome, transition });
      else nonBoundaryTransitions.push({ outcome, transition });
    }
  }
  check(
    "06",
    "Moment boundary cannot reset framing relation",
    nonBoundaryTransitions.every(({ transition }) => transition.changed === false)
  );

  check(
    "07",
    "continuous Take preserves camera inertia",
    walk.modelFacingScript.diagnostics.cameraTransitions.every((transition, index) => (
      index === 0 || (transition.changed === false
        && transition.state.movementState === "locked_off"
        && transition.state.framingState === "wide")
    ))
  );

  const store = outcomes.get("bookstore_browse");
  const stopMoment = store.modelFacingScript.contracts.find((contract) => (
    contract.worldStateAfter?.facts["character.motion"] === "STOPPED"
  ));
  const stopCamera = store.modelFacingScript.moments.find((moment) => moment.momentIndex === stopMoment?.momentIndex);
  check(
    "08",
    "structured STOP cannot automatically create portrait composition",
    Boolean(stopCamera)
      && !/centered|centred|portrait|perfect|ideal|full figure/i.test(stopCamera.cameraObservation)
      && /does not re-center/i.test(stopCamera.cameraObservation)
  );

  const cafe = outcomes.get("afternoon_cafe");
  check(
    "09",
    "mandatory visual event does not require perfect framing",
    cafe.modelFacingScript.compiledText.includes("needs no dedicated shot, held pause, centered pose, or full unobstructed view")
      && cafe.modelFacingScript.compiledText.includes("does not guarantee full-body, centered, or continuously readable presentation")
  );

  // The three Camera acceptance Cases keep the previous Take Plan, Physical
  // Action Plan, Structured State, mandatory events, and final state.
  const cases = [
    ["weekend_walk", "A-weekend-walk", "C-weekend-walk"],
    ["bookstore_browse", "B-bookstore", "D-bookstore"],
    ["afternoon_cafe", "C-cafe", "A-cafe"],
  ];
  const expectedPhysicalActions = {
    weekend_walk: ["walking-006", "walking-006", "walking-026", "transition-010", "transition-010"],
    bookstore_browse: ["walking-006", "environment-response-004", "transition-010", "transition-010", "walking-006"],
    afternoon_cafe: ["walking-006", "walking-006", "turning-006", "walking-026", "seated-004"],
  };

  const readBaseline = (name, file) => readFile(join(previous, name, file), "utf8");
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  const takePlanResults = await Promise.all(cases.map(async ([topicId, , baselineName]) => {
    const outcome = outcomes.get(topicId);
    const current = outcome.presentation.directorScript.takes.map((take) => ({
      take: take.takeIndex + 1,
      moments: take.moments.map((moment) => moment.momentIndex + 1),
      motivation: take.motivation,
      boundary: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].takeBoundary,
      inheritedStart: outcome.modelFacingScript.contracts[take.moments[0].momentIndex].worldStateBefore,
    }));
    return same(current, JSON.parse(await readBaseline(baselineName, "take-plan.json")));
  }));
  check("10", "existing Take Plan unchanged", takePlanResults.every(Boolean));

  check(
    "11",
    "Physical Action Plan unchanged",
    cases.every(([topicId]) => same(
      outcomes.get(topicId).physicalAction.report.moments.map((moment) => moment.selectedActionId),
      expectedPhysicalActions[topicId]
    ))
  );

  const structuredIdentical = async (file, project) => {
    for (const [topicId, , baselineName] of cases) {
      const outcome = outcomes.get(topicId);
      const current = project(outcome);
      assert(same(current, JSON.parse(await readBaseline(baselineName, file))), `${file} changed for ${topicId}`);
    }
    return true;
  };
  const stateProjection = (outcome) => outcome.modelFacingScript.contracts.map((contract) => ({
    moment: contract.momentIndex + 1,
    authority: contract.stateAuthority,
    before: contract.worldStateBefore,
    preconditionEvidence: contract.stateConflicts,
    after: contract.worldStateAfter,
  }));
  const eventProjection = (outcome) => {
    const events = outcome.modelFacingScript.contracts.flatMap((contract) => contract.requiredVisibleEvidence);
    return [...new Map(events.map((item) => [item.id, item])).values()];
  };
  const finalProjection = (outcome) => outcome.modelFacingScript.contracts.at(-1).worldStateAfter;

  check("12", "Structured State unchanged", await structuredIdentical("state-timeline.json", stateProjection));
  check("12b", "mandatory events unchanged", await structuredIdentical("mandatory-visual-events.json", eventProjection));
  check("12c", "final state unchanged", await structuredIdentical("final-state.json", finalProjection));

  check(
    "13",
    "No-Sigh unchanged",
    allOutcomes.every((outcome) => (
      findForbiddenEmotionalReleaseWording(outcome.modelFacingScript.compiledText).length === 0
      && findForbiddenEmotionalReleaseWording(outcome.script.compiledText).length === 0
      && outcome.modelFacingScript.compiledText.includes(EMOTION_NEVER_ACTS_RULE)
      && outcome.soundWorld.moments
        .flatMap((moment) => [...moment.environment, ...moment.human, ...moment.object, ...moment.footwear])
        .every((cue) => findForbiddenSoundCueWording(cue).length === 0)
    ))
  );

  check(
    "14",
    "13 Topics still compile",
    outcomes.size === 13
      && allOutcomes.every((outcome) => (
        outcome.cameraNarrative.status === "CAMERA_NARRATIVE_APPROVED"
        && outcome.cameraExecution.plan.status === "CAMERA_EXECUTION_APPROVED"
        && outcome.scriptValidation.status === "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED"
        && outcome.executionValidation.status === "EXECUTION_SCRIPT_VALIDATED"
      ))
  );

  const failures = checks.filter((entry) => entry.status === "FAIL");
  console.log(JSON.stringify({
    status: failures.length ? "FAIL" : "PASS",
    checks,
    failures,
    cameraRoleChanges: allOutcomes.map((outcome) => ({
      topic: outcome.plan.topicId,
      roles: outcome.cameraNarrative.moments.map((moment) => moment.role),
    })),
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
