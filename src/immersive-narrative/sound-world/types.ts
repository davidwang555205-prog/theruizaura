import type { NarrativePlanStatus } from "../types";
import type { ResolvedMoment, SceneResolverStatus } from "../scene-resolver";
import type { ProductPresenceMoment, ProductPresenceStatus } from "../product-presence";

export type SoundCategory =
  | "ENVIRONMENT"
  | "HUMAN"
  | "OBJECT"
  | "FOOTWEAR"
  | "SILENCE";

export type SilenceLevel = "NONE" | "LIGHT" | "PRONOUNCED";

export type SoundMoment = {
  momentIndex: number;
  sceneId: string;
  sceneName: string;
  originalWhatHappens: string;
  environment: string[];
  human: string[];
  object: string[];
  footwear: string[];
  silenceLevel: SilenceLevel;
  dominantSound: SoundCategory;
  reason: string;
};

export type SoundWorldQcGateId =
  | "narrative_preserved"
  | "scene_physically_consistent"
  | "no_invented_event"
  | "no_overdesign";

export type SoundWorldQcGate = {
  id: SoundWorldQcGateId;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type SoundWorldQc = Record<SoundWorldQcGateId, SoundWorldQcGate>;

export type SoundWorldStatus =
  | "SOUND_WORLD_APPROVED"
  | "SOUND_WORLD_FAILED";

export type SoundWorldInput = {
  narrativeStatus: NarrativePlanStatus;
  sceneResolutionStatus: SceneResolverStatus;
  productPresenceStatus: ProductPresenceStatus;
  topic: string;
  duration: number;
  storyIntent: string;
  initialCharacterState: string;
  microEvent: string;
  locationWorld: {
    id: string;
    label: string;
  } | null;
  resolvedMoments: ResolvedMoment[];
  productPresenceCurve: ProductPresenceMoment[];
};

export type SoundWorldCuePalette = Partial<Record<
  Exclude<SoundCategory, "SILENCE">,
  string[]
>>;

export type SoundWorldRule = {
  topic: string;
  label: string;
  dominantBaseline: SoundCategory[];
  description: string;
  cuePalette?: SoundWorldCuePalette;
};

export type SoundWorldOptions = {
  rules?: SoundWorldRule[];
  sceneMaterialOverrides?: Record<string, string[]>;
};

export type SoundWorldOutput = {
  productPresenceStatus: ProductPresenceStatus;
  topic: string;
  duration: number;
  moments: SoundMoment[];
  global: {
    musicPolicy: "NONE";
    dialoguePolicy: "NONE";
    soundStyle: "NATURALISTIC";
  };
  qc: SoundWorldQc;
  status: SoundWorldStatus;
  failureReasons?: string[];
};
