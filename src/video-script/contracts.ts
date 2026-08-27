import type { TeamPromptParams } from "../types";
import type { ProductCoverage } from "../visual-system/taskReferenceBinding";

export type VideoDuration = 10 | 15;

export type VideoScriptInput = {
  params: TeamPromptParams;
  duration: VideoDuration;
  selectedOutfitLine?: string;
};

export type VideoSceneSpec = {
  brandId: "theruiz_aura";
  contentIntent: TeamPromptParams["imageType"];
  scene: TeamPromptParams["scenePreference"];
  season: TeamPromptParams["season"];
  personPresent: boolean;
  personProfile?: string;
  wardrobe?: string;
  extraRequirement?: string;
};

export type ProductProtectionSpec = {
  source: "current_task_uploaded_images";
  coverage: ProductCoverage[];
  lines: string[];
};

export type VideoReferenceMapping = {
  source: "current_task_uploaded_images";
  referenceSetId?: string;
  orderedAssetIds: string[];
  coverage: ProductCoverage[];
  ready: boolean;
  diagnostics: string[];
};

export type FilmShot = {
  id: string;
  start: number;
  end: number;
  role: "establish" | "action" | "product_evidence" | "resolve";
  motionId: string;
  cameraId: string;
  direction: string;
  productRule: string;
};

export type FilmSpec = {
  version: "theruiz-film-v1";
  duration: VideoDuration;
  rhythm: string;
  shots: FilmShot[];
};

export type VideoScriptResult = {
  prompt: string;
  sceneSpec: VideoSceneSpec;
  filmSpec: FilmSpec;
  productProtection: ProductProtectionSpec;
  referenceMapping: VideoReferenceMapping;
  diagnostics: string[];
  metadata: {
    target: "seedance-2.5-manual-copy";
    apiExecution: false;
    providerRuntime: false;
  };
};
