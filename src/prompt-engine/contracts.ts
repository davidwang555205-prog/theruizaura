import type { TeamImageType, TeamScenePreference, TeamSeason, TeamModelChoice, TeamGarmentTypePreference } from "../types";
import type { StandardSceneKey } from "../data/outfitDiversityRules";

// ─── Composition Mode ────────────────────────────────────────
export type CompositionMode =
  | "fullFigure"
  | "studioLowerThird"
  | "studioOnFootDetail"
  | "studioThreeQuarter"
  | "mirrorFull"
  | "mirrorThreeQuarter"
  | "mirrorSeated"
  | "onFootLifestyle"
  | "stillLife"
  | "materialDetail"
  | "atmosphere";

// ─── Prompt Priority ─────────────────────────────────────────
export enum PromptPriority {
  P0_USER_SPECIFIED = 0,
  P1_PRODUCT_HARD_LOCK = 1,
  P2_IDENTITY_CONTINUITY = 2,
  P3_COMPOSITION_AND_VISIBILITY = 3,
  P4_SCENE_AND_ACTION = 4,
  P5_REALISM_AND_CAMERA = 5,
  P6_BRAND_AND_AESTHETICS = 6,
  P7_LOW_PRIORITY_NEGATIVE = 7,
}

// ─── Prompt Section ──────────────────────────────────────────
export type PromptSection =
  | "product"
  | "model"
  | "styling"
  | "action"
  | "scene"
  | "camera"
  | "lighting"
  | "negative"
  | "continuity"
  | "brand";

// ─── Rule Source ─────────────────────────────────────────────
export type PromptRuleSource =
  | "user-upload"
  | "user-extra-requirement"
  | "product-profile"
  | "composition-profile"
  | "image-type-profile"
  | "scene-profile"
  | "identity-profile"
  | "styling-profile"
  | "action-profile"
  | "camera-profile"
  | "lighting-profile"
  | "realism-profile"
  | "continuity-profile"
  | "brand-profile"
  | "negative-default"
  | "theme-card";

// ─── Rule Predicate ──────────────────────────────────────────
export type RulePredicate = {
  imageTypes?: TeamImageType[];
  compositionModes?: CompositionMode[];
  sceneKeys?: string[];
  seasons?: TeamSeason[];
  modelChoices?: TeamModelChoice[];
  garmentTypes?: TeamGarmentTypePreference[];
  hasShoe?: boolean;
  isMultiImage?: boolean;
  isContinuation?: boolean;
  hasUserClothing?: boolean;
  hasUserHandheld?: boolean;
  isNonProductAtmosphere?: boolean;
  studioShotIndex?: number;
};

// ─── Prompt Rule ─────────────────────────────────────────────
export type PromptRule = {
  id: string;
  section: PromptSection;
  text: string;
  priority: PromptPriority;
  source: PromptRuleSource;
  appliesWhen: RulePredicate;
  conflictsWith?: string[];
  replaces?: string[];
  required?: boolean;
  estimatedWords?: number;
  tags?: string[];
};

// ─── Prompt Budget Profile ───────────────────────────────────
export type PromptBudgetProfile = {
  totalWords: number;
  sectionCaps: Partial<Record<PromptSection, number>>;
  requiredRuleIds: string[];
  optionalRuleIds: string[];
};

// ─── Resolved Conflict ───────────────────────────────────────
export type ResolvedPromptConflict = {
  id: string;
  keptRuleId: string;
  removedRuleId: string;
  reason: "priority" | "explicit-replace" | "composition-incompatible" | "user-override";
};

// ─── Budget Report ───────────────────────────────────────────
export type PromptBudgetReport = {
  totalWords: number;
  sectionWordCounts: Partial<Record<PromptSection, number>>;
  overflowSections: PromptSection[];
  trimmedRuleIds: string[];
};

// ─── Validation Report ───────────────────────────────────────
export type PromptValidationReport = {
  missingRequiredRules: string[];
  conflictingRules: ResolvedPromptConflict[];
  duplicateNegatives: string[];
  unterminatedSentences: number;
  halfSentences: number;
  brandNameLeaks: string[];
  totalWarnings: number;
  totalErrors: number;
};

// ─── Compiled Section ────────────────────────────────────────
export type CompiledPromptSection = {
  section: PromptSection;
  text: string;
  ruleIds: string[];
  wordCount: number;
};

// ─── Compiled Result ─────────────────────────────────────────
export type CompiledPromptResult = {
  prompt: string;
  sections: CompiledPromptSection[];
  includedRuleIds: string[];
  omittedRuleIds: string[];
  replacedRuleIds: string[];
  conflicts: ResolvedPromptConflict[];
  budgetReport: PromptBudgetReport;
  validationReport: PromptValidationReport;
};

// ─── Prompt Profile ──────────────────────────────────────────
export type PromptProfileInput = {
  imageType: TeamImageType;
  compositionMode: CompositionMode;
  scenePreference: TeamScenePreference;
  sceneKey?: StandardSceneKey;
  season: TeamSeason;
  modelChoice: TeamModelChoice;
  modelContinuity: "新人物" | "延续上一组人物";
  hasShoe: boolean;
  shoeDisplayName?: string;
  garmentTypePreference: TeamGarmentTypePreference;
  selectedOutfitLine?: string;
  userExtraRequirement: string;
  isMultiImage: boolean;
  seriesImageIndex?: number;
  seriesImageCount?: number;
  studioShotIndex?: number;
  hasUserClothing?: boolean;
  hasUserHandheld?: boolean;
  studioLaunchPreset?: string;
  studioWardrobePreference?: string;
  generationNonce: number;
};

// ─── Engine Mode ─────────────────────────────────────────────
export type PromptEngineMode = "legacy" | "new" | "compare";

// ─── Engine Config ───────────────────────────────────────────
export type PromptEngineConfig = {
  mode: PromptEngineMode;
  enableDiagnostics: boolean;
  enableBudgetReport: boolean;
  enableValidationReport: boolean;
};
