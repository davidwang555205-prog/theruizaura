import type {
  CommercialWorldModel,
  CommercialWorldStateSnapshot,
  CommercialWorldStateTimeline,
} from "./world-state";
import { findCommercialWorldEntity } from "./world-state";

export const COMMERCIAL_TAKE_PLAN_SCHEMA_VERSION = "commercial-film/take-plan-v1" as const;

/**
 * A narrative beat is not a take. A take is only opened when a real spatial,
 * photographic, temporal, or action continuity boundary makes it necessary.
 */

export type CommercialEventCameraState = {
  scale: "ENVIRONMENTAL" | "MEDIUM" | "PROXIMAL";
  subjectRelation: "FULL_PERSON" | "LOWER_BODY" | "WORK_SURFACE";
  handoff: "CONTINUOUS" | "REQUIRES_CUT";
};

export type CommercialActionContinuity = "CONTINUOUS" | "SETTLES" | "NEW_ACTION_SEQUENCE";

export type CommercialTakeBoundaryMotivation =
  | "SPATIAL_BOUNDARY"
  | "CAMERA_STATE_DISCONTINUITY"
  | "TIME_DISCONTINUITY"
  | "ACTION_CANNOT_CONTINUE_IN_ONE_STATE";

export type CommercialTakeBoundaryEvidenceKind =
  | "SPATIAL_TRANSITION"
  | "TIME_GAP"
  | "CAMERA_STATE_CHANGE"
  | "ACTION_SEQUENCE_CHANGE"
  | "PHYSICAL_INTERRUPTION";

export type CommercialTakeBoundaryEvidence = {
  kind: CommercialTakeBoundaryEvidenceKind;
  statement: string;
  proof: {
    entityId?: string;
    attribute?: string;
    fromValue?: string;
    toValue?: string;
    seconds?: number;
    fromCameraState?: CommercialEventCameraState;
    toCameraState?: CommercialEventCameraState;
    fromActionSequenceId?: string;
    toActionSequenceId?: string;
  };
};

export type CommercialTakeBoundary = {
  motivation: CommercialTakeBoundaryMotivation;
  boundaryReason: string;
  boundaryEvidence: CommercialTakeBoundaryEvidence[];
  whyContinuousTakeFails: string;
};

export type CommercialTake = {
  takeIndex: number;
  shotIndexes: number[];
  beatIndexes: number[];
  startSecond: number;
  endSecond: number;
  boundary: CommercialTakeBoundary | null;
  continuityInheritance: string[];
};

export type CommercialTakeBoundaryDecision = {
  shotIndex: number;
  declaredMotivation: CommercialTakeBoundaryMotivation | null;
  admitted: boolean;
  admittedMotivation: CommercialTakeBoundaryMotivation | null;
  reason: string;
  boundaryEvidence: string[];
  whyContinuousTakeFails: string;
};

export type CommercialTakePlan = {
  schemaVersion: typeof COMMERCIAL_TAKE_PLAN_SCHEMA_VERSION;
  takes: CommercialTake[];
  boundaryDecisions: CommercialTakeBoundaryDecision[];
  failureReasons: string[];
};

export type CommercialTakeBeat = {
  shotIndex: number;
  durationSeconds: number;
  timeRange?: { startSecond: number; endSecond: number };
  cameraState: CommercialEventCameraState;
  actionContinuity: CommercialActionContinuity;
  actionSequenceId: string;
  actionRequiresFreshSetup: boolean;
  takeBoundary: CommercialTakeBoundary | null;
  timeGapSeconds: number;
};

const MAX_COMMERCIAL_TAKES = 3;

function cameraStateChanged(
  previous: CommercialEventCameraState,
  current: CommercialEventCameraState
) {
  return previous.scale !== current.scale || previous.subjectRelation !== current.subjectRelation;
}

function cameraStatesEqual(
  left: CommercialEventCameraState,
  right: CommercialEventCameraState
) {
  return left.scale === right.scale
    && left.subjectRelation === right.subjectRelation
    && left.handoff === right.handoff;
}

