import type {
  NarrativeMoment,
  NarrativePlan,
  NarrativePlanStatus,
} from "../types";
import type { SpatialAnchorId, SpatialEnvelope, SpatialSequenceValidation, SpatialTransitionClass } from "../spatial/types";

export type SceneResolverContinuityRole =
  | "ENTRY"
  | "TRANSITION"
  | "EVENT"
  | "RESPONSE"
  | "EXIT";

export type SceneResolverQcGateId =
  | "all_moments_resolved"
  | "location_continuity"
  | "narrative_preserved"
  | "no_scene_invention"
  | "scene_sequence_spatially_continuous"
  | "no_origin_execution_confusion"
  | "no_unannounced_location_jump";

export type SceneResolverQcGate = {
  id: SceneResolverQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type SceneResolverQc = Record<SceneResolverQcGateId, SceneResolverQcGate>;

export type SceneResolverStatus =
  | "SCENE_RESOLUTION_APPROVED"
  | "SCENE_RESOLUTION_FAILED";

export type SceneResolverFailureCode =
  | "NARRATIVE_NOT_APPROVED"
  | "INVALID_DURATION"
  | "INVALID_MOMENT_COUNT"
  | "UNSUPPORTED_TOPIC"
  | "NO_COMPATIBLE_SCENE"
  | "LOCATION_WORLD_MISMATCH"
  | "NARRATIVE_MUTATION_REQUIRED"
  | "SCENE_ID_NOT_FOUND"
  | "NARRATIVE_NOT_PRESERVED";

export type SceneResolverSceneEntry = {
  id: string;
  sceneName: string;
  family?: string;
  contentCategory?: string;
  supportedSeasons?: string[];
  source: "lifestyle_soft_seeding_scene_pool";
};

export type SceneResolverLocationWorld = {
  id: string;
  label: string;
  sceneIds: string[];
};

export type SceneResolverRule = {
  id: string;
  topics: string[];
  locationWorldId: string;
  sceneAssignments: Partial<Record<NarrativeMoment["purpose"], string>>;
  forbiddenMomentTokens: string[];
  failureReason?: string;
};

export type SceneResolverOptions = {
  sceneLibrary?: SceneResolverSceneEntry[];
  locationWorlds?: SceneResolverLocationWorld[];
  rules?: SceneResolverRule[];
};

export type SceneResolverInput = {
  narrativeStatus: NarrativePlanStatus;
  topic: string;
  duration: number;
  storyIntent: string;
  initialCharacterState: string;
  microEvent: string;
  emotionalArc: unknown[];
  moments: NarrativeMoment[];
  spatialEnvelope: SpatialEnvelope;
};

export type ResolvedMoment = {
  momentIndex: number;
  originalMomentId: string;
  originalPurpose: string;
  originalPurposeId: NarrativeMoment["purpose"];
  originalWhatHappens: string;
  sceneId: string;
  sceneName: string;
  locationWorldId: string;
  continuityRole: SceneResolverContinuityRole;
  matchReason: string;
  spatialAnchor: SpatialAnchorId;
  transitionFromPrevious: SpatialTransitionClass | null;
  spatialContinuityStatus: "PASS" | "FAIL";
};

export type UnresolvedMoment = {
  momentIndex: number;
  momentId: string;
  purpose: NarrativeMoment["purpose"];
  reason: string;
};

export type SceneResolverOutput = {
  narrativeStatus: NarrativePlanStatus;
  locationWorld: {
    id: string;
    label: string;
  } | null;
  resolvedMoments: ResolvedMoment[];
  unresolvedMoments: UnresolvedMoment[];
  qc: SceneResolverQc;
  status: SceneResolverStatus;
  failureReasons?: string[];
};

export type SceneResolverResult = {
  output: SceneResolverOutput;
  sourcePlan: NarrativePlan;
};
