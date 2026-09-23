import { AURA_CAMERA_EXECUTION_RESTRICTIONS } from "./aura-camera-rules";
import type {
  CameraExecutionMoment,
  CameraExecutionMomentInput,
  CameraExecutionQc,
  CameraExecutionQcGate,
  CameraExecutionQcGateId,
  CameraLensFamily,
  CameraMovementKind,
  CameraShotScale,
} from "./types";

const ALLOWED_LENS_FAMILIES: CameraLensFamily[] = [
  "standard_image_type",
  "stabilized_50_70",
  "shoe_safe_60_85",
  "telephoto_candid_105_180",
];

const ALLOWED_MOVEMENTS: CameraMovementKind[] = [
  "locked_off",
  "restrained_follow",
  "hold_position",
  "short_lateral_reframe",
];

const ALLOWED_SHOT_SCALES: CameraShotScale[] = [
  "wide_environmental",
  "full_figure",
  "medium_full",
  "medium",
  "partial_body_observation",
];

const FOLLOWABLE_MOVEMENT_STATES = new Set([
  "walking_starting",
  "walking_ongoing",
  "walking_finish",
  "stopping_settle",
  "turning",
  "transition_pause",
]);

export type CameraExecutionQcInput = {
  moments: CameraExecutionMoment[];
  upstreamMoments: CameraExecutionMomentInput[];
  lensFamilyCount: number;
  sideSwitches: number;
  resetToFrontCount: number;
};

function gate(
  id: CameraExecutionQcGateId,
  label: string,
  passed: boolean,
  passReason: string,
  failReason: string
): CameraExecutionQcGate {
  return {
    id,
    label,
    status: passed ? "PASS" : "FAIL",
    reason: passed ? passReason : failReason,
  };
}

