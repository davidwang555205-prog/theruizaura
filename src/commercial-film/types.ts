import type {
  CharacterSelection,
  ResolvedCharacterProfile,
} from "../immersive-narrative/character-profile";
import type { SoundCategory } from "../immersive-narrative/sound-world";
import type { NarrativeSeason } from "../immersive-narrative/types";
import type {
  ProductCoverage,
  TaskProductTruth,
} from "../visual-system/taskReferenceBinding";
import type {
  CommercialCreativeSpinePlan,
  CommercialCreativeCase,
  CommercialProductPresenceDesign,
  CommercialShotStorySpine,
} from "./creative-spine/types";
import type {
  CommercialCreativeDirectionPlan,
  CommercialCreativeMode,
  CommercialEditLogic,
  CommercialShotDirection,
  CommercialVisualMotif,
} from "./creative-direction/types";
import type {
  CommercialEndingGrammar,
  CommercialEventShot,
  CommercialEventSpinePlan,
  CommercialWorldLifeDensity,
} from "./event-spine/types";
import type {
  CommercialDirectorConceptPlan,
} from "./director-concept/types";

export const COMMERCIAL_FILM_SCHEMA_VERSION = "commercial-film/planner-v1" as const;
export const COMMERCIAL_FILM_VERSION = "1.0.0" as const;
export const COMMERCIAL_EXECUTION_SCHEMA_VERSION = "commercial-film/execution-compiler-v1" as const;
export const COMMERCIAL_EXECUTION_VERSION = "1.0.0" as const;

export type CommercialIntentId =
  | "URBAN_MOTION"
  | "DAILY_STYLING"
  | "QUIET_LUXURY"
  | "PRODUCT_CRAFT"
  | "NEW_ARRIVAL";

export type CommercialDuration = 15;

export type CommercialShotRole =
  | "WORLD"
  | "WEAR"
  | "DETAIL"
  | "HERO"
  | "RELEASE";

export type CommercialProductVisibility =
  | "CONTEXT"
  | "PRODUCT_READABLE"
  | "PRODUCT_DETAIL"
  | "PRODUCT_HERO"
  | "BRAND_RELEASE";

export type CommercialCameraRhythm = "CALM" | "BALANCED" | "PRODUCT_FORWARD";

export type CommercialReferenceStatus = "REFERENCE_READY";

export type CommercialFilmStatus =
  | "APPROVED_FOR_COMMERCIAL_EXECUTION"
  | "BLOCKED";

export type CommercialReferenceInput = {
  referenceSetId: string;
  taskId: string;
  sourceType: "current_task_reference_set";
  confirmationStatus: "confirmed" | "incomplete";
  confirmedReferenceCount: number;
  confirmedAssetIds: string[];
  coverage: ProductCoverage[];
  missingCoverage: ProductCoverage[];
  referencePlanReady: boolean;
  productTruthMode: "reference_bound";
  productTruth: TaskProductTruth | null;
};

export type CommercialReferenceState = CommercialReferenceInput & {
  status: CommercialReferenceStatus;
  instruction: string;
};

export type CommercialProductMessageDimension = {
  coverage: ProductCoverage;
  label: string;
  message: string;
  detailMessage: string;
};

export type CommercialProductMessage = {
  source: Array<
    | "current_task_product_truth"
    | "confirmed_reference_set"
    | "external_seedance_reference"
    | "confirmed_brand_selling_points"
  >;
  status: "READY";
  externalReferenceRequired: boolean;
  headline: string;
  supportedDimensions: CommercialProductMessageDimension[];
  confirmedBrandSellingPoints: string[];
  evidenceLines: string[];
  prohibitedClaims: string[];
  noFabricationLine: string;
};

export type CommercialBrandMood = {
  id: "THERUIZ_AURA_QUIET_WARM_LUXURY";
  attributes: Array<"quiet" | "warm" | "restrained" | "premium" | "natural" | "material-aware">;
  expression: string;
  prohibitedDirections: string[];
};

export type CommercialSceneWorld = {
  id: string;
  label: string;
  sceneIds: string[];
  sceneNames: string[];
  spatialAnchors: string[];
  source: "shared_lifestyle_scene_library";
};