function hasEvidence(
  boundary: CommercialTakeBoundary,
  kind: CommercialTakeBoundaryEvidenceKind
) {
  return boundary.boundaryEvidence.some((entry) => entry.kind === kind);
}

function evidenceMatchesSpatialChange(
  boundary: CommercialTakeBoundary,
  change: { attribute: string | null; from: string | null; to: string | null }
) {
  if (!change.attribute || change.from === null || change.to === null) return false;
  return boundary.boundaryEvidence.some((entry) => (
    entry.kind === "SPATIAL_TRANSITION"
    && entry.proof.entityId === "character"
    && entry.proof.attribute === change.attribute
    && entry.proof.fromValue === change.from
    && entry.proof.toValue === change.to
  ));
}

function evidenceMatchesTimeGap(boundary: CommercialTakeBoundary, seconds: number) {
  return boundary.boundaryEvidence.some((entry) => (
    entry.kind === "TIME_GAP"
    && entry.proof.seconds === seconds
  ));
}

function evidenceMatchesCameraChange(
  boundary: CommercialTakeBoundary,
  previous: CommercialEventCameraState,
  current: CommercialEventCameraState
) {
  return boundary.boundaryEvidence.some((entry) => (
    entry.kind === "CAMERA_STATE_CHANGE"
    && entry.proof.fromCameraState
    && entry.proof.toCameraState
    && cameraStatesEqual(entry.proof.fromCameraState, previous)
    && cameraStatesEqual(entry.proof.toCameraState, current)
  ));
}

function evidenceMatchesActionChange(
  boundary: CommercialTakeBoundary,
  previousSequenceId: string,
  currentSequenceId: string
) {
  return boundary.boundaryEvidence.some((entry) => (
    entry.kind === "ACTION_SEQUENCE_CHANGE"
    && entry.proof.fromActionSequenceId === previousSequenceId
    && entry.proof.toActionSequenceId === currentSequenceId
  ));
}

function characterSpatialChange(input: {
  model: CommercialWorldModel;
  timeline: CommercialWorldStateTimeline;
  shotIndex: number;
}): { changed: boolean; attribute: string | null; from: string | null; to: string | null } {
  const step = input.timeline.find((entry) => entry.shotIndex === input.shotIndex);
  if (!step) return { changed: false, attribute: null, from: null, to: null };
  const character = input.model.entities.find((entity) => entity.kind === "CHARACTER");
  if (!character) return { changed: false, attribute: null, from: null, to: null };
  const attributes = ["space", "anchor"];
  for (const attribute of attributes) {
    const before = step.before.attributes[character.id]?.[attribute] ?? null;
    const after = step.after.attributes[character.id]?.[attribute] ?? null;
    if (before !== after) {
      return { changed: true, attribute, from: before, to: after };
    }
  }
  return { changed: false, attribute: null, from: null, to: null };
}

