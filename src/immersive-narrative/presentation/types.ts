import type { NarrativeCompletionBoundary, NarrativeGoalState, NarrativeMomentPurpose } from "../types";
import type { CameraTransitionKind } from "../camera-execution";
import type { ModelFacingCameraState, ModelFacingExecutionScript, ModelFacingProductVisibility } from "../execution-compiler";
import type { CameraExecutionPlan } from "../camera-execution";
import type { NarrativePlan } from "../types";
import type { SceneResolverOutput } from "../scene-resolver";
import type { ResolvedCharacterProfile } from "../character-profile";

export const IMMERSIVE_DIRECTOR_SCRIPT_SCHEMA_VERSION = "immersive-narrative/director-script-v1.2" as const;

export type ImmersiveTakeRole =
  | "OPENING_OBSERVATION"
  | "CONTINUOUS_MOMENT"
  | "MOTIVATED_REFRAME"
  | "HELD_ENDING";

export type ImmersivePresentationMoment = {
  takeIndex: number;
  momentIndex: number;
  purpose: NarrativeMomentPurpose;
  purposeLabel: string;
  timeRange: { startSecond: number; endSecond: number; durationSeconds: number };
  whatHappens: string;
  body: string;
  camera: string;
  sound: string[];
  productVisibility: ModelFacingProductVisibility;
  productLine: string | null;
  continuity: CameraTransitionKind;
  boundary: NarrativeCompletionBoundary;
  boundaryNote: string;
};

export type ImmersivePresentationTake = {
  takeIndex: number;
  takeRole: ImmersiveTakeRole;
  cameraMovement: ModelFacingCameraState["movementState"];
  framingState: string;
  motivation: string | null;
  moments: ImmersivePresentationMoment[];
};

export type ImmersivePresentationGlobal = {
  spatialRoute: string;
  visualLook: string[];
  soundPolicy: string;
  productProtection: string[];
  negatives: string[];
};

export type ImmersiveDirectorScript = {
  schemaVersion: typeof IMMERSIVE_DIRECTOR_SCRIPT_SCHEMA_VERSION;
  title: string;
  format: string;
  durationSeconds: number;
  tone: string;
  creativeIdea: string;
  directorConcept: string;
  cinematicDevice: string;
  filmStructure: string[];
  character: string[];
  takes: ImmersivePresentationTake[];
  ending: string;
  goalState: NarrativeGoalState;
  global: ImmersivePresentationGlobal;
  executionPointer: string;
};

export type ImmersiveFinalScriptPresentation = {
  directorScript: ImmersiveDirectorScript;
  presentationScript: string;
  executionScriptText: string;
};

export type ImmersivePresentationCheck = {
  id: string;
  label: string;
  status: "PASS" | "FAIL";
  reason: string;
};

export type ImmersivePresentationValidation = {
  checks: ImmersivePresentationCheck[];
  status: "DIRECTOR_SCRIPT_VALIDATED" | "DIRECTOR_SCRIPT_FAILED";
  failureReasons: string[];
};

export type ImmersivePresentationInput = {
  topicLabel: string;
  character: ResolvedCharacterProfile;
  plan: NarrativePlan;
  sceneResolution: SceneResolverOutput;
  cameraExecution: CameraExecutionPlan;
  modelFacingScript: ModelFacingExecutionScript;
};
