import type { CommercialFinalExecutionPlan } from "../final-execution/types";

export const COMMERCIAL_FINAL_RENDERER_SCHEMA_VERSION =
  "commercial-film/final-renderers-v1" as const;
export const COMMERCIAL_FINAL_RENDERER_VERSION = "1.0.0" as const;

export type CommercialFinalRenderSignature = {
  takeCount: number;
  beatCount: number;
  revealBeatIndex: number;
  visibilityTimeline: string[];
  resourceIds: string[];
  signatureEventId: string;
  cameraSignature: string;
  finalCharacterState: Record<string, string>;
  endingImage: string;
  filmLine: string | null;
};

export type CommercialFinalDirectorScript = CommercialFinalRenderSignature & {
  schemaVersion: typeof COMMERCIAL_FINAL_RENDERER_SCHEMA_VERSION;
  rendererVersion: typeof COMMERCIAL_FINAL_RENDERER_VERSION;
  status: "GENERATED";
  text: string;
  lineCount: number;
};

export type CommercialFinalSeedancePrompt = CommercialFinalRenderSignature & {
  schemaVersion: typeof COMMERCIAL_FINAL_RENDERER_SCHEMA_VERSION;
  rendererVersion: typeof COMMERCIAL_FINAL_RENDERER_VERSION;
  status: "GENERATED";
  text: string;
  lineCount: number;
  charCount: number;
};

export type CommercialFinalRenderValidationCheck = {
  id:
    | "final_plan_valid"
    | "same_take_count"
    | "same_reveal_beat"
    | "same_visibility_timeline"
    | "same_physical_resources"
    | "same_signature_contract"
    | "same_camera_authority"
    | "same_final_character_state"
    | "same_ending"
    | "no_undeclared_executable_resource"
    | "no_legacy_reveal_authority"
    | "no_post_compiler_authority"
    | "no_generated_logo_or_end_card"
    | "film_line_post_production_only"
    | "no_internal_whitelist_leakage";
  status: "PASS" | "FAIL";
  reason: string;
};

export type CommercialFinalRenderValidation = {
  schemaVersion: typeof COMMERCIAL_FINAL_RENDERER_SCHEMA_VERSION;
  rendererVersion: typeof COMMERCIAL_FINAL_RENDERER_VERSION;
  status: "VALID" | "BLOCKED";
  checks: CommercialFinalRenderValidationCheck[];
  diagnostics: string[];
};

export type CommercialFinalRendererInput = {
  plan: CommercialFinalExecutionPlan;
};
