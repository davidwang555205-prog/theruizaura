export const NARRATIVE_PLANNER_SCHEMA_VERSION = "immersive-narrative/planner-v1" as const;
export const NARRATIVE_PLANNER_VERSION = "1.0.0" as const;

import type { SpatialAnchorId, SpatialEnvelope } from "./spatial/types";

export type NarrativeSeason = "春" | "夏" | "秋" | "冬";
export type NarrativeDuration = 15;

export type NarrativeSceneKind =
  | "approach"
  | "transition"
  | "threshold"
  | "interior"
  | "exterior"
  | "waiting"
  | "counter"
  | "retail"
  | "home"
  | "unknown";

export type NarrativeSceneLibraryItem = {
  id: string;
  label: string;
  kind?: NarrativeSceneKind;
};

export type NarrativePlannerInput = {
  topic: string;
  characterProfile?: string;
  characterSelection?: CharacterSelection;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  duration: NarrativeDuration;
  availableSceneLibrary: NarrativeSceneLibraryItem[];
  variantSeed?: number;
};

export type NarrativeMomentPurpose =
  | "establish_state"
  | "approach_trigger"
  | "micro_event"
  | "response"
  | "after_state";

// V1.1 closure vocabulary. A completion boundary is the maximum narrative
// progress a Moment may reach; goal state is the resolved outcome of the goal.
export type NarrativeCompletionBoundary =
  | "WALK_CONTINUES"
  | "SEARCH_STARTED"
  | "SEARCH_CONTINUES"
  | "REACH_STARTED"
  | "OBJECT_HANDLING"
  | "ITEM_RETRIEVED"
  | "DOOR_HANDLED"
  | "ENTERED"
  | "SETTLED"
  | "STATE_HELD";

export type NarrativeGoalState = "NOT_STARTED" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";

export type NarrativeMoment = {
  id: string;
  index: number;
  purpose: NarrativeMomentPurpose;
  purposeLabel: string;
  sceneId: string;
  sceneLabel: string;
  whatHappens: string;
  causalLink: string | null;
  startState: string;
  endState: string;
  goalProgress: number;
  completionBoundary: NarrativeCompletionBoundary;
  spatialAnchor: SpatialAnchorId;
};

export type NarrativeQcGateId =
  | "one_story"
  | "one_event"
  | "causality"
  | "physical_reality"
  | "no_performance"
  | "state_visibility"
  | "location_logic"
  | "natural_ending"
  | "spatial_continuity"
  | "state_progression"
  | "micro_event_consequence"
  | "no_semantic_loop"
  | "goal_completion"
  | "resolved_ending";

export type NarrativeQcGate = {
  id: NarrativeQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type NarrativeQc = Record<NarrativeQcGateId, NarrativeQcGate>;

export type NarrativePlanStatus = "APPROVED_FOR_SCENE_RESOLUTION" | "BLOCKED";

export type NarrativePlan = {
  schemaVersion: typeof NARRATIVE_PLANNER_SCHEMA_VERSION;
  plannerVersion: typeof NARRATIVE_PLANNER_VERSION;
  topicId: string;
  archetypeId: string;
  characterSelection: CharacterSelection;
  resolvedCharacterContext: string;
  status: NarrativePlanStatus;
  durationSeconds: NarrativeDuration;
  momentCount: number;
  storyIntent: string;
  localGoal: string;
  goalState: NarrativeGoalState;
  spatialEnvelope: SpatialEnvelope;
  variantSeed: number;
  initialCharacterState: string;
  microEvent: string;
  emotionalArc: string[];
  moments: NarrativeMoment[];
  qc: NarrativeQc;
  compiledText: string;
};

export type NarrativePlannerErrorCode =
  | "INVALID_DURATION"
  | "MISSING_TOPIC"
  | "MISSING_CHARACTER_PROFILE"
  | "MISSING_LIFESTYLE_FEELING"
  | "EMPTY_SCENE_LIBRARY"
  | "UNSUPPORTED_TOPIC"
  | "UNSUPPORTED_CHARACTER_PROFILE"
  | "CHARACTER_PROFILE_FAILED"
  | "INVALID_ARCHETYPE_OUTPUT";

export class NarrativePlannerError extends Error {
  readonly code: NarrativePlannerErrorCode;
  readonly diagnostics: string[];

  constructor(code: NarrativePlannerErrorCode, message: string, diagnostics: string[] = []) {
    super(message);
    this.name = "NarrativePlannerError";
    this.code = code;
    this.diagnostics = diagnostics;
  }
}
import type { CharacterSelection } from "./character-profile/types";
