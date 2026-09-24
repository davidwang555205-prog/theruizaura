import { build } from "esbuild";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Audit-stage validator for Physical Action Compiler V1. It verifies canonical
// Moment index propagation, candidate preservation, and determinism. It does not
// claim that Physical Action matching or coverage is finished.
const projectRoot = resolve(import.meta.dirname, "..");
const tempDirectory = await mkdtemp(join(tmpdir(), "theruizaura-physical-action-validation-"));
const entryPath = join(tempDirectory, "entry.ts");
const bundlePath = join(tempDirectory, "bundle.mjs");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

function assertIndexAlignment(upstreamIndexes, physicalIndexes, label) {
  assert(
    JSON.stringify(upstreamIndexes) === JSON.stringify(physicalIndexes),
    `${label}: Physical Action canonical index ${JSON.stringify(physicalIndexes)} diverges from upstream Narrative Moment.index ${JSON.stringify(upstreamIndexes)}`
  );
}

function expectFailure(action, label) {
  let thrown = null;
  try {
    action();
  } catch (error) {
    thrown = error;
  }
  assert(thrown, `${label}: expected the index alignment check to FAIL, but it passed`);
  return thrown.message;
}

try {
  await writeFile(
    entryPath,
    `export * from ${JSON.stringify(resolve(projectRoot, "src/immersive-narrative/index.ts"))};\n` +
    `export { personActionLibrary, PERSON_ACTION_LIBRARY_EXPECTED_COUNT } from ${JSON.stringify(resolve(projectRoot, "src/data/personActionLibrary.ts"))};\n`
  );
  await build({ entryPoints: [entryPath], bundle: true, format: "esm", platform: "node", outfile: bundlePath, logLevel: "silent" });
  const {
    NARRATIVE_TOPIC_CATALOG,
    buildActionCapabilityMatrix,
    buildCameraNarrativeInput,
    buildMomentRequirementMatrix,
    buildPhysicalActionAuditInput,
    buildProductPresenceInput,
    buildSceneResolverInput,
    buildSoundWorldInput,
    planCameraNarrative,
    planImmersiveNarrative,
    planProductPresence,
    planSoundWorld,
    resolveNarrativeScenes,
    runPhysicalActionAudit,
    NARRATIVE_PRIMITIVE_REGISTRY,
    evaluatePrimitiveEvidenceEligibility,
    matchMoment,
    matchRequirementMatrix,
    runContinuityPass,
    personActionLibrary,
    PERSON_ACTION_LIBRARY_EXPECTED_COUNT,
  } = await import(`${pathToFileURL(bundlePath).href}?v=${Date.now()}`);

  // Legacy actions plus the Narrative-only registry are both valid selection
  // sources; the registry never enters the legacy 318 record count.
  const knownActionIds = new Set([
    ...personActionLibrary.map((action) => action.id),
    ...NARRATIVE_PRIMITIVE_REGISTRY.map((primitive) => primitive.actionId),
  ]);

  const CANONICAL_SEQUENCE = [0, 1, 2, 3, 4];
  const runTopic = (topic) => {
    const plan = planImmersiveNarrative({
      topic: topic.label,
      characterSelection: { ageProfileId: "age_28_32", appearanceGroupId: "asian" },
      season: "秋",
      lifestyleFeeling: "安静 / 克制",
      duration: 15,
      availableSceneLibrary: topic.defaultSceneLabels.map((label, index) => ({ id: `physical-${topic.id}-${index + 1}`, label })),
    });
    const sceneResolution = resolveNarrativeScenes(buildSceneResolverInput(plan, topic.label));
    const productPresence = planProductPresence(buildProductPresenceInput(plan, sceneResolution, topic.label));
    const soundWorld = planSoundWorld(buildSoundWorldInput(plan, sceneResolution, productPresence, topic.label));
    const cameraNarrative = planCameraNarrative(buildCameraNarrativeInput(plan, sceneResolution, productPresence, soundWorld));
    const built = buildPhysicalActionAuditInput({
      topicLabel: topic.label,
      plan,
      sceneResolution,
      productPresence,
      soundWorld,
      cameraNarrative,
    });
    return { plan, sceneResolution, productPresence, soundWorld, cameraNarrative, built };
  };

  const topics = [];
  const combinedInputMoments = [];
  let totalMoments = 0;
  let canonicalMismatches = 0;

  for (const topic of NARRATIVE_TOPIC_CATALOG) {
    const { plan, built } = runTopic(topic);
    assert(built.alignmentIssues.length === 0, `${topic.label} has Moment index alignment issues: ${built.alignmentIssues.join(" | ")}`);

    const upstreamIndexes = plan.moments.map((moment) => moment.index);
    assert(upstreamIndexes.length === 5, `${topic.label} must expose 5 Narrative Moments, received ${upstreamIndexes.length}`);
    assert(
      JSON.stringify(upstreamIndexes) === JSON.stringify(CANONICAL_SEQUENCE),
      `${topic.label} upstream canonical index sequence changed: ${upstreamIndexes.join(",")}`
    );

    const requirementMatrix = buildMomentRequirementMatrix(built.input);
    const report = runPhysicalActionAudit(built.input);
    const requirementIndexes = requirementMatrix.map((requirement) => requirement.momentIndex);
    const matchIndexes = report.moments.map((moment) => moment.momentIndex);
    const physicalIndexes = built.input.moments.map((moment) => moment.momentIndex);

    // A + B: canonical index propagation through every Physical Action record.
    assertIndexAlignment(upstreamIndexes, requirementIndexes, `${topic.label} Requirement Matrix`);
    assertIndexAlignment(upstreamIndexes, matchIndexes, `${topic.label} Moment Match`);
    assertIndexAlignment(upstreamIndexes, physicalIndexes, `${topic.label} Physical Action input`);
    if (JSON.stringify(upstreamIndexes) !== JSON.stringify(matchIndexes)) canonicalMismatches += 1;

    // Continuity records must reference canonical indexes only.
    for (const issue of report.continuityIssues) {
      assert(
        upstreamIndexes.includes(issue.fromMomentIndex) && upstreamIndexes.includes(issue.toMomentIndex),
        `${topic.label} continuity issue uses a non-canonical Moment index: ${issue.fromMomentIndex} -> ${issue.toMomentIndex}`
      );
      assert(
        issue.fromMomentIndex < issue.toMomentIndex,
        `${topic.label} continuity issue must move forward through canonical indexes`
      );
    }

    // F + G: no invented primitives, every selected id exists in the shared library.
    assert(report.coverage.addedPrimitiveCount === 0, `${topic.label} added an action primitive during the audit stage`);
    for (const moment of report.moments.filter((entry) => entry.status === "MATCHED")) {
      assert(
        knownActionIds.has(moment.selectedActionId),
        `${topic.label} invented an action id outside the shared library: ${moment.selectedActionId}`
      );
    }

    // Gap records must carry canonical indexes as well.
    for (const gap of report.gaps) {
      for (const affected of gap.affectedMoments) {
        assert(
          upstreamIndexes.includes(affected.momentIndex),
          `${topic.label} gap record ${gap.gapId} uses a non-canonical Moment index ${affected.momentIndex}`
        );
      }
    }

    totalMoments += report.moments.length;
    combinedInputMoments.push(...built.input.moments);
    topics.push({
      topic: topic.label,
      topicId: topic.id,
      requirementIndexes,
      matchIndexes,
      selections: report.moments.map((moment) => moment.selectedActionId),
      matched: report.coverage.matchedMoments,
      unresolved: report.coverage.unresolvedMoments,
      continuityIssues: report.continuityIssues.length,
      gapCount: report.gaps.length,
    });
  }

  // D: 13 topics x 5 Moments.
  assert(NARRATIVE_TOPIC_CATALOG.length === 13, `Expected 13 topics, received ${NARRATIVE_TOPIC_CATALOG.length}`);
  assert(totalMoments === 65, `Expected 65 evaluated Moments, received ${totalMoments}`);

  // E: existing Action integrity.
  assert(
    personActionLibrary.length === 318 && PERSON_ACTION_LIBRARY_EXPECTED_COUNT === 318,
    `Existing Action count changed: ${personActionLibrary.length} (expected 318)`
  );

  // G: capability matrix keeps all 318 source records as independent entries.
  const matrix = buildActionCapabilityMatrix();
  assert(matrix.length === 318, `Capability Matrix must keep 318 independent source records, received ${matrix.length}`);
  assert(new Set(matrix.map((entry) => entry.actionId)).size === 318, "Capability Matrix lost source action identity");
  assert(
    matrix.every((entry) => entry.actionId && entry.actionFamily && entry.movementState && entry.footwork.pattern && entry.hand.sourceHandTask),
    "Capability Matrix produced an incomplete normalized record"
  );
  assert(
    matrix.every((entry) => entry.source === "SHARED_ACTION_LIBRARY"),
    "Capability Matrix must report the shared action library as its source during this stage"
  );

  // C: no local re-indexing. A shifted canonical sequence must survive untouched.
  const fixtureTopic = NARRATIVE_TOPIC_CATALOG[0];
  const { plan, sceneResolution, productPresence, soundWorld, cameraNarrative } = runTopic(fixtureTopic);
  const shiftedIndexes = [5, 7, 9, 11, 13];
  const shiftedPlan = {
    ...plan,
    moments: plan.moments.map((moment, position) => ({ ...moment, index: shiftedIndexes[position] })),
  };
  const shiftMoment = (moment, position) => ({ ...moment, momentIndex: shiftedIndexes[position] });
  const shiftedBuilt = buildPhysicalActionAuditInput({
    topicLabel: fixtureTopic.label,
    plan: shiftedPlan,
    sceneResolution: { ...sceneResolution, resolvedMoments: sceneResolution.resolvedMoments.map(shiftMoment) },
    productPresence: { ...productPresence, curve: productPresence.curve.map(shiftMoment) },
    soundWorld: { ...soundWorld, moments: soundWorld.moments.map(shiftMoment) },
    cameraNarrative: { ...cameraNarrative, moments: cameraNarrative.moments.map(shiftMoment) },
  });
  assert(shiftedBuilt.alignmentIssues.length === 0, `Shifted canonical fixture reported alignment issues: ${shiftedBuilt.alignmentIssues.join(" | ")}`);
  assert(
    JSON.stringify(shiftedBuilt.input.moments.map((moment) => moment.momentIndex)) === JSON.stringify(shiftedIndexes),
    "Physical Action renumbered Moments locally instead of reading NarrativeMoment.index"
  );
  const shiftedReport = runPhysicalActionAudit(shiftedBuilt.input);
  assert(
    JSON.stringify(shiftedReport.moments.map((moment) => moment.momentIndex)) === JSON.stringify(shiftedIndexes),
    "Physical Action match records did not preserve the shifted canonical index"
  );

  // Case 3: re-ordered upstream arrays keep their canonical identity.
  const reorderedBuilt = buildPhysicalActionAuditInput({
    topicLabel: fixtureTopic.label,
    plan,
    sceneResolution: { ...sceneResolution, resolvedMoments: [...sceneResolution.resolvedMoments].reverse() },
    productPresence: { ...productPresence, curve: [...productPresence.curve].reverse() },
    soundWorld: { ...soundWorld, moments: [...soundWorld.moments].reverse() },
    cameraNarrative: { ...cameraNarrative, moments: [...cameraNarrative.moments].reverse() },
  });
  const reorderedReport = runPhysicalActionAudit(reorderedBuilt.input);
  const originalBuilt = buildPhysicalActionAuditInput({
    topicLabel: fixtureTopic.label,
    plan,
    sceneResolution,
    productPresence,
    soundWorld,
    cameraNarrative,
  });
  assert(
    JSON.stringify(reorderedBuilt.input) === JSON.stringify(originalBuilt.input),
    "Re-ordered upstream arrays changed the Physical Action Moment identity"
  );
  assert(
    JSON.stringify(reorderedReport.moments.map((moment) => [moment.momentIndex, moment.selectedActionId, moment.status]))
      === JSON.stringify(runPhysicalActionAudit(originalBuilt.input).moments.map((moment) => [moment.momentIndex, moment.selectedActionId, moment.status])),
    "Re-ordered upstream arrays changed Physical Action matching output"
  );

  // Case 1: a local record that renumbers 0 -> 1 must be rejected.
  const mismatchMessage = expectFailure(
    () => assertIndexAlignment([0, 1, 2, 3, 4], [1, 1, 2, 3, 4], "negative fixture"),
    "case 1"
  );
  assert(mismatchMessage.includes("diverges from upstream"), "case 1 failure message lost the upstream divergence detail");
  // Case 2: matching canonical sequences pass.
  assertIndexAlignment([0, 1, 2, 3, 4], [0, 1, 2, 3, 4], "case 2");

  // H: determinism.
  const secondRun = topics.map((entry) => {
    const rerun = runTopic(NARRATIVE_TOPIC_CATALOG.find((topic) => topic.id === entry.topicId));
    const report = runPhysicalActionAudit(rerun.built.input);
    return {
      topicId: entry.topicId,
      indexes: report.moments.map((moment) => moment.momentIndex),
      selections: report.moments.map((moment) => moment.selectedActionId),
    };
  });
  const firstRunSelections = topics.map((entry) => ({
    topicId: entry.topicId,
    indexes: entry.matchIndexes,
    selections: entry.selections,
  }));
  assert(
    JSON.stringify(secondRun) === JSON.stringify(firstRunSelections),
    "Physical Action index / identity output is not deterministic for identical input"
  );

  assert(canonicalMismatches === 0, `Physical Action canonical index mismatches: ${canonicalMismatches}`);

  const matched = topics.reduce((total, entry) => total + entry.matched, 0);
  const unresolved = topics.reduce((total, entry) => total + entry.unresolved, 0);

  // -------------------------------------------------------------------------
  // Candidate Selection Repair V1 + Stride Phase Alignment
  // -------------------------------------------------------------------------
  const combinedReport = runPhysicalActionAudit({ moments: combinedInputMoments });
  const eligibleRecordCount = matrix.filter((entry) =>
    entry.narrativeSuitability === "neutral_daily_action"
    && (entry.category === "general" || entry.category === "seated")
  ).length;

  assert(
    combinedReport.resultStage === (
      combinedReport.coverage.unresolvedMoments === 0
        ? "PHYSICAL_ACTION_APPROVED"
        : Object.values(combinedReport.finalTrustedPrerequisites).every(Boolean)
          ? "FINAL_TRUSTED_REMATCH"
          : "PROVISIONAL_MATCHING_RESULT"
    ),
    `resultStage ${combinedReport.resultStage} does not match the current coverage ${combinedReport.coverage.matchedMoments}/${combinedReport.coverage.totalMoments}`
  );
  for (const [name, satisfied] of Object.entries(combinedReport.finalTrustedPrerequisites)) {
    // topicActionChainsValid is derived from whether every Moment is resolved,
    // so it is asserted separately below instead of as an integrity gate.
    if (name === "topicActionChainsValid") continue;
    assert(satisfied, `final trusted prerequisite "${name}" is not satisfied`);
  }
  if (combinedReport.coverage.unresolvedMoments === 0) {
    assert(
      combinedReport.finalTrustedPrerequisites.topicActionChainsValid,
      "topic action chains must be valid once every Moment is resolved"
    );
  }

  for (const moment of combinedReport.moments) {
    const funnel = moment.candidateFunnel;
    const label = `${moment.topicLabel}/Moment ${moment.momentIndex}`;
    assert(funnel.totalActions === 318, `${label}: candidate retrieval must start from all 318 source records`);
    assert(funnel.afterEligibility === eligibleRecordCount, `${label}: eligibility layer lost source candidates`);
    assert(
      funnel.afterMovement <= funnel.afterEligibility
      && funnel.afterHandTask <= funnel.afterMovement
      && funnel.afterFootwork <= funnel.afterHandTask
      && funnel.afterWeight <= funnel.afterFootwork,
      `${label}: candidate funnel is not monotonic`
    );
    assert(funnel.finalCompatible === funnel.afterWeight, `${label}: final compatible count diverged from the weight layer`);
    assert(funnel.afterContinuity <= funnel.finalCompatible, `${label}: continuity layer added candidates`);
    if (moment.status === "MATCHED") {
      assert(
        funnel.finalCompatible >= 1 || moment.source === "NARRATIVE_PRIMITIVE",
        `${label}: matched Moment has no surviving compatible candidate`
      );
      assert(
        moment.compatibleCandidates.some((candidate) => candidate.actionId === moment.selectedActionId),
        `${label}: selected Action is missing from the reported candidate list`
      );
    }
  }

  const selectionReasonTotal = Object.values(combinedReport.selectionReasonDistribution).reduce((total, count) => total + count, 0);
  assert(
    selectionReasonTotal === combinedReport.coverage.matchedMoments,
    `selection reason distribution ${JSON.stringify(combinedReport.selectionReasonDistribution)} does not match ${combinedReport.coverage.matchedMoments} matched Moments`
  );
  assert(
    Object.keys(combinedReport.selectionReasonDistribution).every((reason) => [
      "EXACT_CAPABILITY_FIT",
      "EXACT_STRIDE_PHASE_ALIGNMENT",
      "GARMENT_EXACT",
      "NARRATIVE_PRIMITIVE_EXACT",
      "GENERIC_COMPATIBLE",
      "CONTINUITY_PREFERRED",
    ].includes(reason)),
    "selection reason distribution contains an unknown reason"
  );

  const strideStats = combinedReport.stridePhaseStats;
  assert(strideStats.sourceField === "PersonActionDefinition.movementPhase", `unexpected stride phase source field: ${strideStats.sourceField}`);
  assert(strideStats.normalizedField === "PhysicalActionCapability.movementState", `unexpected normalized stride phase field: ${strideStats.normalizedField}`);
  assert(strideStats.actionsWithDeclaredStridePhase === 318, `expected 318 actions with a declared stride phase, received ${strideStats.actionsWithDeclaredStridePhase}`);
  assert(strideStats.momentsRequiringExplicitStridePhase > 0, "no Moment produced an explicit stride phase requirement");
  assert(strideStats.momentsRequiringExplicitStridePhase <= combinedReport.coverage.totalMoments, "stride phase requirements exceed the Moment count");
  assert(
    strideStats.tiesResolvedByStridePhase <= strideStats.finalTiesBefore,
    "ties resolved by stride phase exceed the pre-alignment tie count"
  );

  // Fixtures: each one isolates a single real capability dimension.
  const fixtureAction = (overrides) => ({
    id: overrides.id,
    category: "general",
    directive: `Person action lock: fixture ${overrides.id}. Leg action lock: fixture leg line.`,
    poseType: overrides.poseType ?? "walking",
    diversityFamily: overrides.diversityFamily ?? "walking",
    macroActionGroup: overrides.macroActionGroup ?? "walkTransition",
    bodyOrientation: "front",
    footwork: overrides.footwork ?? "midStep",
    movementPhase: overrides.movementPhase ?? "moving",
    handTask: overrides.handTask ?? "emptyRelaxed",
    handPlacementZone: overrides.handPlacementZone ?? "bySide",
    framing: "fullFigure",
    supportLeg: "balanced",
    kneeState: "softEven",
    travelDirection: overrides.travelDirection ?? "forward",
    heelState: overrides.heelState ?? "bothGrounded",
    footSpacing: "natural",
    legActionSignature: `fixture-${overrides.id}`,
    legActionLine: "Leg action lock: fixture leg line.",
    visualLegPoseFamily: overrides.visualLegPoseFamily ?? "forward-step",
    visualLegPoseLine: "Visual leg-pose lock: fixture.",
    compatibleImageTypes: ["生活场景图"],
    handheldPolicy: "none",
    shoeVisibilityRisk: "low",
    anatomyRisk: "low",
    weight: 1,
  });
  const fixtureRequirement = (overrides = {}) => ({
    topicId: NARRATIVE_TOPIC_CATALOG[0].id,
    topicLabel: "fixture",
    momentIndex: overrides.momentIndex ?? 0,
    purpose: "approach_trigger",
    whatHappens: overrides.whatHappens ?? "fixture moment",
    sceneId: "fixture-scene",
    sceneName: "fixture scene",
    productPresence: "READABLE",
    cameraRole: "OBSERVER",
    actionIntent: "fixture intent",
    intentId: overrides.intentId ?? "slow+none",
    requiredBodyMode: [],
    requiredMovementState: overrides.requiredMovementState ?? ["walking_finish", "stopping_settle"],
    requiredHandTask: overrides.requiredHandTask ?? "none",
    requiredObject: overrides.requiredObject ?? "none",
    requiredHandCapabilities: overrides.requiredHandCapabilities ?? [
      { capability: "none", object: "none", evidence: "fixture" },
    ],
    requiredFootwork: {
      acceptsFootwork: overrides.acceptsFootwork ?? ["stepFinish", "midStep", "split"],
      requiresGroundContact: true,
      requiresPivot: false,
      allowsStationaryOffset: false,
    },
    requiredWeight: overrides.requiredWeight ?? ["settling", "transferring"],
    requiredStridePhase: overrides.requiredStridePhase ?? ["walking_finish", "stopping_settle"],
    startState: overrides.startState ?? "walking_ongoing",
    desiredEndState: overrides.desiredEndState ?? "stationary",
    forbiddenCapabilities: [],
    narrativeObjects: [],
  });

  // CASE A — the explicit landing stride phase wins over a compatible walking phase.
  const finishingRequirement = fixtureRequirement({
    intentId: "slow+none",
    requiredMovementState: ["walking_finish", "stopping_settle"],
    requiredStridePhase: ["walking_finish", "stopping_settle"],
    acceptsFootwork: ["stepFinish", "split"],
    requiredWeight: ["settling"],
    startState: "walking_finish",
    desiredEndState: "stationary",
  });
  const finishingMatrix = buildActionCapabilityMatrix([
    fixtureAction({
      id: "fixture-transition-settle",
      diversityFamily: "transition",
      macroActionGroup: "turnOrArrival",
      poseType: "walking",
      footwork: "split",
      movementPhase: "settling",
      heelState: "settling",
    }),
    fixtureAction({
      id: "fixture-walking-finish",
      footwork: "stepFinish",
      movementPhase: "settling",
      heelState: "leadContact",
    }),
  ]);
  const finishingMatch = matchMoment(finishingRequirement, finishingMatrix);
  assert(
    finishingMatch.selectedActionId === "fixture-walking-finish",
    `case A: expected the explicit finishing stride phase, received ${finishingMatch.selectedActionId}`
  );
  assert(finishingMatch.stridePhase.match === "EXACT", `case A: expected an EXACT stride phase, received ${finishingMatch.stridePhase.match}`);
  assert(finishingMatch.selectionReason === "EXACT_STRIDE_PHASE_ALIGNMENT", `case A: expected the stride alignment reason, received ${finishingMatch.selectionReason}`);
  const finishingRejected = finishingMatch.compatibleCandidates.find((candidate) => candidate.actionId === "fixture-walking-finish");
  assert(
    finishingRejected?.compatibilityVector.stridePhaseMatch === "EXACT",
    `case A: the selected finishing phase must be reported as EXACT, received ${finishingRejected?.compatibilityVector.stridePhaseMatch}`
  );
  const finishingCompatible = finishingMatch.compatibleCandidates.find((candidate) => candidate.actionId === "fixture-transition-settle");
  assert(
    finishingCompatible?.compatibilityVector.stridePhaseMatch === "COMPATIBLE",
    `case A: the compatible landing phase must be reported as COMPATIBLE, received ${finishingCompatible?.compatibilityVector.stridePhaseMatch}`
  );

  // CASE B — ongoing walking must not lose to a finishing stride.
  const ongoingRequirement = fixtureRequirement({
    intentId: "walking+none",
    requiredMovementState: ["walking_starting", "walking_ongoing", "walking_finish"],
    requiredStridePhase: ["walking_ongoing", "walking_finish", "walking_starting"],
    acceptsFootwork: ["stepStart", "midStep", "stepFinish"],
    requiredWeight: ["transferring", "settling"],
    startState: "walking_ongoing",
    desiredEndState: "walking_ongoing",
  });
  const ongoingMatrix = buildActionCapabilityMatrix([
    fixtureAction({ id: "fixture-walking-ongoing", footwork: "midStep", movementPhase: "moving" }),
    fixtureAction({ id: "fixture-walking-ending", footwork: "stepFinish", movementPhase: "settling" }),
  ]);
  const ongoingMatch = matchMoment(ongoingRequirement, ongoingMatrix);
  assert(
    ongoingMatch.selectedActionId === "fixture-walking-ongoing",
    `case B: ongoing walking must win, received ${ongoingMatch.selectedActionId}`
  );
  assert(
    !ongoingMatch.compatibleCandidates.some((candidate) => candidate.actionId === "fixture-walking-ending"),
    "case B: a finishing stride must not survive the ongoing-walking transition filter"
  );

  // CASE C — a Moment without a stated gait phase stays UNDECLARED, and no phase is invented.
  const standingRequirement = fixtureRequirement({
    intentId: "standing+none",
    requiredMovementState: ["stationary", "scene_task", "garment_task", "stopping_settle"],
    requiredStridePhase: [],
    acceptsFootwork: [],
    requiredWeight: ["unilateral_support", "bilateral_support", "settling"],
    startState: "stationary",
    desiredEndState: "stationary",
  });
  const standingMatrix = buildActionCapabilityMatrix([
    fixtureAction({
      id: "fixture-standing",
      diversityFamily: "standing",
      macroActionGroup: "standStill",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "still",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
  ]);
  const standingMatch = matchMoment(standingRequirement, standingMatrix);
  assert(standingMatch.stridePhase.required.length === 0, "case C: a stationary Moment must not gain a stride phase requirement");
  assert(standingMatch.stridePhase.match === "UNDECLARED", `case C: expected UNDECLARED, received ${standingMatch.stridePhase.match}`);
  assert(
    matrix.every((entry) => typeof entry.footwork.stridePhase === "string" && entry.footwork.stridePhase.length > 0),
    "case C: every canonical action must keep its declared movementPhase; no phase value may be invented"
  );

  // CASE D — a true capability tie stays a tie and resolves deterministically.
  const tieMatrix = buildActionCapabilityMatrix([
    fixtureAction({ id: "fixture-tie-a", footwork: "midStep", movementPhase: "moving" }),
    fixtureAction({ id: "fixture-tie-b", footwork: "midStep", movementPhase: "moving" }),
  ]);
  const tieFirst = matchMoment(ongoingRequirement, tieMatrix);
  const tieSecond = matchMoment(ongoingRequirement, tieMatrix);
  assert(tieFirst.tieBreak === true && tieFirst.tieBreakCandidateCount === 2, "case D: an equivalent-capability tie must be reported");
  assert(tieFirst.selectedActionId === "fixture-tie-a", `case D: stable source order must select the first equivalent record, received ${tieFirst.selectedActionId}`);
  assert(tieFirst.selectedActionId === tieSecond.selectedActionId, "case D: tie resolution must be deterministic");

  // CASE E — continuity follows the real gait phase chain.
  const chainMatrix = buildActionCapabilityMatrix([
    fixtureAction({ id: "fixture-chain-ongoing", footwork: "midStep", movementPhase: "moving" }),
    fixtureAction({ id: "fixture-chain-finish", footwork: "stepFinish", movementPhase: "settling", heelState: "leadContact" }),
    fixtureAction({
      id: "fixture-chain-standing",
      diversityFamily: "standing",
      macroActionGroup: "standStill",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "still",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
  ]);
  const stationaryRequirement = fixtureRequirement({
    momentIndex: 2,
    intentId: "standing+none",
    requiredMovementState: ["stationary", "stopping_settle"],
    requiredStridePhase: [],
    acceptsFootwork: ["parallel", "split", "stepFinish"],
    requiredWeight: ["bilateral_support", "unilateral_support", "settling"],
    startState: "stationary",
    desiredEndState: "stationary",
  });
  const chainRequirements = [
    fixtureRequirement({ momentIndex: 0, ...ongoingRequirement, topicId: NARRATIVE_TOPIC_CATALOG[0].id }),
    fixtureRequirement({
      momentIndex: 1,
      topicId: NARRATIVE_TOPIC_CATALOG[0].id,
      intentId: "slow+none",
      requiredMovementState: ["walking_finish", "stopping_settle"],
      requiredStridePhase: ["walking_finish", "stopping_settle"],
      acceptsFootwork: ["stepFinish", "midStep", "split"],
      requiredWeight: ["settling", "transferring"],
      startState: "walking_ongoing",
      desiredEndState: "walking_finish",
    }),
    stationaryRequirement,
  ];
  const chainMatches = matchRequirementMatrix(chainRequirements, chainMatrix);
  const chainContinuity = runContinuityPass(chainRequirements, chainMatrix, chainMatches);
  assert(
    chainContinuity.issues.length === 0,
    `case E: ongoing → finishing → stationary must stay continuous, received: ${chainContinuity.issues.map((issue) => issue.reason).join(" | ")}`
  );

  const brokenRequirements = [
    fixtureRequirement({
      momentIndex: 0,
      intentId: "standing+none",
      requiredMovementState: ["stationary", "stopping_settle"],
      requiredStridePhase: [],
      acceptsFootwork: ["parallel", "split", "stepFinish"],
      requiredWeight: ["bilateral_support", "unilateral_support", "settling"],
      startState: "stationary",
      desiredEndState: "stationary",
    }),
    fixtureRequirement({
      momentIndex: 1,
      intentId: "walking+none",
      requiredMovementState: ["walking_starting", "walking_ongoing", "walking_finish"],
      requiredStridePhase: ["walking_ongoing", "walking_finish", "walking_starting"],
      acceptsFootwork: ["stepStart", "midStep", "stepFinish"],
      requiredWeight: ["transferring", "settling"],
      startState: "walking_ongoing",
      desiredEndState: "walking_ongoing",
    }),
  ];
  const brokenMatches = matchRequirementMatrix(brokenRequirements, chainMatrix);
  const brokenContinuity = runContinuityPass(brokenRequirements, chainMatrix, brokenMatches);
  assert(
    brokenContinuity.issues.length > 0,
    "case E: a stationary → mid-stride chain without a walking-start transition must be flagged"
  );

  // -------------------------------------------------------------------------
  // Garment Validator Hardening V1
  // -------------------------------------------------------------------------
  const sourceSnapshotBefore = JSON.stringify(personActionLibrary);
  const GARMENT_TASKS = ["sleeve", "lapel", "hem", "pocketEdge"];
  const garmentCapable = matrix.filter((entry) => entry.garment.declared);
  const nonGarment = matrix.filter((entry) => !entry.garment.declared);

  assert(garmentCapable.length === 82, `Garment-capable Actions changed: expected 82, received ${garmentCapable.length}`);
  assert(nonGarment.length === 236, `Non-garment Actions changed: expected 236, received ${nonGarment.length}`);
  assert(garmentCapable.length + nonGarment.length === 318, "the garment partition does not add up to the 318 source Actions");
  assert(
    JSON.stringify([...new Set(garmentCapable.map((entry) => entry.garment.rawValue))].sort())
      === JSON.stringify([...GARMENT_TASKS].sort()),
    "the garment-related canonical handTask values changed"
  );

  // Evidence trace: every garment flag must come from the real handTask field.
  for (const entry of matrix) {
    const source = personActionLibrary.find((action) => action.id === entry.actionId);
    assert(source, `Capability Matrix record ${entry.actionId} has no source Action`);
    assert(entry.garment.sourceField === "handTask", `${entry.actionId} garment evidence is not sourced from handTask`);
    assert(entry.garment.rawValue === source.handTask, `${entry.actionId} garment raw value diverges from the source handTask`);
    assert(
      entry.garment.declared === GARMENT_TASKS.includes(source.handTask),
      `${entry.actionId} garment flag is not derived from the canonical handTask value`
    );
    assert(entry.garment.placementZone === source.handPlacementZone, `${entry.actionId} garment placement zone diverges from the source`);
  }

  const garmentRequirementEntries = combinedReport.moments.flatMap((moment) => moment.garment.required
    .filter((entry) => entry.capability === "garment_adjustment" || entry.capability === "pocket_contact")
    .map((entry) => ({ moment, entry })));
  const garmentMomentKeys = [...new Set(garmentRequirementEntries.map(({ moment }) => `${moment.topicId}:${moment.momentIndex}`))].sort();
  assert(garmentMomentKeys.length === 2, `expected 2 garment-requiring Moments, received ${garmentMomentKeys.length}`);
  assert(
    JSON.stringify(garmentMomentKeys) === JSON.stringify(["after_lunch:3", "errand_outing:3"]),
    `the garment-requiring Moments changed: ${garmentMomentKeys.join(", ")}`
  );
  for (const { moment, entry } of garmentRequirementEntries) {
    assert(
      moment.whatHappens.includes(entry.evidence),
      `garment evidence "${entry.evidence}" is not present in ${moment.topicId}:${moment.momentIndex}`
    );
  }

  const combinationMoments = combinedReport.moments.filter(
    (moment) => moment.garment.required.filter((entry) => entry.capability !== "none").length > 1
  );
  const combinationKeys = [...new Set(combinationMoments.map((moment) => `${moment.topicId}:${moment.momentIndex}`))].sort();
  assert(combinationKeys.length === 3, `expected 3 combination requirements, received ${combinationKeys.length}`);
  assert(
    JSON.stringify(combinationKeys) === JSON.stringify([
      "after_work_home:3",
      "errand_outing:3",
      "evening_return_home:2",
    ]),
    `the combination requirement set changed: ${combinationKeys.join(", ")}`
  );
  for (const moment of combinationMoments) {
    if (moment.status === "MATCHED") {
      assert(
        moment.source === "NARRATIVE_PRIMITIVE",
        `${moment.topicId}:${moment.momentIndex} combination requirement must be covered by one Narrative primitive, received ${moment.source}`
      );
    }
  }
  const garmentRequiringMoments = combinedReport.moments.filter((entry) => entry.garment.required.some(
    (requirement) => requirement.capability === "garment_adjustment" || requirement.capability === "pocket_contact"
  ));
  for (const moment of garmentRequiringMoments) {
    if (moment.status !== "MATCHED") continue;
    assert(moment.garment.match === "EXACT", `${moment.topicId}:${moment.momentIndex} matched garment Moment is not an exact garment fit`);
    const selected = moment.compatibleCandidates.find((candidate) => candidate.actionId === moment.selectedActionId);
    assert(selected?.compatibilityVector.garmentMatch === "EXACT", `${moment.topicId}:${moment.momentIndex} selected garment vector is not EXACT`);
  }

  let syntheticCandidates = 0;
  for (const moment of combinedReport.moments) {
    const candidateIds = [
      ...moment.compatibleCandidates.map((candidate) => candidate.actionId),
      ...moment.rejectedCandidates.map((candidate) => candidate.actionId),
    ];
    for (const actionId of candidateIds) {
      if (!knownActionIds.has(actionId)) syntheticCandidates += 1;
      if (/[+&|]/.test(actionId)) syntheticCandidates += 1;
    }
  }
  assert(syntheticCandidates === 0, `garment matching produced ${syntheticCandidates} synthetic or compound candidate ids`);

  // Fixture 1 — garment-exact-match
  const garmentRequirement = fixtureRequirement({
    intentId: "garment+none",
    requiredMovementState: ["garment_task", "stationary"],
    requiredStridePhase: [],
    acceptsFootwork: ["parallel", "split"],
    requiredWeight: ["unilateral_support", "bilateral_support", "settling"],
    requiredHandTask: "garment_adjustment",
    requiredObject: "garment",
    requiredHandCapabilities: [{ capability: "garment_adjustment", object: "garment", evidence: "adjusts her sleeve" }],
    startState: "stationary",
    desiredEndState: "stationary",
  });
  const garmentMatrix = buildActionCapabilityMatrix([
    fixtureAction({
      id: "fixture-garment-sleeve",
      diversityFamily: "garment-task",
      macroActionGroup: "clothingTask",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "task",
      handTask: "sleeve",
      handPlacementZone: "cuff",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
    fixtureAction({
      id: "fixture-empty-hands",
      diversityFamily: "standing",
      macroActionGroup: "standStill",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "still",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
  ]);
  const garmentExactMatch = matchMoment(garmentRequirement, garmentMatrix);
  assert(
    garmentExactMatch.status === "MATCHED" && garmentExactMatch.selectedActionId === "fixture-garment-sleeve",
    `fixture 1: the garment-capable candidate must be selected, received ${garmentExactMatch.selectedActionId}`
  );
  assert(garmentExactMatch.garment.match === "EXACT", `fixture 1: expected an EXACT garment match, received ${garmentExactMatch.garment.match}`);
  const undeclaredGarmentCandidate = garmentExactMatch.compatibleCandidates.find((candidate) => candidate.actionId === "fixture-empty-hands");
  assert(
    undeclaredGarmentCandidate?.compatibilityVector.garmentMatch === "UNDECLARED",
    `fixture 1: empty hands must stay UNDECLARED for a garment requirement, received ${undeclaredGarmentCandidate?.compatibilityVector.garmentMatch}`
  );

  // Fixture 2 — garment-missing-capability
  const missingGarmentMatrix = buildActionCapabilityMatrix([
    fixtureAction({
      id: "fixture-unrelated-hand-task",
      diversityFamily: "garment-task",
      macroActionGroup: "clothingTask",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "task",
      handTask: "phone",
      handPlacementZone: "phone",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
  ]);
  const missingGarmentMatch = matchMoment(garmentRequirement, missingGarmentMatrix);
  const unrelatedCandidate = missingGarmentMatch.compatibleCandidates.find((candidate) => candidate.actionId === "fixture-unrelated-hand-task");
  assert(missingGarmentMatch.status === "UNRESOLVED", "fixture 2: an unrelated hand task must not satisfy a garment requirement");
  assert(
    unrelatedCandidate?.compatibilityVector.garmentMatch === "INCOMPATIBLE",
    `fixture 2: expected an INCOMPATIBLE garment match, received ${unrelatedCandidate?.compatibilityVector.garmentMatch}`
  );

  // Fixture 3 — garment-combination-partial
  const combinationRequirement = fixtureRequirement({
    intentId: "garment+combination",
    requiredMovementState: ["garment_task", "stationary"],
    requiredStridePhase: [],
    acceptsFootwork: ["parallel", "split"],
    requiredWeight: ["unilateral_support", "bilateral_support", "settling"],
    requiredHandTask: "garment_adjustment",
    requiredObject: "garment",
    requiredHandCapabilities: [
      { capability: "garment_adjustment", object: "garment", evidence: "adjusts her sleeve" },
      { capability: "carried_object_hold", object: "bag", evidence: "with one bag in hand" },
    ],
    startState: "stationary",
    desiredEndState: "stationary",
  });
  const combinationMatrix = buildActionCapabilityMatrix([
    fixtureAction({
      id: "fixture-garment-only",
      diversityFamily: "garment-task",
      macroActionGroup: "clothingTask",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "task",
      handTask: "sleeve",
      handPlacementZone: "cuff",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
    fixtureAction({
      id: "fixture-other-task-only",
      diversityFamily: "standing",
      macroActionGroup: "standStill",
      poseType: "standing",
      footwork: "parallel",
      movementPhase: "still",
      handTask: "environmentCue",
      handPlacementZone: "environment",
      travelDirection: "stationary",
      visualLegPoseFamily: "grounded-parallel",
    }),
  ]);
  const combinationMatch = matchMoment(combinationRequirement, combinationMatrix);
  assert(
    combinationMatch.status === "UNRESOLVED",
    "fixture 3: a combined hand requirement cannot be satisfied by a single canonical handTask"
  );
  assert(
    combinationMatch.compatibleCandidates.every((candidate) => candidate.compatibilityVector.handTaskMatch === "INCOMPATIBLE"),
    "fixture 3: every single-task candidate must report an incompatible hand task"
  );

  // Fixture 4 — garment-no-auto-composition
  const combinationCandidateIds = combinationMatch.compatibleCandidates.map((candidate) => candidate.actionId);
  assert(
    combinationCandidateIds.every((actionId) => ["fixture-garment-only", "fixture-other-task-only"].includes(actionId)),
    `fixture 4: a synthetic compound candidate was produced: ${combinationCandidateIds.join(", ")}`
  );
  assert(
    !combinationMatch.compatibleCandidates.some((candidate) => /[+&|]/.test(candidate.actionId)),
    "fixture 4: compound candidate ids are forbidden"
  );

  // Fixture 5 — garment-passive-clothing
  const passiveClothingRequirement = buildMomentRequirementMatrix({
    moments: [{
      topicId: NARRATIVE_TOPIC_CATALOG[0].id,
      topicLabel: "fixture",
      momentIndex: 0,
      purpose: "establish_state",
      whatHappens: "She walks along the street at a steady pace in a long coat and continues toward home.",
      sceneId: "fixture-scene",
      sceneName: "fixture scene",
      productPresence: "INCIDENTAL",
      cameraRole: "OBSERVER",
    }],
  })[0];
  assert(
    !passiveClothingRequirement.requiredHandCapabilities.some(
      (entry) => entry.capability === "garment_adjustment" || entry.capability === "pocket_contact"
    ),
    "fixture 5: passively worn clothing must not create a garment requirement"
  );
  assert(
    passiveClothingRequirement.requiredHandTask === "none",
    `fixture 5: expected no hand task, received ${passiveClothingRequirement.requiredHandTask}`
  );

  assert(
    sourceSnapshotBefore === JSON.stringify(personActionLibrary),
    "garment validation mutated the Existing Action source data"
  );

  // -------------------------------------------------------------------------
  // Final Trusted Rematch invariants
  // -------------------------------------------------------------------------
  assert(combinedReport.coverage.totalMoments === 65, `expected 65 Moments, received ${combinedReport.coverage.totalMoments}`);
  for (const moment of combinedReport.moments) {
    assert(
      moment.finalStatus === moment.status,
      `${moment.topicId}:${moment.momentIndex} finalStatus diverges from the match status`
    );
    if (moment.status === "MATCHED") {
      assert(
        knownActionIds.has(moment.selectedActionId),
        `matched Moment ${moment.topicId}:${moment.momentIndex} references an Action outside the 318 source records`
      );
      assert(
        moment.gapId === null && moment.gapClass === null,
        `matched Moment ${moment.topicId}:${moment.momentIndex} carries a capability gap reference`
      );
    } else {
      assert(
        typeof moment.unresolvedReason === "string" && moment.unresolvedReason.length > 0,
        `unresolved Moment ${moment.topicId}:${moment.momentIndex} has no explicit reason`
      );
      assert(
        typeof moment.gapId === "string" && moment.gapId.length > 0,
        `unresolved Moment ${moment.topicId}:${moment.momentIndex} has no gap cluster`
      );
      assert(
        typeof moment.gapClass === "string" && moment.gapClass.length > 0,
        `unresolved Moment ${moment.topicId}:${moment.momentIndex} has no gap classification`
      );
    }
  }

  const unresolvedGapCoverage = new Set();
  for (const gap of combinedReport.gaps) {
    assert(gap.affectedMoments.length > 0, `gap ${gap.gapId} has no affected Moment`);
    assert(gap.singleExistingActionCanSatisfy === false, `gap ${gap.gapId} claims a single existing Action can satisfy it`);
    assert(
      gap.gapClass !== "REQUIREMENT_MODELING_BUG" && gap.gapClass !== "MATCHING_IMPLEMENTATION_BUG",
      `gap ${gap.gapId} is classified as ${gap.gapClass} and must be fixed before the primitive decision`
    );
    for (const affected of gap.affectedMoments) {
      const moment = combinedReport.moments.find(
        (entry) => entry.topicId === affected.topicId && entry.momentIndex === affected.momentIndex
      );
      assert(moment, `gap ${gap.gapId} references a Moment outside the rematch`);
      assert(
        moment.status === "UNRESOLVED" && moment.gapId === gap.gapId,
        `gap ${gap.gapId} does not match the Moment record ${affected.topicId}:${affected.momentIndex}`
      );
      unresolvedGapCoverage.add(`${affected.topicId}:${affected.momentIndex}`);
    }
  }
  assert(
    unresolvedGapCoverage.size === combinedReport.coverage.unresolvedMoments,
    `gap clusters cover ${unresolvedGapCoverage.size} of ${combinedReport.coverage.unresolvedMoments} unresolved Moments`
  );

  const continuityAudit = combinedReport.continuityAudit;
  assert(
    continuityAudit.issuesAfter + continuityAudit.repairedByAlternateAction === continuityAudit.issuesBefore,
    `continuity audit counts are inconsistent: ${JSON.stringify(continuityAudit)}`
  );
  assert(combinedReport.gapReview.totalGapClusters === combinedReport.gaps.length, "gap review cluster count diverges from the gap list");
  assert(
    combinedReport.gapReview.minimumNewPrimitives === combinedReport.gaps.filter((gap) => gap.requiresNewPrimitive).length,
    "minimum primitive estimate diverges from the gap list"
  );
  assert(combinedReport.coverage.addedPrimitiveCount === 0, "no primitive may be added during the rematch round");

  // -------------------------------------------------------------------------
  // Primitive Evidence Guard fixtures (real evaluator, real registry)
  // -------------------------------------------------------------------------
  const primitiveById = new Map(NARRATIVE_PRIMITIVE_REGISTRY.map((primitive) => [primitive.actionId, primitive]));
  const evidence = (overrides, primitiveId) => evaluatePrimitiveEvidenceEligibility(
    fixtureRequirement(overrides),
    primitiveById.get(primitiveId)
  );
  const guardFixtures = {};
  const bagAdjust = { capability: "carried_object_adjust", object: "bag", evidence: "settles the bag" };
  const garmentAdjust = { capability: "garment_adjustment", object: "garment", evidence: "adjusts her sleeve" };

  const extraGarment = evidence(
    { whatHappens: "She settles the bag against her grip and keeps walking.", requiredHandCapabilities: [bagAdjust] },
    "narrative-carried-object-garment-settle"
  );
  guardFixtures["extra-garment-rejected"] = !extraGarment.eligible
    && extraGarment.unsupportedExtraCapabilities.includes("GARMENT_ADJUSTMENT");

  const extraKey = evidence(
    {
      whatHappens: "She finds the card and closes the pocket.",
      requiredHandCapabilities: [{ capability: "object_retrieval", object: "card", evidence: "finds the card" }],
    },
    "narrative-key-door-unlock"
  );
  guardFixtures["extra-key-rejected"] = !extraKey.eligible
    && extraKey.unsupportedExtraCapabilities.includes("DOOR_CONTACT");

  const fullyEvidenced = evidence(
    {
      whatHappens: "She adjusts her sleeve once, settles the bag, and continues walking.",
      requiredMovementState: ["walking_starting", "walking_ongoing", "walking_finish"],
      requiredStridePhase: ["walking_ongoing", "walking_finish", "walking_starting"],
      acceptsFootwork: ["stepStart", "midStep", "stepFinish"],
      requiredWeight: ["transferring", "settling"],
      startState: "walking_ongoing",
      desiredEndState: "walking_ongoing",
      requiredHandCapabilities: [bagAdjust, garmentAdjust],
    },
    "narrative-carried-object-garment-settle"
  );
  guardFixtures["fully-evidenced"] = fullyEvidenced.eligible
    && fullyEvidenced.unsupportedExtraCapabilities.length === 0;

  const sameObjectPositive = evidence(
    { whatHappens: "She settles the bag against her grip.", requiredHandCapabilities: [bagAdjust] },
    "narrative-carried-object-secure"
  );
  guardFixtures["same-object-positive"] = sameObjectPositive.eligible
    && sameObjectPositive.sameObjectExceptions.length === 1
    && sameObjectPositive.sameObjectExceptions[0].objectClass === "carried_object";

  const sameObjectCrossObject = evidence(
    { whatHappens: "She adjusts her outer layer once.", requiredHandCapabilities: [garmentAdjust] },
    "narrative-carried-object-garment-settle"
  );
  guardFixtures["same-object-cross-object-negative"] = !sameObjectCrossObject.eligible
    && sameObjectCrossObject.unsupportedExtraCapabilities.includes("CARRIED_OBJECT_ADJUST");

  const keyOnly = evidence(
    {
      whatHappens: "She begins reaching for the key.",
      requiredHandCapabilities: [{ capability: "object_retrieval", object: "key", evidence: "reaching for the key" }],
    },
    "narrative-key-door-unlock"
  );
  const doorOnly = evidence(
    {
      whatHappens: "She opens the door and steps through.",
      requiredHandCapabilities: [{ capability: "door_contact", object: "door", evidence: "opens the door" }],
    },
    "narrative-key-door-unlock"
  );
  guardFixtures["key-door-negative"] = !keyOnly.eligible && !doorOnly.eligible;

  const physicalFields = evidence(
    { whatHappens: "She settles the bag against her grip.", requiredHandCapabilities: [bagAdjust] },
    "narrative-carried-object-secure"
  );
  const semanticNames = physicalFields.capabilityVerdicts.map((verdict) => verdict.capability);
  guardFixtures["physical-fields-not-semantic"] = semanticNames.every(
    (name) => !["movementPhase", "footwork", "movementState", "startState", "endState"].includes(name)
  ) && physicalFields.unsupportedExtraCapabilities.length === 0;

  const missingRequired = evidence(
    {
      whatHappens: "She walks with one bag in hand.",
      requiredHandCapabilities: [{ capability: "carried_object_hold", object: "bag", evidence: "with one bag in hand" }],
    },
    "narrative-carried-object-secure"
  );
  guardFixtures["required-capability-missing"] = !missingRequired.eligible
    && missingRequired.requiredCapabilityMissing.includes("CARRIED_OBJECT_HOLD");

  const movementAPositive = evidence(
    {
      whatHappens: "One hand begins searching inside the bag for the key while she keeps walking.",
      requiredMovementState: ["walking_starting", "walking_ongoing", "walking_finish"],
      requiredStridePhase: ["walking_ongoing", "walking_finish", "walking_starting"],
      acceptsFootwork: ["stepStart", "midStep", "stepFinish"],
      requiredWeight: ["transferring", "settling"],
      startState: "walking_ongoing",
      desiredEndState: "walking_ongoing",
      requiredHandCapabilities: [{ capability: "object_search", object: "bag", evidence: "searching inside the bag" }],
    },
    "narrative-container-object-retrieval"
  );
  const movementANegative = evidence(
    {
      whatHappens: "She searches inside the bag for the key.",
      // Start-of-walk requirement: the retrieval primitive cannot end a step
      // that has only just begun, so the transition check must reject it.
      requiredMovementState: ["walking_starting"],
      requiredStridePhase: ["walking_starting"],
      acceptsFootwork: ["stepStart", "midStep", "stepFinish"],
      requiredWeight: ["transferring", "settling"],
      startState: "stationary",
      desiredEndState: "walking_starting",
      requiredHandCapabilities: [{ capability: "object_search", object: "bag", evidence: "searching inside the bag" }],
    },
    "narrative-container-object-retrieval"
  );
  guardFixtures["movement-A-positive"] = movementAPositive.eligible;
  guardFixtures["movement-A-negative"] = !movementANegative.eligible;

  const movementBPositive = evidence(
    {
      whatHappens: "She settles the new grip, checks the bag once, and reaches for the door.",
      requiredMovementState: ["walking_starting", "walking_ongoing", "walking_finish"],
      requiredStridePhase: ["walking_ongoing", "walking_finish", "walking_starting"],
      acceptsFootwork: ["stepStart", "midStep", "stepFinish"],
      requiredWeight: ["transferring", "settling"],
      startState: "walking_ongoing",
      desiredEndState: "walking_ongoing",
      requiredHandCapabilities: [
        { capability: "carried_object_adjust", object: "bag", evidence: "settles the new grip" },
        { capability: "carried_object_check", object: "bag", evidence: "checks the bag once" },
        { capability: "door_contact", object: "door", evidence: "reaches for the door" },
      ],
    },
    "narrative-carried-object-door-approach"
  );
  const movementBNegative = evidence(
    {
      whatHappens: "She settles the bag and checks it once.",
      requiredMovementState: ["stationary"],
      requiredStridePhase: [],
      acceptsFootwork: [],
      requiredWeight: ["unilateral_support", "bilateral_support", "settling"],
      startState: "stationary",
      desiredEndState: "stationary",
      requiredHandCapabilities: [bagAdjust],
    },
    "narrative-carried-object-door-approach"
  );
  guardFixtures["movement-B-positive"] = movementBPositive.eligible;
  guardFixtures["movement-B-negative"] = !movementBNegative.eligible;

  for (const [name, passed] of Object.entries(guardFixtures)) {
    assert(passed, `evidence guard fixture ${name} failed`);
  }

  // Production regressions: the three former misassignments and the four
  // guard-created unresolved Moments.
  const momentByKey = new Map(combinedReport.moments.map((moment) => [`${moment.topicId}:${moment.momentIndex}`, moment]));
  const misassignmentChecks = [
    ["returning_with_purchases:1", "narrative-carried-object-garment-settle"],
    ["evening_return_home:3", "narrative-key-door-unlock"],
    ["after_lunch:3", "narrative-carried-object-garment-settle"],
  ];
  for (const [key, wrongPrimitiveId] of misassignmentChecks) {
    const moment = momentByKey.get(key);
    assert(moment, `misassignment regression Moment ${key} is missing`);
    assert(moment.primitiveId !== wrongPrimitiveId, `${key} still selects the misassigned primitive ${wrongPrimitiveId}`);
  }
  assert(
    momentByKey.get("after_lunch:3").primitiveId === "narrative-garment-adjust-transition",
    "after_lunch:3 must select the garment-adjust-transition primitive"
  );

  const guardUnresolvedKeys = [
    "after_work_home:2",
    "evening_return_home:1",
    "evening_return_home:3",
  ];
  let guardUnresolvedPassing = 0;
  for (const key of guardUnresolvedKeys) {
    const moment = momentByKey.get(key);
    assert(moment && moment.status === "UNRESOLVED", `${key} must stay unresolved under the evidence guard`);
    assert(
      moment.rejectedPrimitiveTraces.length > 0 && moment.rejectedPrimitiveTraces[0].eligibility.eligible === false,
      `${key} must expose a rejected primitive trace`
    );
    guardUnresolvedPassing += 1;
  }

  let selectedPrimitiveChecks = 0;
  let selectedSameObjectExceptions = 0;
  let uncheckedSelected = 0;
  let invalidSameObjectExceptions = 0;
  for (const moment of combinedReport.moments.filter((entry) => entry.source === "NARRATIVE_PRIMITIVE")) {
    const eligibility = moment.primitiveEligibility;
    assert(eligibility && eligibility.eligible, `${moment.topicId}:${moment.momentIndex} selected primitive has no eligible trace`);
    const declared = primitiveById.get(moment.primitiveId)?.narrativePrimitive?.capabilities ?? [];
    assert(
      eligibility.capabilityVerdicts.length === declared.length,
      `${moment.topicId}:${moment.momentIndex} did not check every declared capability`
    );
    if (eligibility.capabilityVerdicts.some((verdict) => verdict.verdict === "REJECTED_UNSUPPORTED_EXTRA")) uncheckedSelected += 1;
    selectedPrimitiveChecks += eligibility.capabilityVerdicts.length;
    selectedSameObjectExceptions += eligibility.sameObjectExceptions.length;
  }
  assert(uncheckedSelected === 0, `${uncheckedSelected} selected primitives carry an unsupported capability`);

  // Same-object exceptions are valid only when the object class really is the
  // carried object the Moment already states. A cross-object exception (a key,
  // door, card, or garment borrowing a carried-object exception) is invalid.
  const carriedObjectEvidence = /\bbag\b|\bsmall item\b|\bthe object\b|\bitem\b/i;
  for (const moment of combinedReport.moments) {
    const traces = [
      moment.primitiveEligibility,
      ...moment.rejectedPrimitiveTraces.map((trace) => trace.eligibility),
    ].filter(Boolean);
    for (const trace of traces) {
      for (const exception of trace.sameObjectExceptions) {
        const objectClassOk = exception.objectClass === "carried_object";
        const momentConfirmsObject = carriedObjectEvidence.test(moment.whatHappens);
        const capabilityIsCarriedMode = [
          "CARRIED_OBJECT_HOLD",
          "CARRIED_OBJECT_ADJUST",
          "CARRIED_OBJECT_CHECK",
        ].includes(exception.capability);
        if (!objectClassOk || !momentConfirmsObject || !capabilityIsCarriedMode) invalidSameObjectExceptions += 1;
      }
    }
  }
  assert(
    invalidSameObjectExceptions === 0,
    `${invalidSameObjectExceptions} same-object exception(s) were applied outside the carried-object class`
  );

  console.log("PHYSICAL ACTION AUDIT VALIDATION PASS:", JSON.stringify({
    stage: "FINAL_TRUSTED_REMATCH_AND_REAL_CAPABILITY_GAP_REVIEW",
    canonicalField: "NarrativeMoment.index",
    canonicalSequencePerTopic: CANONICAL_SEQUENCE,
    topics: topics.length,
    moments: totalMoments,
    canonicalMismatches,
    existingActions: personActionLibrary.length,
    capabilityMatrixRecords: matrix.length,
    addedPrimitiveCount: 0,
    candidateRepair: {
      eligibleRecordCount,
      resultStage: combinedReport.resultStage,
      selectionReasonDistribution: combinedReport.selectionReasonDistribution,
      tieBreakSelectionCount: combinedReport.tieBreakSelectionCount,
      uniqueSelectedActions: combinedReport.coverage.uniqueExistingActionsReused,
      stridePhaseStats: combinedReport.stridePhaseStats,
      topReusedActions: combinedReport.topReusedActions,
      fixtures: {
        exactStridePhaseWins: finishingMatch.selectedActionId,
        ongoingBeatsFinishingStride: ongoingMatch.selectedActionId,
        undeclaredStridePhase: standingMatch.stridePhase.match,
        trueTieSelected: tieFirst.selectedActionId,
        continuousChainIssues: chainContinuity.issues.length,
        brokenChainIssues: brokenContinuity.issues.length,
      },
    },
    garmentValidation: {
      existingActions: personActionLibrary.length,
      garmentCapable: garmentCapable.length,
      nonGarment: nonGarment.length,
      garmentValues: GARMENT_TASKS,
      garmentMoments: garmentMomentKeys.length,
      combinationRequirements: combinationKeys.length,
      fixtures: {
        "garment-exact-match": "PASS",
        "garment-missing-capability": "PASS",
        "garment-combination-partial": "PASS",
        "garment-no-auto-composition": "PASS",
        "garment-passive-clothing": "PASS",
      },
      automaticComposition: "DISABLED",
      syntheticCandidates,
      sourceMutation: 0,
    },
    finalTrustedRematch: {
      resultStage: combinedReport.resultStage,
      prerequisites: combinedReport.finalTrustedPrerequisites,
      coverage: combinedReport.coverage,
      selectionReasonDistribution: combinedReport.selectionReasonDistribution,
      continuityAudit: combinedReport.continuityAudit,
      gapReview: combinedReport.gapReview,
      gapClusters: combinedReport.gaps.map((gap) => ({
        gapId: gap.gapId,
        gapClass: gap.gapClass,
        affectedMoments: gap.affectedMoments.length,
        requiresNewPrimitive: gap.requiresNewPrimitive,
      })),
    },
    evidenceGuard: {
      fixtures: guardFixtures,
      fixtureCount: Object.keys(guardFixtures).length,
      fixturesPassed: Object.values(guardFixtures).filter(Boolean).length,
      misassignmentsFixed: `${misassignmentChecks.length} / ${misassignmentChecks.length}`,
      guardCreatedUnresolved: `${guardUnresolvedPassing} / ${guardUnresolvedKeys.length}`,
      selectedPrimitiveCapabilityChecks: selectedPrimitiveChecks,
      selectedSameObjectExceptions,
      unsupportedExtraSelected: uncheckedSelected,
      invalidSameObjectExceptions,
    },
    auditCoverage: {
      matched,
      unresolved,
      resultStage: combinedReport.resultStage,
      note: "Final trusted rematch executed; the remaining unresolved Moments are clustered real capability gaps.",
    },
    perTopic: topics,
  }, null, 2));
} finally {
  await rm(tempDirectory, { recursive: true, force: true });
}
