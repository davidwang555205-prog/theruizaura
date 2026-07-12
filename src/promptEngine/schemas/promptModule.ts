export type PromptModuleType =
  | "brand"
  | "audience"
  | "task"
  | "platform"
  | "imageType"
  | "productIdentity"
  | "productVariant"
  | "productFidelity"
  | "model"
  | "scene"
  | "lighting"
  | "styling"
  | "action"
  | "gaze"
  | "composition"
  | "accessory"
  | "continuity"
  | "realism"
  | "negative"
  | "systemProtection";

export type PromptModulePriority =
  | "system"
  | "product"
  | "customerProhibition"
  | "platform"
  | "brand"
  | "customerPreference"
  | "default"
  | "variation";

export type PromptModuleStatus = "draft" | "testing" | "stable" | "deprecated";

export type PromptModuleApplicability = {
  industries?: string[];
  productCategories?: string[];
  productTypes?: string[];
  imageTypes?: string[];
  platforms?: string[];
  scenes?: string[];
  sceneFamilies?: string[];
  seasons?: string[];
  ageRanges?: string[];
  brandTraits?: string[];
  commercialIntensities?: string[];
};

export type PromptModuleSource = {
  sourceFile: string;
  sourceKey?: string;
  notes?: string;
};

/**
 * A prompt module may either own prompt copy directly or point to an existing
 * resolver in the legacy prompt engine. During migration, prefer source-only
 * records so proven prompt wording is not duplicated or changed accidentally.
 */
export type PromptModule = {
  id: string;
  type: PromptModuleType;
  internalName: string;
  customerLabel?: string;
  description?: string;

  promptLine?: string;
  negativePhrases?: string[];
  tags: string[];

  applicable?: PromptModuleApplicability;
  requires?: string[];
  conflicts?: string[];

  priority: PromptModulePriority;
  version: number;
  status: PromptModuleStatus;
  source?: PromptModuleSource;
};

export type PromptModuleSelection = {
  moduleId: string;
  score: number;
  reasons: string[];
  source: "customer" | "brand" | "product" | "platform" | "system" | "default";
};