export type CommercialActionSource = "EXISTING_318" | "COMMERCIAL_ONLY";

export type CommercialActionPlanItem = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  primitiveId: string;
  source: CommercialActionSource;
  sourceActionId: string | null;
  sourceActionFamily: string | null;
  movementPhase: string;
  physicalActionLine: string;
  physicalConstraints: string[];
  prohibitedBehaviors: string[];
};

export type CommercialCameraShot = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  framing: string;
  cameraHeight: "natural_eye_level" | "natural_chest_height" | "natural_shoulder_height";
  viewAngle: "three_quarter_front" | "three_quarter_back" | "profile_parallel";
  movement:
    | "locked_observation"
    | "restrained_follow"
    | "short_lateral_track"
    | "motivated_pan"
    | "controlled_detail_framing"
    | "product_readable_lower_framing"
    | "brief_hero_hold";
  movementLine: string;
  productReadabilityGuard: string;
  transitionLine: string;
};

export type CommercialCameraPlan = {
  rhythm: CommercialCameraRhythm;
  continuity: {
    cameraSide: "established_scene_side";
    oneLensFamily: true;
    focalRange: string;
    spatialAxisRule: string;
  };
  cameraLookLine: string;
  negativeLine: string;
  shots: CommercialCameraShot[];
  restrictions: string[];
};

export type CommercialSoundShot = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  categories: Array<Exclude<SoundCategory, "SILENCE">>;
  cues: string[];
  silenceLevel: "NONE" | "LIGHT" | "PRONOUNCED";
  dominantSound: SoundCategory;
};

export type CommercialSoundPlan = {
  context: string;
  policy: {
    style: "NATURALISTIC";
    music: "NONE";
    voiceover: "NONE";
    dialogue: "NONE";
  };
  shots: CommercialSoundShot[];
};

export type CommercialShotPlan = {
  shotIndex: number;
  role: CommercialShotRole;
  timeRange: {
    startSecond: number;
    endSecond: number;
    durationSeconds: number;
  };
  semanticPurpose: string;
  productVisibility: CommercialProductVisibility;
  storySpine: CommercialShotStorySpine;
  direction: CommercialShotDirection;
  event: CommercialEventShot;
  productMessageDimension: ProductCoverage | null;
  action: CommercialActionPlanItem;
  camera: CommercialCameraShot;
  sound: CommercialSoundShot;
  spatialAnchor: string;
  continuityLine: string;
};

export type CommercialProductVisibilityPlan = {
  levels: CommercialProductVisibility[];
  presenceByShot: CommercialProductPresenceDesign[];
  revealStrategy: CommercialCreativeSpinePlan["revealStrategy"];
  readableShotIndexes: number[];
  detailShotIndex: number;
  heroShotIndex: number;
  releaseShotIndex: number;
};

export type CommercialEndingStrategy = {
  strategy: "CONTINUE_INTO_LIFE";
  grammar: CommercialEndingGrammar;
  line: string;
  prohibitedEndings: string[];
};

export type CommercialQcGateId =
  | "product_message_preserved"
  | "brand_mood_preserved"
  | "product_readability"
  | "hero_moment_exists"
  | "detail_supported_by_reference"
  | "no_product_deformation"
  | "no_product_identity_drift"
  | "no_random_scene_jump"
  | "no_random_character_reset"
  | "physical_reality"
  | "camera_continuity"
  | "no_runway_pose"
  | "no_shoe_modeling_pose"
  | "no_commercial_cliche_overload"
  | "natural_ending"
  | "full_15_second_timing"
  | "execution_specificity"
  | "sound_world_context"
  | "world_realism";

