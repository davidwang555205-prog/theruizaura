import type { CommercialIntentId, CommercialShotRole } from "../types";
import type { CommercialCreativeSpinePlan } from "../creative-spine/types";
import type {
  CommercialEventStateContract,
  CommercialWorldModel,
} from "./world-state";
import type {
  CommercialActionContinuity,
  CommercialEventCameraState,
  CommercialTakeBoundary,
} from "./takes";

export const COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION = "commercial-film/event-spine-v1.3" as const;
export const COMMERCIAL_EVENT_SPINE_VERSION = "1.3.0" as const;

export type CommercialEndingGrammarId =
  | "CONTINUED_SPATIAL_MOVEMENT"
  | "TRANSITION_INTO_LIVED_USE"
  | "STILLNESS_AND_ROOM_CONTINUES"
  | "COMPLETION_AND_QUIET_DEPARTURE"
  | "ARRIVAL_SETTLES";

export type CommercialEventShot = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  eventKind: string;
  whatHappens: string;
  whyItHappens: string;
  whatChanges: string;
  actionClass: string;
  causalFromPrevious: string;
  framingHint: string;
  perceptualTarget: string;
  durationSeconds: number;
  durationRationale: string;
  productDetailRelationship?: string | null;
  /**
   * Structured execution state added on top of the narrative event fields.
   * The narrative text stays authoritative for the creative idea; these fields
   * only declare what the beat requires, changes, and proves on screen.
   */
  stateContract: CommercialEventStateContract;
  cameraState: CommercialEventCameraState;
  actionContinuity: CommercialActionContinuity;
  actionSequenceId: string;
  actionRequiresFreshSetup: boolean;
  takeBoundary: CommercialTakeBoundary | null;
  timeGapSeconds: number;
};

export type CommercialEndingGrammar = {
  id: CommercialEndingGrammarId;
  label: string;
  line: string;
  resolves: string;
  newGrammarGuard: string;
};

export type CommercialEventSpinePlan = {
  schemaVersion: typeof COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_EVENT_SPINE_VERSION;
  worldModel: CommercialWorldModel;
  intent: CommercialIntentId;
  centralEvent: string;
  eventChain: string[];
  shots: CommercialEventShot[];
  durationPlan: number[];
  endingGrammar: CommercialEndingGrammar;
  worldLifeDensity: CommercialWorldLifeDensity;
  worldLifeSignals: string[];
  worldRealismLine: string;
};

export type CommercialWorldLifeDensity =
  | "LOW_LIVED_IN"
  | "NORMAL_LIVED_IN"
  | "ACTIVE_BACKGROUND";

export type CommercialEventSpinePlannerInput = {
  commercialIntent: CommercialIntentId;
  creativeSpine: CommercialCreativeSpinePlan;
  generationNonce: number;
};
