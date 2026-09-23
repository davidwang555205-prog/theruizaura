import type { CameraNarrativeRole } from "../camera-role";
import type { ProductPresenceLevel } from "../product-presence";
import { AURA_CAMERA_EXECUTION_ROLE_RULES, AURA_CAMERA_EXECUTION_RESTRICTIONS, AURA_CAMERA_EXECUTION_LOOK_LINE, AURA_CAMERA_EXECUTION_NEGATIVE_LINE, resolveAuraTopicLensProfile } from "./aura-camera-rules";
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
// allocation is used by the Camera plan and the final Seedance script.
const SEQUENCE_TIMING: Record<number, [number, number][]> = {
  4: [[0, 2.6], [2.6, 7], [7, 12], [12, 15]],
  5: [[0, 2.4], [2.4, 6], [6, 9.4], [9.4, 12.8], [12.8, 15]],
};

const CAMERA_SIDE = "established A-side";

function timingFor(momentCount: number, index: number): [number, number] | null {
  return SEQUENCE_TIMING[momentCount]?.[index] ?? null;
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
    return "Keep the product readable inside the action-led framing already chosen, without a dedicated product shot. " + suffix;
  }
  return "Keep the product clearly readable inside the same action-led framing, and never let HERO evidence motivate the camera. " + suffix;
}

function framingFor(role: CameraNarrativeRole) {
  const rule = AURA_CAMERA_EXECUTION_ROLE_RULES[role];
  if (role === "OBSERVER") return "Held observational frame at a fixed working distance.";
  if (role === "FOLLOWER") {
    return "The follow stops at the exact moment the matched action ends; the frame is held at the same working distance and no new setup is established.";
  }
  if (role === "WAITING_CAMERA") return "Unchanged waiting frame; the subject has entered or passed inside it.";
  if (role === "AFTER_ACTION") return "Settled final frame held to the last second.";
  return "Partial view holds the observed body region without widening or advancing.";
}

function viewAngleLabel(viewAngle: CameraViewAngle) {
  if (viewAngle === "three_quarter_back") return "three-quarter back angle";
  if (viewAngle === "profile_parallel") return "profile-parallel angle";
  return "three-quarter front angle";
}

function workingDistanceFor(role: CameraNarrativeRole) {
  const rule = AURA_CAMERA_EXECUTION_ROLE_RULES[role];
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
    text: "Continuous hold over the previous frame; the camera relationship changes only as much as the action requires.",
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
    const timing = executable ? timingFor(input.moments.length, index) : null;
    const startSecond = timing?.[0] ?? null;
    const endSecond = timing?.[1] ?? null;
    const previousEndFraming = index > 0 && momentsUnsafe(input, index - 1)?.physicalAction.status === "MATCHED"
      ? framingFor(input.moments[index - 1].cameraRole)
      : null;
    const startFraming = executable
      ? (index === 0
        ? `Opening frame established from the ${CAMERA_SIDE} at a ${viewAngleLabel(rule.viewAngle)}; the body is not front-centred.`
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
      workingDistance: workingDistanceFor(role),
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
      reason: `${role} is executed as ${rule.shotScale} at ${rule.cameraHeight} from the ${viewAngleLabel(rule.viewAngle)}; ${rule.movement} keeps the camera subordinate to the matched physical action.`,
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
    restrictions: [...AURA_CAMERA_EXECUTION_RESTRICTIONS],
    failureReasons: failureReasons.length > 0 ? failureReasons : undefined,
  };
}

// The previous Moment is read from the input record only; it is used for
// continuity wording and never re-planned.
function momentsUnsafe(input: CameraExecutionInput, index: number): CameraExecutionMomentInput | null {
  return input.moments[index] ?? null;
}