export type CommercialQcGate = {
  id: CommercialQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialQc = Record<CommercialQcGateId, CommercialQcGate>;

export type CommercialFilmPlan = {
  schemaVersion: typeof COMMERCIAL_FILM_SCHEMA_VERSION;
  plannerVersion: typeof COMMERCIAL_FILM_VERSION;
  status: CommercialFilmStatus;
  commercialIntent: CommercialIntentId;
  commercialIntentLabel: string;
  productMessage: CommercialProductMessage;
  creativeSpine: CommercialCreativeSpinePlan;
  creativeDirection: CommercialCreativeDirectionPlan;
  eventSpine: CommercialEventSpinePlan;
  directorConcept: CommercialDirectorConceptPlan;
  brandMood: CommercialBrandMood;
  character: {
    selection: CharacterSelection;
    resolved: ResolvedCharacterProfile;
  };
  season: NarrativeSeason;
  lifestyleFeeling: string;
  duration: CommercialDuration;
  sceneWorld: CommercialSceneWorld;
  shotArchitecture: {
    totalShots: 5;
    shotRoles: CommercialShotRole[];
    shots: CommercialShotPlan[];
  };
  productVisibilityPlan: CommercialProductVisibilityPlan;
  cameraRhythm: CommercialCameraRhythm;
  cameraPlan: CommercialCameraPlan;
  actionPlan: CommercialActionPlanItem[];
  soundPlan: CommercialSoundPlan;
  worldRealism: {
    density: CommercialWorldLifeDensity;
    line: string;
    backgroundSignals: string[];
    signagePolicy: string;
  };
  endingStrategy: CommercialEndingStrategy;
  referenceState: CommercialReferenceState;
  qc: CommercialQc;
  failureReasons?: string[];
};

export type CommercialFilmPlannerInput = {
  commercialIntent: CommercialIntentId;
  characterSelection: CharacterSelection;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  duration: CommercialDuration;
  reference: CommercialReferenceInput;
  confirmedBrandSellingPoints?: string[];
  creativeCase?: CommercialCreativeCase;
  generationNonce?: number;
  creativeModeOverride?: CommercialCreativeMode;
  primaryEditLogicOverride?: CommercialEditLogic;
  secondaryEditLogicOverride?: CommercialEditLogic | null;
  visualMotifOverride?: CommercialVisualMotif | null;
  directorConceptOverride?: import("./director-concept/types").CommercialDirectorConceptId;
};

export type CommercialFilmPlannerErrorCode =
  | "INVALID_DURATION"
  | "UNSUPPORTED_COMMERCIAL_INTENT"
  | "MISSING_LIFESTYLE_FEELING"
  | "INVALID_SCENE_WORLD"
  | "CHARACTER_PROFILE_FAILED"
  | "INVALID_SHOT_ARCHITECTURE"
  | "COMMERCIAL_QC_FAILED";

export class CommercialFilmPlannerError extends Error {
  readonly code: CommercialFilmPlannerErrorCode;
  readonly diagnostics: string[];

  constructor(code: CommercialFilmPlannerErrorCode, message: string, diagnostics: string[] = []) {
    super(message);
    this.name = "CommercialFilmPlannerError";
    this.code = code;
    this.diagnostics = diagnostics;
  }
}

export type CommercialExecutionScript = {
  schemaVersion: typeof COMMERCIAL_EXECUTION_SCHEMA_VERSION;
  compilerVersion: typeof COMMERCIAL_EXECUTION_VERSION;
  status: "COMMERCIAL_EXECUTION_SCRIPT_GENERATED" | "COMMERCIAL_EXECUTION_SCRIPT_FAILED";
  compiledText: string;
  shotBlocks: Array<{
    shotIndex: number;
    shotRole: CommercialShotRole;
    section: string;
  }>;
  diagnostics: {
    internalScriptLength: number;
    modelFacingLength: number;
    providerDependency: "NONE";
    providerApiAssumptions: 0;
    downstreamInventions: 0;
    internalIdsInFinal: 0;
    qcLanguageInFinal: 0;
    referenceCount: number;
    timelineCoverage: {
      startSecond: number;
      endSecond: number;
      contiguous: boolean;
    };
  };
};

export type CommercialExecutionCheck = {
  id: string;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialExecutionValidation = {
  checks: CommercialExecutionCheck[];
  status: "COMMERCIAL_EXECUTION_VALIDATED" | "COMMERCIAL_EXECUTION_FAILED";
  failureReasons: string[];
};
