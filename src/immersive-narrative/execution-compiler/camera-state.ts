import type { CameraExecutionPlan } from "../camera-execution";
import type { ActionExecutionEvidence, CameraStateTransition, ExecutionMomentContract, ModelFacingCameraState } from "./types";

function framingFromShotScale(shotScale: string | null) {
  if (shotScale === "wide_environmental") return "wide";
  if (shotScale === "partial_body_observation") return "natural partial view";
  if (shotScale === "medium") return "medium";
  return "medium-full";
}

function desiredMovement(movement: string | null): ModelFacingCameraState["movementState"] {
  if (movement === "restrained_follow") return "restrained_follow";
  if (movement === "hold_position") return "hold_position";
  return "locked_off";
}

function travelling(evidence: ActionExecutionEvidence) {
  return /^walking_|^turning$/.test(evidence.movementState ?? "");
}

function settling(evidence: ActionExecutionEvidence) {
  return /^walking_finish$|^stopping_settle$|^stationary$|^transition_pause$|^seated$|^scene_task$|^garment_task$/.test(evidence.movementState ?? "");
}

// Moment != Shot. The camera state is established once and then inherited; a
// change needs a narrative or physical motivation, and PARTIAL_OBSERVATION may
// never introduce an insert shot.
export function buildCameraStates(
  cameraExecution: CameraExecutionPlan,
  contracts: ExecutionMomentContract[],
  evidences: Map<number, ActionExecutionEvidence>
): CameraStateTransition[] {
  const transitions: CameraStateTransition[] = [];
  let current: ModelFacingCameraState | null = null;
  let previousRole: string | null = null;

  for (const contract of contracts) {
    const cameraMoment = cameraExecution.moments.find((moment) => moment.momentIndex === contract.momentIndex);
    const evidence = evidences.get(contract.momentIndex) ?? {
      momentIndex: contract.momentIndex,
      status: "UNRESOLVED" as const,
      actionId: null,
      source: null,
      handTask: null,
      movementState: null,
      capabilityIds: [],
      internalText: "",
    };
    const executable = cameraMoment?.status === "EXECUTABLE";
    const partialObservation = cameraMoment?.cameraRole === "PARTIAL_OBSERVATION";
    const framing = partialObservation ? current?.framingState ?? "medium-full" : framingFromShotScale(cameraMoment?.shotScale ?? null);
    const movement = desiredMovement(cameraMoment?.cameraMovement ?? null);
    const desired: ModelFacingCameraState = {
      cameraPosition: cameraMoment?.cameraPosition ?? current?.cameraPosition ?? "off_travel_axis_established_side",
      cameraSide: cameraExecution.continuityProfile.cameraSide,
      height: cameraMoment?.cameraHeight ?? current?.height ?? "natural eye level",
      lensFamily: cameraExecution.continuityProfile.lensFamily,
      workingDistance: cameraMoment?.workingDistance ?? current?.workingDistance ?? "unchanged working distance",
      framingState: framing,
      movementState: movement,
      naturalPartialVisibility: partialObservation,
    };

    if (!current) {
      current = desired;
      transitions.push({
        momentIndex: contract.momentIndex,
        changed: true,
        suppressed: false,
        motivation: "initial camera state for the sequence",
        state: desired,
        note: "The opening Moment establishes the observation position, side, lens family, and framing.",
      });
      continue;
    }

    const movementChanged = desired.movementState !== current.movementState;
    const framingChanged = framing !== current.framingState;
    const anchorChanged = contract.spatialAnchor !== contracts[contracts.findIndex((entry) => entry.momentIndex === contract.momentIndex) - 1]?.spatialAnchor;

    let changed = false;
    let suppressed = false;
    let motivation: string | null = null;

    if (partialObservation) {
      if (movementChanged) {
        motivation = movement === "restrained_follow" && travelling(evidence)
          ? "the subject keeps travelling, so the follow continues"
          : settling(evidence) || cameraMoment?.cameraRole === "AFTER_ACTION"
            ? "the subject settles, so the camera stops with them"
            : null;
        changed = Boolean(motivation);
        suppressed = !changed;
        if (!changed) motivation = null;
      } else {
        suppressed = framingChanged;
        motivation = null;
      }
    } else if (movementChanged) {
      motivation = desired.movementState === "restrained_follow" && travelling(evidence)
        ? "the subject travels through the space, so the observation follows at a fixed distance"
        : desired.movementState === "locked_off" && settling(evidence)
          ? "the subject comes to rest, so the camera stops with them"
          : desired.movementState === "hold_position" && contract.purpose === "after_state"
            ? "the sequence ends, so the camera holds the settled state"
            : null;
      changed = Boolean(motivation);
      suppressed = !changed;
    } else if (framingChanged) {
      const settledAfterWaiting = previousRole === "WAITING_CAMERA"
        && cameraMoment?.cameraRole === "OBSERVER"
        && settling(evidence);
      motivation = anchorChanged
        ? `the subject advances to a new position (${contract.spatialAnchor})`
        : settledAfterWaiting
          ? "the subject has entered the waiting frame and comes to rest, so the observation settles on them"
          : null;
      changed = Boolean(motivation);
      suppressed = !changed;
    }

    if (changed) {
      current = { ...desired, naturalPartialVisibility: partialObservation };
    } else {
      current = { ...current, naturalPartialVisibility: partialObservation };
    }

    transitions.push({
      momentIndex: contract.momentIndex,
      changed,
      suppressed,
      motivation: changed ? motivation : null,
      state: current,
      note: changed
        ? `Camera state updates because ${motivation}.`
        : suppressed
          ? "A camera change was requested but is not motivated by this Moment, so the previous state is kept."
          : "Same camera state as the previous Moment; nothing is re-framed.",
    });
    previousRole = cameraMoment?.cameraRole ?? previousRole;
  }

  return transitions;
}
