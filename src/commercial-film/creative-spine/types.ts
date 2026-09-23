import type {
  CharacterSelection,
  ResolvedCharacterProfile,
} from "../../immersive-narrative/character-profile";
import type { NarrativeSeason } from "../../immersive-narrative/types";
import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import type {
  CommercialCameraRhythm,
  CommercialIntentId,
  CommercialProductMessage,
  CommercialReferenceInput,
  CommercialShotRole,
} from "../types";

export const COMMERCIAL_CREATIVE_SPINE_SCHEMA_VERSION =
  "commercial-film/creative-spine-v1.1" as const;
export const COMMERCIAL_CREATIVE_SPINE_VERSION = "1.1.0" as const;

export type CommercialHumanSituationId =
  | "LEAVING_HOME"
  | "ARRIVING_SOMEWHERE"
  | "MOVING_BETWEEN_PLACES"
  | "PREPARING_FOR_DAY"
  | "TAKING_A_SHORT_PAUSE"
  | "RETURNING_HOME"
  | "WAITING"
  | "MEETING_SOMEONE"
  | "WALKING_WITHOUT_URGENCY"
  | "TRANSITIONING_WORK_TO_PERSONAL";

export type CommercialAudienceDesireId =
  | "EFFORTLESSNESS"
  | "CONFIDENCE"
  | "COMFORT"
  | "VERSATILITY"
  | "QUIET_REFINEMENT"
  | "EVERYDAY_EASE"
  | "SELF_POSSESSION"
  | "LIGHTNESS"
  | "BELONGING"
  | "UNFORCED_STYLE";

export type CommercialRevealStrategy = "IMMEDIATE" | "PROGRESSIVE" | "DELAYED";

export type CommercialProductPresenceDesign =
  | "CLEAR"
  | "SECONDARY"
  | "PARTIAL"
  | "IMPLIED"
  | "ABSENT";

export type CommercialDramaticFunction =
  | "ESTABLISH"
  | "INVITE"
  | "DISCOVER"
  | "CONFIRM"
  | "RESOLVE";

export type CommercialCreativeCase =
  | "PRODUCT_FORWARD"
  | "PROGRESSIVE_DISCOVERY"
  | "HUMAN_FIRST";

export type CommercialHumanSituation = {
  id: CommercialHumanSituationId;
  label: string;
  description: string;
  situationLine: string;
  resourceHints: {
    sceneWorldId: string;
    actionFamilies: string[];
  };
};

export type CommercialAudienceDesire = {
  id: CommercialAudienceDesireId;
  label: string;
  description: string;
  viewerOutcomeLine: string;
};

export type CommercialCreativePremise = {
  id: string;
  text: string;
  situationId: CommercialHumanSituationId;
  desireId: CommercialAudienceDesireId;
  sourceFacts: string[];
};

export type CommercialProductMeaning = {
  meaning: string;
  roleLine: string;
  externalReferenceRequired: boolean;
  supportingCoverage: ProductCoverage[];
  factBasis: string[];
  unsupportedClaimGuard: string;
};

export type CommercialContinuityReasoning = {
  locationRelationship: string;
  timeRelationship: string;
  characterState: string;
  wardrobe: string;
  actionProgression: string;
  spatialLogic: string;
  emotionalTemperature: string;
  productPresenceProgression: string;
};

export type CommercialShotStorySpine = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  dramaticFunction: CommercialDramaticFunction;
  narrativePurpose: string;
  audienceKnowledgeBefore: string;
  audienceKnowledgeAfter: string;
  productPresenceDesign: CommercialProductPresenceDesign;
  productNarrativeRole: string;
  continuityFromPrevious: string;
  continuityToNext: string;
  continuity: CommercialContinuityReasoning;
};

export type CommercialStoryQcGateId =
  | "commercial_premise_missing"
  | "shot_function_duplication"
  | "story_continuity_broken"
  | "arbitrary_product_insert"
  | "hero_context_disconnected"
  | "release_not_resolved"
  | "product_meaning_unsupported"
  | "human_situation_inconsistent"
  | "premise_not_reflected"
  | "product_readability_protected";

export type CommercialStoryQcGate = {
  id: CommercialStoryQcGateId;
  code:
    | "COMMERCIAL_PREMISE_MISSING"
    | "SHOT_FUNCTION_DUPLICATION"
    | "STORY_CONTINUITY_BROKEN"
    | "ARBITRARY_PRODUCT_INSERT"
    | "HERO_CONTEXT_DISCONNECTED"
    | "RELEASE_NOT_RESOLVED"
    | "PRODUCT_MEANING_UNSUPPORTED"
    | "HUMAN_SITUATION_INCONSISTENT"
    | "PREMISE_NOT_REFLECTED"
    | "PRODUCT_READABILITY_UNPROTECTED";
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialStoryQc = Record<CommercialStoryQcGateId, CommercialStoryQcGate>;

export type CommercialCreativeSpinePlan = {
  schemaVersion: typeof COMMERCIAL_CREATIVE_SPINE_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_CREATIVE_SPINE_VERSION;
  creativeCase: CommercialCreativeCase | null;
  premise: CommercialCreativePremise;
  humanSituation: CommercialHumanSituation;
  audienceDesire: CommercialAudienceDesire;
  productMeaning: CommercialProductMeaning;
  revealStrategy: CommercialRevealStrategy;
  arc: string[];
  shotFunctions: CommercialShotStorySpine[];
  continuity: CommercialContinuityReasoning;
  productPresenceByShot: CommercialProductPresenceDesign[];
  qc: CommercialStoryQc;
  failureReasons?: string[];
};

export type CommercialCreativeSpinePlannerInput = {
  commercialIntent: CommercialIntentId;
  commercialIntentLabel: string;
  productMessage: CommercialProductMessage;
  reference: CommercialReferenceInput;
  character: {
    selection: CharacterSelection;
    resolved: ResolvedCharacterProfile;
  };
  season: NarrativeSeason;
  lifestyleFeeling: string;
  sceneWorld: {
    id: string;
    label: string;
  };
  cameraRhythm: CommercialCameraRhythm;
  shotRoles: CommercialShotRole[];
  creativeCase?: CommercialCreativeCase;
};
