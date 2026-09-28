import type { CameraNarrativeRole } from "../camera-role";
import type { ProductPresenceLevel } from "../product-presence";
import {
  AURA_CAMERA_EXECUTION_LOOK_LINE,
  AURA_CAMERA_EXECUTION_NEGATIVE_LINE,
  AURA_CAMERA_EXECUTION_RESTRICTIONS,
  AURA_CAMERA_EXECUTION_ROLE_RULES,
  IMMERSIVE_CAMERA_NATURALISM_RULES,
  resolveAuraTopicLensProfile,
} from "./aura-camera-rules";
import { buildCameraExecutionQc } from "./qc";
import {
  CAMERA_EXECUTION_SCHEMA_VERSION,
  CAMERA_EXECUTION_VERSION,
  type CameraExecutionCoverage,
  type CameraExecutionInput,
  type CameraExecutionMoment,
  type CameraExecutionMomentInput,
  type CameraExecutionPlan,
  type CameraExecutionPipelineInputs,
  type CameraExecutionStatus,
  type CameraViewAngle,
} from "./types";

// One 15-second sequence is allocated once, deterministically, and the same
// allocation is used by the Camera plan and the final Seedance script. Moment
// windows are narrative allocations, not performance windows: a real stop or
// observation gets the time its behavior actually needs instead of an equal
// slice or a long presentation hold.
type TimingClass =
  | "TRANSIT"
  | "TRANSITION"
  | "MICRO_EVENT"
  | "TRUE_STOP"
  | "OBSERVATION"
  | "WAITING"
  | "CLOSURE";

const TIMING_CLASS_WEIGHTS: Record<TimingClass, number> = {
  TRANSIT: 1.35,
  TRANSITION: 1.05,
  MICRO_EVENT: 1.0,
  TRUE_STOP: 0.5,
  OBSERVATION: 0.65,
  WAITING: 1.5,
  CLOSURE: 1.2,
};

const CAMERA_SIDE = "established A-side";

const STOP_TIMING_PATTERN = /\bstops?\b|\bpauses?\b|\bremains?\b|\bwaits?\b|\bsearches?\b|\blooks? (?:into|at|through)\b|\bsettles? (?:it|securely|back)\b/i;
const MOVING_TIMING_PATTERN = /\bwalks?\b|\bcontinues?\b|\bresumes?\b|\bapproaches?\b|\bheads?\b|\bmoves?\b|\benters?\b|\bsteps?\b|\bcrosses?\b|\bturns?\b/i;
const STATIONARY_TIMING_CLASSES = new Set<TimingClass>(["TRUE_STOP", "OBSERVATION", "WAITING"]);

function timingClassOf(moment: CameraExecutionMomentInput, topicId: string): TimingClass {
  const text = moment.whatHappens;
  if (topicId === "waiting_for_friend" && ["micro_event", "response", "after_state"].includes(moment.purpose)) {
    return "WAITING";
  }
  if (moment.purpose === "establish_state") return MOVING_TIMING_PATTERN.test(text) ? "TRANSIT" : "TRANSITION";
  if (moment.purpose === "approach_trigger") return "TRANSITION";
  if (moment.purpose === "micro_event") {
    if (/\bwaits?\b|\bwaiting\b/i.test(text)) return "WAITING";
    if (STOP_TIMING_PATTERN.test(text)) return "TRUE_STOP";
    return MOVING_TIMING_PATTERN.test(text) ? "TRANSIT" : "MICRO_EVENT";
  }
  if (moment.purpose === "response") {
    if (/\bwaits?\b|\bwaiting\b/i.test(text)) return "WAITING";
    if (STOP_TIMING_PATTERN.test(text)) return "OBSERVATION";
    return MOVING_TIMING_PATTERN.test(text) ? "TRANSIT" : "TRANSITION";
  }
  if (moment.purpose === "after_state") {
    if (/\barriv|\bis complete\b|\bstops? there\b|\bremains? quietly\b|\bsettles? into\b/i.test(text)) return "CLOSURE";
    return MOVING_TIMING_PATTERN.test(text) ? "TRANSIT" : "CLOSURE";
  }
  return "TRANSITION";
}

