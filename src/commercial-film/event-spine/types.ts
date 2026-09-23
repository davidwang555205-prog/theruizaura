import type { CommercialIntentId, CommercialShotRole } from "../types";
import type { CommercialCreativeSpinePlan } from "../creative-spine/types";

export const COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION = "commercial-film/event-spine-v1.2.1" as const;
export const COMMERCIAL_EVENT_SPINE_VERSION = "1.2.1" as const;

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