function admitTakeBoundary(input: {
  model: CommercialWorldModel;
  timeline: CommercialWorldStateTimeline;
  previous: CommercialTakeBeat;
  current: CommercialTakeBeat;
  boundary: CommercialTakeBoundary;
}): { admitted: boolean; reason: string } {
  const { boundary, current, previous } = input;
  if (!boundary.whyContinuousTakeFails.trim()) {
    return {
      admitted: false,
      reason: "The declared boundary has no explanation of why the action cannot continue inside the current take.",
    };
  }
  if (boundary.boundaryEvidence.length === 0) {
    return {
      admitted: false,
      reason: "The declared boundary has no structured evidence, so the take stays continuous.",
    };
  }
  if (boundary.motivation === "SPATIAL_BOUNDARY") {
    const change = characterSpatialChange({
      model: input.model,
      timeline: input.timeline,
      shotIndex: current.shotIndex,
    });
    if (!change.changed || !evidenceMatchesSpatialChange(boundary, change)) {
      return {
        admitted: false,
        reason: "No declared and evidenced spatial change happens at this beat, so the take stays continuous.",
      };
    }
    return {
      admitted: true,
      reason: `The character's ${change.attribute} changes from ${change.from ?? "undefined"} to ${change.to ?? "undefined"} at this beat, which is a real spatial boundary.`,
    };
  }
  if (boundary.motivation === "TIME_DISCONTINUITY") {
    if (current.timeGapSeconds <= 0 || !evidenceMatchesTimeGap(boundary, current.timeGapSeconds)) {
      return {
        admitted: false,
        reason: "No declared time discontinuity exists at this beat, so the take stays continuous.",
      };
    }
    return {
      admitted: true,
      reason: `A declared ${current.timeGapSeconds}s time discontinuity separates this beat from the previous one.`,
    };
  }
  if (boundary.motivation === "CAMERA_STATE_DISCONTINUITY") {
    const changed = cameraStateChanged(previous.cameraState, current.cameraState);
    if (
      !changed
      || current.cameraState.handoff !== "REQUIRES_CUT"
      || !evidenceMatchesCameraChange(boundary, previous.cameraState, current.cameraState)
      || !hasEvidence(boundary, "PHYSICAL_INTERRUPTION")
    ) {
      return {
        admitted: false,
        reason: "The photographic state can be reached by a continuous reframe, or the boundary lacks a narrative, spatial, or physical motivation, so the take stays continuous.",
      };
    }
    return {
      admitted: true,
      reason: `The photographic state changes from ${previous.cameraState.scale}/${previous.cameraState.subjectRelation} to ${current.cameraState.scale}/${current.cameraState.subjectRelation} and cannot be reached by a continuous reframe.`,
    };
  }
  if (
    current.actionRequiresFreshSetup
    && current.actionSequenceId !== previous.actionSequenceId
    && evidenceMatchesActionChange(boundary, previous.actionSequenceId, current.actionSequenceId)
    && hasEvidence(boundary, "PHYSICAL_INTERRUPTION")
  ) {
    return {
      admitted: true,
      reason: "A different action sequence begins here and cannot be completed inside the previous photographic state.",
    };
  }
  return {
    admitted: false,
    reason: "The action at this beat continues inside the current photographic state, so the take stays continuous.",
  };
}

function inheritanceLines(input: {
  model: CommercialWorldModel;
  state: CommercialWorldStateSnapshot;
}): string[] {
  const lines = ["same person, same wardrobe, same product, same season"];
  input.model.entities.forEach((entity) => {
    const values = input.state.attributes[entity.id] ?? {};
    Object.entries(values).forEach(([attribute, value]) => {
      if (value === entity.initialAttributes[attribute]) return;
      if (entity.kind === "CHARACTER" && attribute === "anchor") return;
      lines.push(`${entity.label} ${attribute === "space" ? "spatial state" : attribute}: ${value}`);
    });
  });
  if (input.state.completedActions.length > 0) {
    lines.push("no completed action inside this take restarts");
  }
  return lines;
}