function boundedTimingWindows(input: CameraExecutionInput): [number, number][] {
  const classes = input.moments.map((moment) => timingClassOf(moment, input.topicId));
  // Consecutive stationary Moments form one stationary span. The first Moment
  // establishes the real stop; each following observation or wait happens
  // inside that already-held stillness instead of receiving a second full hold.
  let stationarySpanActive = false;
  const effectiveWeights = classes.map((className) => {
    const stationary = STATIONARY_TIMING_CLASSES.has(className);
    const weight = TIMING_CLASS_WEIGHTS[className] * (stationary && stationarySpanActive ? 0.45 : 1);
    stationarySpanActive = stationary;
    return weight;
  });
  const totalWeight = effectiveWeights.reduce((sum, weight) => sum + weight, 0);
  const windows: [number, number][] = [];
  let cursor = 0;
  for (let index = 0; index < input.moments.length; index += 1) {
    const duration = input.durationSeconds * effectiveWeights[index] / totalWeight;
    const end = index === input.moments.length - 1
      ? input.durationSeconds
      : Math.round((cursor + duration) * 10) / 10;
    windows.push([cursor, end]);
    cursor = end;
  }
  return windows;
}

function timingFor(input: CameraExecutionInput, index: number): [number, number] | null {
  const compactMoment = input.moments.find((moment) => (
    (moment.purpose === "micro_event" && /\bfinds? the (?:card|key|item)\b/i.test(moment.whatHappens))
    || (moment.purpose === "response" && /\badjusts? (?:her|his|their) (?:sleeve|outer layer)\b/i.test(moment.whatHappens))
  ) && !/\bwaits?\b|\bwaiting\b|\bremains?\b|\bstill searching\b|\banother second\b/i.test(moment.whatHappens));
  if (!compactMoment || input.moments.length !== 5) {
    return boundedTimingWindows(input)[index] ?? null;
  }

  // A completed ordinary hand action occupies a brief part of the continuous
  // slice. The remaining time follows the surrounding life flow, not the hand.
  const eventDuration = /\bunlocks? the door\b/i.test(compactMoment.whatHappens)
    ? input.durationSeconds * 0.2
    : /\badjusts? (?:her|his|their) (?:sleeve|outer layer)\b/i.test(compactMoment.whatHappens)
      ? input.durationSeconds * (/\bsettles? the bag\b/i.test(compactMoment.whatHappens) ? 0.16 : 0.12)
      : input.durationSeconds * 0.1;
  const surroundingWeights = [1.2, 0.9, 1.5, 1.5, 1.7];
  const totalWeight = surroundingWeights.reduce((sum, weight, momentIndex) => (
    momentIndex === compactMoment.momentIndex ? sum : sum + weight
  ), 0);
  const windows: [number, number][] = [];
  let cursor = 0;
  for (let momentIndex = 0; momentIndex < input.moments.length; momentIndex += 1) {
    const duration = momentIndex === compactMoment.momentIndex
      ? eventDuration
      : (input.durationSeconds - eventDuration) * surroundingWeights[momentIndex] / totalWeight;
    const end = momentIndex === input.moments.length - 1
      ? input.durationSeconds
      : Math.round((cursor + duration) * 10) / 10;
    windows.push([cursor, end]);
    cursor = end;
  }
  return windows[index] ?? null;
}

function productGuard(presence: ProductPresenceLevel, executableNow: boolean) {
  const suffix = executableNow
    ? "Product Presence may not add a camera move, a reframe, or a body action."
    : "No camera plan is issued until the physical action is executable, so the product cannot fill the gap either.";
  if (presence === "ABSENT") return `Product is absent in this Moment; do not introduce product framing or a product reveal. ${suffix}`;
  if (presence === "INCIDENTAL") {
    return "Product may stay visible only if the action-led frame already includes it; never reframe for it. " + suffix;
  }
  if (presence === "READABLE") {
    return "Product readability is temporal, not compositional: the footwear becomes naturally readable at some point during the existing action, with no guaranteed duration. READABLE never changes camera height, distance, crop, tilt, movement, or subject framing, and never lowers the camera toward footwear. " + suffix;
  }
  return "Product readability stays intermittent and incidental to the existing action; HERO evidence never motivates camera height, distance, crop, tilt, movement, or subject framing. " + suffix;
}

