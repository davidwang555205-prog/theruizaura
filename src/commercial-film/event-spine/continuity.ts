import {
  describeCommercialContinuityConflict,
  reduceCommercialWorldState,
  type CommercialContinuityConflict,
  type CommercialEventStateContract,
  type CommercialWorldModel,
  type CommercialWorldStateSnapshot,
  type CommercialWorldStateTimeline,
} from "./world-state";
import {
  planCommercialTakes,
  type CommercialActionContinuity,
  type CommercialEventCameraState,
  type CommercialTakeBoundary,
  type CommercialTakePlan,
} from "./takes";
import {
  buildCommercialContinuityLock,
  type CommercialContinuityLock,
} from "./continuity-lock";
import {
  planCommercialMicroDecision,
} from "./micro-decision";

export const COMMERCIAL_CONTINUITY_SCHEMA_VERSION = "commercial-film/continuity-v1" as const;

export type CommercialContinuityBeat = {
  shotIndex: number;
  durationSeconds: number;
  timeRange?: { startSecond: number; endSecond: number };
  stateContract: CommercialEventStateContract;
  cameraState: CommercialEventCameraState;
  actionContinuity: CommercialActionContinuity;
  actionSequenceId: string;
  actionRequiresFreshSetup: boolean;
  takeBoundary: CommercialTakeBoundary | null;
  timeGapSeconds: number;
};

export type CommercialContinuityStatus = "CONTINUOUS" | "BLOCKED";

export type CommercialContinuityPlan = {
  schemaVersion: typeof COMMERCIAL_CONTINUITY_SCHEMA_VERSION;
  status: CommercialContinuityStatus;
  worldModel: CommercialWorldModel;
  worldStateTimeline: CommercialWorldStateTimeline;
  initialState: CommercialWorldStateSnapshot;
  finalState: CommercialWorldStateSnapshot;
  conflicts: CommercialContinuityConflict[];
  takePlan: CommercialTakePlan;
  continuityLock: CommercialContinuityLock;
  failureReasons: string[];
};

export function planCommercialContinuity(input: {
  worldModel: CommercialWorldModel;
  beats: CommercialContinuityBeat[];
}): CommercialContinuityPlan {
  const reduced = reduceCommercialWorldState({
    model: input.worldModel,
    beats: input.beats.map((beat) => ({
      shotIndex: beat.shotIndex,
      stateContract: beat.stateContract,
    })),
  });
  const takePlan = planCommercialTakes({
    model: input.worldModel,
    timeline: reduced.timeline,
    beats: input.beats,
  });
  const continuityLock = buildCommercialContinuityLock({
    model: input.worldModel,
    timeline: reduced.timeline,
    finalState: reduced.finalState,
    beats: input.beats.map((beat) => ({
      shotIndex: beat.shotIndex,
      stateContract: beat.stateContract,
    })),
  });
  const failureReasons = [
    ...reduced.conflicts.map(describeCommercialContinuityConflict),
    ...takePlan.failureReasons,
    ...continuityLock.failureReasons,
  ];
  return {
    schemaVersion: COMMERCIAL_CONTINUITY_SCHEMA_VERSION,
    status: failureReasons.length > 0 ? "BLOCKED" : "CONTINUOUS",
    worldModel: input.worldModel,
    worldStateTimeline: reduced.timeline,
    initialState: reduced.initialState,
    finalState: reduced.finalState,
    conflicts: reduced.conflicts,
    takePlan,
    continuityLock,
    failureReasons,
  };
}

export { planCommercialMicroDecision };
