import type { CommercialDirectorConceptId } from "../director-concept/types";
import {
  COMMERCIAL_VISUAL_ACCEPTANCE_CHARACTER_SELECTION,
  COMMERCIAL_VISUAL_ACCEPTANCE_LIFESTYLE_FEELING,
  COMMERCIAL_VISUAL_ACCEPTANCE_SEASON,
} from "../visual-acceptance/matrix";
import type { CommercialIntentId } from "../types";
import { runCommercialV14Pipeline } from "./pipeline";
import {
  COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
  type CommercialV14AcceptanceCase,
  type CommercialV14AcceptanceMatrix,
} from "./types";

type V14CaseSpec = {
  intent: CommercialIntentId;
  directorConceptId: CommercialDirectorConceptId;
  generationNonce: number;
};

const V14_CASE_SPECS: V14CaseSpec[] = [
  { intent: "QUIET_LUXURY", directorConceptId: "STATIC_CAMERA_FILM", generationNonce: 0 },
  { intent: "QUIET_LUXURY", directorConceptId: "PARTIAL_OBSCURATION", generationNonce: 1 },
  { intent: "QUIET_LUXURY", directorConceptId: "LIGHT_REVEAL", generationNonce: 2 },
  { intent: "URBAN_MOTION", directorConceptId: "WORLD_MOVES_SUBJECT_SETTLES", generationNonce: 0 },
  { intent: "URBAN_MOTION", directorConceptId: "THRESHOLD_CHAIN", generationNonce: 1 },
  { intent: "URBAN_MOTION", directorConceptId: "EDGE_OF_FRAME", generationNonce: 2 },
  { intent: "DAILY_STYLING", directorConceptId: "REPEATED_GESTURE", generationNonce: 0 },
  { intent: "DAILY_STYLING", directorConceptId: "PARTIAL_OBSCURATION", generationNonce: 1 },
  { intent: "PRODUCT_CRAFT", directorConceptId: "LIGHT_REVEAL", generationNonce: 0 },
  { intent: "PRODUCT_CRAFT", directorConceptId: "WORLD_MOVES_SUBJECT_SETTLES", generationNonce: 1 },
  { intent: "NEW_ARRIVAL", directorConceptId: "EDGE_OF_FRAME", generationNonce: 0 },
  { intent: "NEW_ARRIVAL", directorConceptId: "THRESHOLD_CHAIN", generationNonce: 1 },
];

function fingerprint(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function buildV14Case(spec: V14CaseSpec, index: number): CommercialV14AcceptanceCase {
  const caseId = `v14-case-${String(index + 1).padStart(2, "0")}`;
  const outcome = runCommercialV14Pipeline({
    commercialIntent: spec.intent,
    characterSelection: { ...COMMERCIAL_VISUAL_ACCEPTANCE_CHARACTER_SELECTION },
    season: COMMERCIAL_VISUAL_ACCEPTANCE_SEASON,
    lifestyleFeeling: COMMERCIAL_VISUAL_ACCEPTANCE_LIFESTYLE_FEELING,
    duration: 15,
    generationNonce: spec.generationNonce,
    directorConceptOverride: spec.directorConceptId,
    reference: {
      referenceSetId: `v14-acceptance-${caseId}`,
      taskId: "v14-creative-directing-acceptance",
      sourceType: "current_task_reference_set",
      confirmationStatus: "incomplete",
      confirmedReferenceCount: 0,
      confirmedAssetIds: [],
      coverage: [],
      missingCoverage: [
        "silhouette",
        "toe_structure",
        "side_panel_structure",
        "heel_structure",
        "outsole_profile",
        "color_blocking",
        "material_evidence",
      ],
      referencePlanReady: false,
      productTruthMode: "reference_bound",
      productTruth: null,
    },
  });
  if (outcome.status !== "GENERATED") {
    throw new Error(`${caseId} V1.4 generation blocked: ${outcome.diagnostics.join(" | ")}`);
  }
  const treatment = outcome.plan.creativeTreatment;
  return {
    caseId,
    group: index < 3 ? "A" : "B",
    intent: spec.intent,
    directorConceptId: spec.directorConceptId,
    generationNonce: spec.generationNonce,
    title: treatment.title,
    creativeProposition: treatment.creativeProposition.presentationText,
    signatureEvent: treatment.signatureEvent.event,
    deviceArc: treatment.deviceArc.map((beat) => ({ ...beat })),
    structureType: treatment.structureType,
    endingImage: treatment.endingImage,
    productRevealCause: treatment.productRevealLogic.cause,
    shotVisualPriorities: treatment.shotVisualPriorities.map((priority) => ({ ...priority })),
    canonicalCompiledText: outcome.plan.canonicalCompiledText,
    canonicalCompiledTextFingerprint: fingerprint(outcome.plan.canonicalCompiledText),
    v14CompiledText: outcome.plan.v14CompiledText,
    presentationScript: outcome.plan.presentation.presentationScript,
    creativeTreatment: treatment,
  };
}

export function buildCommercialV14AcceptanceMatrix(): CommercialV14AcceptanceMatrix {
  const cases = V14_CASE_SPECS.map(buildV14Case);
  return {
    schemaVersion: COMMERCIAL_CREATIVE_DIRECTING_SCHEMA_VERSION,
    cases,
    classicStructureCases: cases.filter((testCase) => testCase.creativeTreatment.structureType === "CLASSIC_FIVE_ROLE").length,
    nonClassicStructureCases: cases.filter((testCase) => testCase.creativeTreatment.structureType !== "CLASSIC_FIVE_ROLE").length,
    finalVisualStatus: "NOT_VERIFIED",
  };
}