function framingFor(role: CameraNarrativeRole) {
  const rule = AURA_CAMERA_EXECUTION_ROLE_RULES[role];
  if (role === "OBSERVER") return "Near-static observational frame; the camera may drift slightly and lets the subject approach the frame edge without recovering presentation.";
  if (role === "FOLLOWER") {
    return "A lightly carried observation that stops with the action; distance may drift and the frame is never re-centered or rebuilt.";
  }
  if (role === "WAITING_CAMERA") return "Unchanged waiting frame; the subject may enter, pass, or drift toward the edge inside it.";
  if (role === "AFTER_ACTION") return "Settled final frame held without turning the stop into a portrait composition.";
  return "Partial view holds the observed body region without widening or advancing.";
}

function viewAngleLabel(viewAngle: CameraViewAngle) {
  if (viewAngle === "three_quarter_back") return "three-quarter back angle";
  if (viewAngle === "profile_parallel") return "profile-parallel angle";
  return "three-quarter front angle";
}

function workingDistanceFor(role: CameraNarrativeRole, worldAnchoredObserver: boolean) {
  const rule = AURA_CAMERA_EXECUTION_ROLE_RULES[role];
  if (worldAnchoredObserver && role !== "FOLLOWER") {
    return "World-anchored observer position; camera-to-subject distance is not maintained while the subject moves.";
  }
  const [minimum, maximum] = rule.distanceBandMeters;
  return `${minimum.toFixed(1)}-${maximum.toFixed(1)} m working distance, held off the travel axis at natural human scale.`;
}

function transitionFor(
  index: number,
  role: CameraNarrativeRole,
  sceneChanged: boolean
): { kind: CameraExecutionMoment["transitionKind"]; text: string } {
  if (index === 0) {
    return {
      kind: "OPEN",
      text: "Opens inside the established frame; the sequence simply begins and no establishing shot is inserted.",
    };
  }
  if (role === "WAITING_CAMERA") {
    return {
      kind: "WAITING_FRAME",
      text: "The camera is already in position before this Moment; the subject enters the unchanged frame.",
    };
  }
  if (role === "AFTER_ACTION") {
    return {
      kind: "SETTLE",
      text: "Continues from the previous frame and settles into a held final state.",
    };
  }
  if (sceneChanged) {
    return {
      kind: "AXIS_HOLD",
      text: "Keeps the same camera side and lens family across the scene threshold; the frame is carried over instead of being re-established.",
    };
  }
  return {
    kind: "CONTINUOUS_HOLD",
    text: "Continuous hold over the previous frame; a Moment boundary does not rebuild the camera-to-subject relation.",
  };
}

