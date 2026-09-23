import type { NarrativeDuration, NarrativeSeason } from "../types";
import type { NarrativeTopicId } from "../topic-catalog";

export const IMMERSIVE_SEEDANCE_COMPILER_SCHEMA_VERSION = "immersive-narrative/seedance-compiler-v1" as const;
export const IMMERSIVE_SEEDANCE_COMPILER_VERSION = "1.0.0" as const;

// The final external artifact of THERUIZ AURA. It is a copyable Seedance
// script: this system never calls a Provider API and never needs credentials.
export const IMMERSIVE_SCRIPT_SECTIONS = [
  "GLOBAL INTENT",
  "CHARACTER",
  "VISUAL WORLD",
  "STORY ARC",
  "MOMENT",
  "SCENE",
  "PHYSICAL ACTION",
  "CAMERA",
  "SOUND",
  "PRODUCT PRESENCE",
  "CONTINUITY",
  "PRODUCT / REFERENCE PROTECTION",
  "NEGATIVE / DO-NOT",
  "FINAL ENDING STATE",
] as const;

export type ImmersiveScriptSectionId = (typeof IMMERSIVE_SCRIPT_SECTIONS)[number];

export type ImmersiveScriptMomentBlock = {
  momentIndex: number;
  momentPurpose: string;
  whatHappens: string;
  sceneId: string;
  sceneName: string;
  physicalActionStatus: "MATCHED" | "CORRECT_UNSUPPORTED";
  physicalActionId: string | null;
  cameraRole: string;
  cameraExecutionStatus: "EXECUTABLE" | "CORRECT_UNSUPPORTED";
  section: string;
};

export type ImmersiveSeedanceScriptDiagnostics = {
  momentBlocks: ImmersiveScriptMomentBlock[];
  unsupportedMomentIndexes: number[];
  correctUnsupportedCount: number;
  consumedSections: ImmersiveScriptSectionId[];
  providerDependency: "NONE";
  providerApiAssumptions: 0;
  downstreamInventions: 0;
  copyableComplete: true;
  characterCount: number;
};

export type ImmersiveSeedanceScript = {
  schemaVersion: typeof IMMERSIVE_SEEDANCE_COMPILER_SCHEMA_VERSION;
  compilerVersion: typeof IMMERSIVE_SEEDANCE_COMPILER_VERSION;
  topicId: NarrativeTopicId;
  topicLabel: string;
  durationSeconds: NarrativeDuration;
  season: NarrativeSeason;
  lifestyleFeeling: string;
  compiledText: string;
  diagnostics: ImmersiveSeedanceScriptDiagnostics;
};

export type ImmersiveSeedanceScriptCheck = {
  id: string;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type ImmersiveSeedanceScriptValidation = {
  checks: ImmersiveSeedanceScriptCheck[];
  status: "IMMERSIVE_SEEDANCE_SCRIPT_VALIDATED" | "IMMERSIVE_SEEDANCE_SCRIPT_FAILED";
  failureReasons: string[];
};
