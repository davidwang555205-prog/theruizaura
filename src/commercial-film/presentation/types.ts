import type {
  CommercialShotRole,
  CommercialFilmPlan,
} from "../types";

export const COMMERCIAL_FINAL_SCRIPT_PRESENTATION_SCHEMA_VERSION =
  "commercial-film/final-script-presentation-v1.3" as const;

export type CommercialPresentationShot = {
  shotIndex: number;
  shotRole: CommercialShotRole;
  roleLabel: string;
  timeRange: {
    startSecond: number;
    endSecond: number;
    durationSeconds: number;
  };
  visual: string;
  camera: string;
  product: string;
  sound: string;
  transition: string;
  sourceEvent: string;
};

export type CommercialPresentationGlobal = {
  visualLook: string[];
  soundPolicy: string;
  productProtection: string[];
  negatives: string[];
};

export type CommercialDirectorScript = {
  title: string;
  creativeIdea: string;
  durationSeconds: number;
  format: string;
  tone: string;
  directorConcept: string;
  cinematicDevice: string;
  filmStructure: string[];
  shots: CommercialPresentationShot[];
  ending: string;
  global: CommercialPresentationGlobal;
};

export type CommercialFinalScriptPresentation = {
  canonicalCompiledText: string;
  presentationScript: string;
  directorScript: CommercialDirectorScript;
};

export type CommercialCanonicalPresentationInput = {
  plan: CommercialFilmPlan;
  canonicalCompiledText: string;
};