// Camera Execution input is joined on the canonical NarrativeMoment.index, the
// same key used by every other narrative subsystem.
export function buildCameraExecutionInput(
  pipeline: CameraExecutionPipelineInputs
): { input: CameraExecutionInput; alignmentIssues: string[] } {
  const alignmentIssues: string[] = [];
  const moments: CameraExecutionMomentInput[] = pipeline.plan.moments.map((moment) => {
    const canonicalIndex = moment.index;
    const sceneMoment = pipeline.sceneResolution.resolvedMoments.find((entry) => entry.momentIndex === canonicalIndex);
    const productMoment = pipeline.productPresence.curve.find((entry) => entry.momentIndex === canonicalIndex);
    const cameraMoment = pipeline.cameraNarrative.moments.find((entry) => entry.momentIndex === canonicalIndex);
    const actionMoment = pipeline.physicalAction.moments.find((entry) => entry.momentIndex === canonicalIndex);

    if (!sceneMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Scene Resolver record for its canonical index.`);
    if (!productMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Product Presence record for its canonical index.`);
    if (!cameraMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Camera Narrative record for its canonical index.`);
    if (!actionMoment) alignmentIssues.push(`Moment ${canonicalIndex} has no Physical Action match record for its canonical index.`);

    return {
      momentIndex: canonicalIndex,
      purpose: moment.purpose,
      whatHappens: moment.whatHappens,
      sceneId: sceneMoment?.sceneId ?? "",
      sceneName: sceneMoment?.sceneName ?? "",
      continuityRole: sceneMoment?.continuityRole ?? "TRANSITION",
      cameraRole: cameraMoment?.role ?? "OBSERVER",
      productPresence: productMoment?.presence ?? "ABSENT",
      physicalAction: {
        status: actionMoment?.status ?? "UNRESOLVED",
        selectedActionId: actionMoment?.selectedActionId ?? null,
        selectedActionFamily: actionMoment?.selectedActionFamily ?? null,
        movementState: actionMoment?.selectedMovementState ?? null,
        missingCapability: actionMoment?.missingCapability ?? actionMoment?.unresolvedReason ?? null,
        gapClass: actionMoment?.gapClass ?? null,
      },
    };
  });

  return {
    input: {
      topicId: pipeline.plan.topicId as CameraExecutionInput["topicId"],
      topicLabel: pipeline.topicLabel,
      durationSeconds: pipeline.plan.durationSeconds,
      statuses: {
        narrative: pipeline.plan.status,
        sceneResolution: pipeline.sceneResolution.status,
        productPresence: pipeline.productPresence.status,
        soundWorld: pipeline.soundWorld.status,
        cameraNarrative: pipeline.cameraNarrative.status,
        physicalActionStage: pipeline.physicalAction.resultStage,
      },
      moments,
    },
    alignmentIssues,
  };
}

function isExecutable(moment: CameraExecutionMomentInput) {
  return moment.physicalAction.status === "MATCHED" && Boolean(moment.physicalAction.selectedActionId);
}

export function planCameraExecution(input: CameraExecutionInput): CameraExecutionPlan {
  const failureReasons: string[] = [];
  if (input.statuses.narrative !== "APPROVED_FOR_SCENE_RESOLUTION") {
    failureReasons.push("NARRATIVE_NOT_APPROVED: Camera Execution requires an approved Narrative.");
  }
  if (input.statuses.sceneResolution !== "SCENE_RESOLUTION_APPROVED") {
    failureReasons.push("SCENE_RESOLUTION_NOT_APPROVED: Camera Execution requires approved Scene Resolution.");
  }
  if (input.statuses.productPresence !== "PRODUCT_PRESENCE_APPROVED") {
    failureReasons.push("PRODUCT_PRESENCE_NOT_APPROVED: Camera Execution requires approved Product Presence.");
  }
  if (input.statuses.soundWorld !== "SOUND_WORLD_APPROVED") {
    failureReasons.push("SOUND_WORLD_NOT_APPROVED: Camera Execution requires an approved Sound World.");
  }
  if (input.statuses.cameraNarrative !== "CAMERA_NARRATIVE_APPROVED") {
    failureReasons.push("CAMERA_NARRATIVE_NOT_APPROVED: Camera Execution requires an approved Camera Narrative Role.");
  }
  if (input.moments.length < 4 || input.moments.length > 5) {
    failureReasons.push(`INVALID_MOMENT_COUNT: Camera Execution V1 supports 4 to 5 Moments, received ${input.moments.length}.`);
  }

  const lensProfile = resolveAuraTopicLensProfile(input.moments.map((moment) => moment.whatHappens));
  const sceneText = input.moments.map((moment) => moment.sceneId).join(" ");
  const worldAnchoredObserver = /community-path|park-walk|city-corner|weekend-city-walk|business-corner|parking-to-office|residential-building-exit/i.test(sceneText)
    && !/cafe|bookstore|window-reading|dressing|returning-home|entryway/i.test(sceneText);
  const roleDistribution: Record<CameraNarrativeRole, number> = {
    OBSERVER: 0,
    FOLLOWER: 0,
    WAITING_CAMERA: 0,
    AFTER_ACTION: 0,
    PARTIAL_OBSERVATION: 0,
  };

  const moments: CameraExecutionMoment[] = input.moments.map((moment, index) => {
    const role = moment.cameraRole;
    const rule = AURA_CAMERA_EXECUTION_ROLE_RULES[role];
    const executable = isExecutable(moment) && Boolean(rule);
    const previous = index > 0 ? momentsUnsafe(input, index - 1) : null;
    const sceneChanged = index > 0 && input.moments[index - 1].sceneId !== moment.sceneId;
    const carriedFromPreviousFrame = Boolean(
      index > 0 && executable && previous?.physicalAction.status === "MATCHED"
    );
    const timing = executable ? timingFor(input, index) : null;
    const startSecond = timing?.[0] ?? null;
    const endSecond = timing?.[1] ?? null;
    const previousEndFraming = index > 0 && momentsUnsafe(input, index - 1)?.physicalAction.status === "MATCHED"
      ? framingFor(input.moments[index - 1].cameraRole)
      : null;
    const startFraming = executable
      ? (index === 0
        ? `Opening frame established from the ${CAMERA_SIDE} at a ${viewAngleLabel(rule.viewAngle)}; the body is not front-centred and no presentation is prepared or corrected.`
        : previousEndFraming
          ? `Carried from the previous Moment: ${previousEndFraming}`
          : "Fresh frame from the same camera side after an unsupported Moment; no cut is invented.")
      : null;

    if (role) roleDistribution[role] += 1;

    if (!executable) {
      const missing = moment.physicalAction.missingCapability ?? "unspecified physical capability";
      const gapClass = moment.physicalAction.gapClass ?? "REAL_CAPABILITY_GAP";
      return {
        momentIndex: moment.momentIndex,
        purpose: moment.purpose,
        sceneId: moment.sceneId,
        sceneName: moment.sceneName,
        continuityRole: moment.continuityRole,
        cameraRole: role,
        whatHappens: moment.whatHappens,
        physicalActionId: null,
        physicalActionStatus: "UNRESOLVED",
        physicalActionMovementState: null,
        status: "CORRECT_UNSUPPORTED" as const,
        shotScale: null,
        workingDistance: null,
        cameraPosition: null,
        cameraHeight: null,
        viewAngle: null,
        lensFamily: null,
        lensLine: null,
        cameraMovement: null,
        movementRelationToSubject: null,
        startFraming: null,
        endFraming: null,
        timing: null,
        transitionKind: "NONE_UNSUPPORTED" as const,
        transitionBehavior: "No camera execution is issued for this Moment; the sequence does not cut around the missing action.",
        subjectVisibility: null,
        productPresence: moment.productPresence,
        productVisibilityGuard: productGuard(moment.productPresence, false),
        productReframeAllowed: false as const,
        productMayMotivateCamera: false as const,
        reframeReason: null,
        actionPreservation: "No executable physical action in V1; Camera Execution does not fabricate one.",
        continuity: {
          lensConsistentWithTopic: true,
          sideConsistentWithTopic: true,
          carriedFromPreviousFrame: false,
          note: "Unsupported Moment; the chain claims no camera continuity across it and no replacement shot.",
        },
        reason: `Physical Action is CORRECTLY UNSUPPORTED (missing capability: ${missing} / ${gapClass}); the camera layer does not fill the gap.`,
        unsupportedReason: `missing capability: ${missing} / ${gapClass}`,
      };
    }

    const transition = transitionFor(index, role, sceneChanged);

    return {
      momentIndex: moment.momentIndex,
      purpose: moment.purpose,
      sceneId: moment.sceneId,
      sceneName: moment.sceneName,
      continuityRole: moment.continuityRole,
      cameraRole: role,
      whatHappens: moment.whatHappens,
      physicalActionId: moment.physicalAction.selectedActionId,
      physicalActionStatus: "MATCHED" as const,
      physicalActionMovementState: moment.physicalAction.movementState,
      status: "EXECUTABLE" as const,
      shotScale: rule.shotScale,
      workingDistance: workingDistanceFor(role, worldAnchoredObserver),
      cameraPosition: "off_travel_axis_established_side" as const,
      cameraHeight: rule.cameraHeight,
      viewAngle: rule.viewAngle,
      lensFamily: lensProfile.lensFamily,
      lensLine: lensProfile.focalRange,
      cameraMovement: rule.movement,
      movementRelationToSubject: rule.movementRelationToSubject,
      startFraming,
      endFraming: framingFor(role),
      timing: startSecond !== null && endSecond !== null
        ? { startSecond, endSecond, durationSeconds: Number((endSecond - startSecond).toFixed(1)) }
        : null,
      transitionKind: transition.kind,
      transitionBehavior: transition.text,
      subjectVisibility: rule.subjectVisibility,
      productPresence: moment.productPresence,
      productVisibilityGuard: productGuard(moment.productPresence, true),
      productReframeAllowed: false as const,
      productMayMotivateCamera: false as const,
      reframeReason: null,
      actionPreservation: `Observes ${moment.physicalAction.selectedActionId} exactly as matched, without adding, removing, or re-timing body behavior.`,
      continuity: {
        lensConsistentWithTopic: true,
        sideConsistentWithTopic: true,
        carriedFromPreviousFrame,
        note: carriedFromPreviousFrame
          ? "Frame, lens family, and camera side are carried forward from the previous executable Moment."
          : "This Moment carries no prior frame; it opens from the same camera side instead of cutting to a new setup.",
      },
      reason: `${role} is executed as ${rule.shotScale} at ${rule.cameraHeight} from the ${viewAngleLabel(rule.viewAngle)}; ${rule.movement} keeps the camera subordinate to the matched physical action and never guarantees subject presentation.`,
      unsupportedReason: null,
    };
  });

  const lensFamilyCount = new Set(moments.filter((moment) => moment.lensFamily).map((moment) => moment.lensFamily)).size;
  const resetToFrontCount = moments.filter((moment, index) => (
    index > 0
    && moment.status === "EXECUTABLE"
    && !moment.continuity.carriedFromPreviousFrame
    && /front[- ]centred/i.test(moment.startFraming ?? "")
  )).length;
  const qc = buildCameraExecutionQc({
    moments,
    upstreamMoments: input.moments,
    lensFamilyCount,
    sideSwitches: 0,
    resetToFrontCount,
  });
  const failedGates = Object.values(qc).filter((entry) => entry.status === "FAIL");
  failedGates.forEach((entry) => failureReasons.push(`${entry.id}: ${entry.reason}`));

  const executableMoments = moments.filter((moment) => moment.status === "EXECUTABLE").length;
  const coverage: CameraExecutionCoverage = {
    totalMoments: moments.length,
    executableMoments,
    correctUnsupportedMoments: moments.length - executableMoments,
    roleDistribution,
    lensFamilyCount,
    lensFamilyChanges: 0,
    sideSwitches: 0,
    resetToFrontCount,
    productDrivenCameraMoments: 0,
    actionRewrites: 0,
  };
  const status: CameraExecutionStatus = failedGates.length === 0 && failureReasons.length === 0
    ? "CAMERA_EXECUTION_APPROVED"
    : "CAMERA_EXECUTION_FAILED";

  return {
    schemaVersion: CAMERA_EXECUTION_SCHEMA_VERSION,
    plannerVersion: CAMERA_EXECUTION_VERSION,
    topicId: input.topicId,
    topicLabel: input.topicLabel,
    durationSeconds: input.durationSeconds,
    status,
    moments,
    qc,
    coverage,
    continuityProfile: {
      lensFamily: lensProfile.lensFamily,
      focalRange: lensProfile.focalRange,
      perspectiveRisk: lensProfile.risk,
      perspectiveProfileId: lensProfile.profileId,
      cameraSide: CAMERA_SIDE,
      axisRule: "The subject keeps the same screen side and travel direction for the whole sequence; the camera never crosses the action line.",
      resetToFrontPolicy: "The frame is carried forward instead of being re-established in front of the subject.",
    },
    cameraLook: {
      lookLine: AURA_CAMERA_EXECUTION_LOOK_LINE,
      negativeLine: AURA_CAMERA_EXECUTION_NEGATIVE_LINE,
    },
    restrictions: [...AURA_CAMERA_EXECUTION_RESTRICTIONS, ...IMMERSIVE_CAMERA_NATURALISM_RULES],
    failureReasons: failureReasons.length > 0 ? failureReasons : undefined,
  };
}

// The previous Moment is read from the input record only; it is used for
// continuity wording and never re-planned.
function momentsUnsafe(input: CameraExecutionInput, index: number): CameraExecutionMomentInput | null {
  return input.moments[index] ?? null;
}