export function planCommercialTakes(input: {
  model: CommercialWorldModel;
  timeline: CommercialWorldStateTimeline;
  beats: CommercialTakeBeat[];
}): CommercialTakePlan {
  const failureReasons: string[] = [];
  const boundaryDecisions: CommercialTakeBoundaryDecision[] = [];
  const takes: CommercialTake[] = [];
  let fallbackElapsed = 0;
  let currentTake: CommercialTake | null = null;

  input.beats.forEach((beat, index) => {
    // Production callers provide the authoritative beat window. The duration
    // fallback remains for isolated legacy validator fixtures only.
    const startSecond = beat.timeRange?.startSecond ?? Number(fallbackElapsed.toFixed(1));
    const endSecond = beat.timeRange?.endSecond ?? Number((startSecond + beat.durationSeconds).toFixed(1));
    fallbackElapsed = endSecond;
    const previous = index > 0 ? input.beats[index - 1] : null;
    let boundary: CommercialTakeBoundary | null = null;
    if (index === 0) {
      if (beat.takeBoundary) {
        failureReasons.push(
          `TAKE_BOUNDARY_BEFORE_FIRST_BEAT: shot ${beat.shotIndex + 1} declares a take boundary before the film has established any state.`
        );
      }
      boundaryDecisions.push({
        shotIndex: beat.shotIndex,
        declaredMotivation: beat.takeBoundary?.motivation ?? null,
        admitted: false,
        admittedMotivation: null,
        reason: "The first beat opens the first take of the film.",
        boundaryEvidence: [],
        whyContinuousTakeFails: "",
      });
    } else if (beat.takeBoundary && previous) {
      const decision = admitTakeBoundary({
        model: input.model,
        timeline: input.timeline,
        previous,
        current: beat,
        boundary: beat.takeBoundary,
      });
      boundaryDecisions.push({
        shotIndex: beat.shotIndex,
        declaredMotivation: beat.takeBoundary.motivation,
        admitted: decision.admitted,
        admittedMotivation: decision.admitted ? beat.takeBoundary.motivation : null,
        reason: decision.admitted
          ? `${beat.takeBoundary.boundaryReason} ${decision.reason}`
          : decision.reason,
        boundaryEvidence: beat.takeBoundary.boundaryEvidence.map((entry) => entry.statement),
        whyContinuousTakeFails: beat.takeBoundary.whyContinuousTakeFails,
      });
      if (decision.admitted) {
        boundary = beat.takeBoundary;
      }
    } else {
      boundaryDecisions.push({
        shotIndex: beat.shotIndex,
        declaredMotivation: null,
        admitted: false,
        admittedMotivation: null,
        reason: "The beat continues inside the current photographic state.",
        boundaryEvidence: [],
        whyContinuousTakeFails: "",
      });
    }

    if (!currentTake || boundary) {
      currentTake = {
        takeIndex: takes.length,
        shotIndexes: [],
        beatIndexes: [],
        startSecond,
        endSecond,
        boundary,
        continuityInheritance: inheritanceLines({
          model: input.model,
          state: input.timeline[index]?.before ?? {
            shotIndex: beat.shotIndex,
            attributes: {},
            completedActions: [],
          },
        }),
      };
      takes.push(currentTake);
    }
    currentTake.shotIndexes.push(beat.shotIndex);
    currentTake.beatIndexes.push(index);
    currentTake.endSecond = endSecond;
  });

  if (takes.length > MAX_COMMERCIAL_TAKES) {
    failureReasons.push(
      `TAKE_COUNT_OUT_OF_RANGE: ${input.beats.length} narrative beats produced ${takes.length} takes, but a 15-second Commercial Film may use at most ${MAX_COMMERCIAL_TAKES} motivated takes.`
    );
  }
  if (takes.length === 0) {
    failureReasons.push("TAKE_PLAN_EMPTY: no take could be planned for the current beat chain.");
  }

  return {
    schemaVersion: COMMERCIAL_TAKE_PLAN_SCHEMA_VERSION,
    takes,
    boundaryDecisions,
    failureReasons,
  };
}

export function commercialTakeIndexForShot(plan: CommercialTakePlan, shotIndex: number): number | null {
  const take = plan.takes.find((entry) => entry.shotIndexes.includes(shotIndex));
  return take ? take.takeIndex : null;
}

export function commercialTakeSharesStateWithPreviousShot(
  plan: CommercialTakePlan,
  shotIndex: number
): boolean {
  if (shotIndex <= 0) return false;
  const current = commercialTakeIndexForShot(plan, shotIndex);
  const previous = commercialTakeIndexForShot(plan, shotIndex - 1);
  if (current === null || previous === null) return false;
  return current === previous;
}

export function describeCommercialWorldEntity(
  model: CommercialWorldModel,
  entityId: string
): string {
  return findCommercialWorldEntity(model, entityId)?.label ?? entityId;
}