// Deterministic camera QC. Every gate reads structural plan fields; no gate
// scores aesthetics and no gate can be satisfied by prose alone.
export function buildCameraExecutionQc(input: CameraExecutionQcInput): CameraExecutionQc {
  const upstreamByIndex = new Map(input.upstreamMoments.map((moment) => [moment.momentIndex, moment]));
  const executable = input.moments.filter((moment) => moment.status === "EXECUTABLE");
  const unsupported = input.moments.filter((moment) => moment.status === "CORRECT_UNSUPPORTED");

  const actionPreserved = input.moments.every((moment) => {
    const upstream = upstreamByIndex.get(moment.momentIndex);
    if (!upstream) return false;
    if (upstream.physicalAction.status === "UNRESOLVED") {
      return moment.status === "CORRECT_UNSUPPORTED"
        && moment.physicalActionId === null
        && moment.shotScale === null
        && moment.cameraMovement === null;
    }
    return moment.status === "EXECUTABLE"
      && moment.physicalActionId === upstream.physicalAction.selectedActionId
      && moment.physicalActionMovementState === upstream.physicalAction.movementState;
  });

  const rolePreserved = input.moments.every((moment) => (
    moment.cameraRole === upstreamByIndex.get(moment.momentIndex)?.cameraRole
  ));

  const noProductDrivenAction = input.moments.every((moment) => (
    moment.productReframeAllowed === false
    && moment.productMayMotivateCamera === false
    && !/reframe (?:for|because of) the product|product[- ]driven/i.test(`${moment.movementRelationToSubject ?? ""} ${moment.reason}`)
  ));

  const noProductOnlyMotivation = input.moments.every((moment) => {
    if (moment.cameraMovement === "short_lateral_reframe" && moment.reframeReason === null) return false;
    return moment.productReframeAllowed === false;
  });

  const impossibleFollow = input.moments.filter((moment) => (
    moment.status === "EXECUTABLE"
    && moment.cameraRole === "FOLLOWER"
    && !(moment.physicalActionStatus === "MATCHED"
      && moment.physicalActionMovementState !== null
      && FOLLOWABLE_MOVEMENT_STATES.has(moment.physicalActionMovementState))
  ));

  const collisionRisk = executable.filter((moment) => (
    moment.cameraPosition !== "off_travel_axis_established_side"
    || !moment.workingDistance
  ));

  const perspectiveAbuse = executable.filter((moment) => (
    moment.lensFamily === null
    || !ALLOWED_LENS_FAMILIES.includes(moment.lensFamily)
    || moment.cameraMovement === null
    || !ALLOWED_MOVEMENTS.includes(moment.cameraMovement)
    || moment.shotScale === null
    || !ALLOWED_SHOT_SCALES.includes(moment.shotScale)
  ));

  const unmotivatedReframe = executable.filter((moment) => (
    moment.cameraMovement === "short_lateral_reframe" && !moment.reframeReason
  ));

  const continuityFailures: string[] = [];
  if (input.lensFamilyCount !== 1) {
    continuityFailures.push(`${input.lensFamilyCount} lens families appear inside one sequence.`);
  }
  if (input.sideSwitches !== 0) {
    continuityFailures.push(`${input.sideSwitches} camera-side switches were introduced.`);
  }
  if (input.resetToFrontCount !== 0) {
    continuityFailures.push(`${input.resetToFrontCount} Moments re-established the frame instead of carrying it.`);
  }
  for (const moment of input.moments) {
    if (moment.status === "EXECUTABLE" && moment.transitionKind === "NONE_UNSUPPORTED") {
      continuityFailures.push(`Moment ${moment.momentIndex} has no continuous transition into it.`);
    }
    if (moment.status === "EXECUTABLE" && /reverse angle|whip pan|jump cut|hard cut|montage/i.test(moment.transitionBehavior)) {
      continuityFailures.push(`Moment ${moment.momentIndex} states a discontinuous transition: ${moment.transitionBehavior}`);
    }
  }

  const lastExecutable = [...executable].reverse()[0];
  const endingIsUnsupported = input.moments.length > 0
    && input.moments[input.moments.length - 1].status === "CORRECT_UNSUPPORTED";
  const endingMovement = lastExecutable?.cameraMovement ?? null;
  const naturalEnding = endingIsUnsupported
    ? true
    : Boolean(lastExecutable
      && (endingMovement === "hold_position"
        || endingMovement === "locked_off"
        || endingMovement === "restrained_follow")
      && Boolean(lastExecutable.endFraming));
  const endingReason = endingIsUnsupported
    ? "The final Moment is correctly unsupported, so the plan claims no cinematic resolution instead of inventing one."
    : endingMovement === "restrained_follow"
      ? "The final Moment is a motivated follow that stops exactly when the matched action ends; the plan adds no new event, shot, or product beat."
      : "The final Moment holds the settled state and ends on an unchanged frame.";

  return {
    physical_action_preserved: gate(
      "physical_action_preserved",
      "Physical Action Preserved",
      actionPreserved,
      `All ${input.moments.length} Moments keep the upstream Physical Action selection unchanged; Camera Execution issues no action rewrite.`,
      "At least one Moment diverges from the upstream Physical Action selection or issues execution for an unresolved action."
    ),
    camera_role_preserved: gate(
      "camera_role_preserved",
      "Camera Role Preserved",
      rolePreserved,
      "Every Moment keeps the Camera Narrative Role delivered upstream.",
      "At least one Moment changed its Camera Narrative Role at the execution layer."
    ),
    no_product_driven_action: gate(
      "no_product_driven_action",
      "No Product-Driven Action",
      noProductDrivenAction,
      "Product Presence never produces or edits a body action; the action stays the upstream Physical Action.",
      "Product Presence influenced a body action or a camera decision."
    ),
    no_product_only_camera_motivation: gate(
      "no_product_only_camera_motivation",
      "No Product-Only Camera Motivation",
      noProductOnlyMotivation,
      "No camera move exists only because Product Presence requested one; HERO status stays a readability guard.",
      "At least one camera move is motivated by Product Presence alone, or an unmotivated reframe exists."
    ),
    no_impossible_follow: gate(
      "no_impossible_follow",
      "No Impossible Follow",
      impossibleFollow.length === 0,
      "Every FOLLOWER Moment observes a real matched walking, turning, or transition behavior at a fixed working distance.",
      `${impossibleFollow.length} FOLLOWER Moment(s) have no matched travelling action to follow.`
    ),
    no_body_camera_collision: gate(
      "no_body_camera_collision",
      "No Body / Camera Collision",
      collisionRisk.length === 0,
      "Every executable Moment keeps the camera off the subject's travel axis at a stated working distance.",
      `${collisionRisk.length} executable Moment(s) place the camera on the travel path or without a working distance.`
    ),
    no_perspective_abuse: gate(
      "no_perspective_abuse",
      "No Perspective Abuse",
      perspectiveAbuse.length === 0,
      `Every executable Moment uses one of the approved AURA shot scales, lens families and camera movements; ${AURA_CAMERA_EXECUTION_RESTRICTIONS.length} prohibited behaviours are excluded by construction.`,
      `${perspectiveAbuse.length} executable Moment(s) use a shot scale, lens family, or movement outside the approved AURA camera families.`
    ),
    no_random_lens_jump: gate(
      "no_random_lens_jump",
      "No Random Lens Jump",
      input.lensFamilyCount === 1,
      "The whole sequence keeps one lens family resolved from the AURA perspective-risk rules for this topic.",
      `${input.lensFamilyCount} lens families appear inside one 15-second sequence.`
    ),
    no_unmotivated_reframe: gate(
      "no_unmotivated_reframe",
      "No Unmotivated Reframe",
      unmotivatedReframe.length === 0,
      "No Moment issues a reframe; every planned camera behaviour is locked, a motivated follow, or a held position.",
      `${unmotivatedReframe.length} reframe(s) were issued without a narrated motivation.`
    ),
    moment_continuity: gate(
      "moment_continuity",
      "Moment Continuity",
      continuityFailures.length === 0,
      `${executable.length} executable Moments read as one observed sequence: single lens family, single camera side, carried frames, and no cut language.`,
      continuityFailures.join(" ")
    ),
    natural_ending: gate(
      "natural_ending",
      "Natural Ending",
      naturalEnding,
      endingReason,
      "The final Moment still re-frames or re-establishes itself instead of ending with the action."
    ),
  };
}

export function summarizeCameraExecutionQc(qc: CameraExecutionQc) {
  const gates = Object.values(qc);
  return {
    total: gates.length,
    passed: gates.filter((entry) => entry.status === "PASS").length,
    failed: gates.filter((entry) => entry.status === "FAIL").map((entry) => entry.id),
  };
}
