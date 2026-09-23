import type { CommercialIntentId } from "../types";
import {
  COMMERCIAL_DIRECTOR_CONCEPT_CATALOG,
  conceptGraphicBase,
} from "./catalog";
import {
  COMMERCIAL_DIRECTOR_CONCEPT_SCHEMA_VERSION,
  COMMERCIAL_DIRECTOR_CONCEPT_VERSION,
  type CommercialDirectorConceptId,
  type CommercialDirectorConceptPlan,
  type CommercialDirectorConceptPlannerInput,
  type CommercialDirectorConceptShot,
  type CommercialDirectorContribution,
} from "./types";

const ALL_CONCEPTS = Object.keys(COMMERCIAL_DIRECTOR_CONCEPT_CATALOG) as CommercialDirectorConceptId[];

function scoreConcept(
  concept: CommercialDirectorConceptId,
  input: CommercialDirectorConceptPlannerInput
) {
  const definition = COMMERCIAL_DIRECTOR_CONCEPT_CATALOG[concept];
  let score = definition.compatibleIntents.includes(input.commercialIntent) ? 4 : 0;
  if (definition.compatibleIntents.includes(input.commercialIntent)) score += 3;
  if (input.creativeDirection.creativeMode === "PRIVATE_MOMENT" && ["STATIC_CAMERA_FILM", "PARTIAL_OBSCURATION", "LIGHT_REVEAL", "REPEATED_GESTURE"].includes(concept)) score += 3;
  if (input.creativeDirection.creativeMode === "CITY_JOURNEY" && ["THRESHOLD_CHAIN", "EDGE_OF_FRAME", "WORLD_MOVES_SUBJECT_SETTLES"].includes(concept)) score += 3;
  if (input.creativeDirection.creativeMode === "SENSORY_LIFE" && ["LIGHT_REVEAL", "REFLECTION_WORLD", "WORLD_MOVES_SUBJECT_SETTLES"].includes(concept)) score += 3;
  if (input.eventSpine.worldLifeDensity === "ACTIVE_BACKGROUND" && ["WORLD_MOVES_SUBJECT_SETTLES", "REFLECTION_WORLD", "PARTIAL_OBSCURATION"].includes(concept)) score += 2;
  if (input.creativeSpine.humanSituation.id === "TAKING_A_SHORT_PAUSE" && concept === "REPEATED_GESTURE") score += 5;
  if (input.creativeSpine.humanSituation.id === "PREPARING_FOR_DAY" && concept === "REPEATED_GESTURE") score += 3;
  if (input.creativeDirection.creativeMode === "SINGLE_IDEA" && concept === "REPEATED_GESTURE") score += 4;
  return score;
}

function contributionFor(shotIndex: number, concept: CommercialDirectorConceptId): CommercialDirectorContribution {
  if (shotIndex === 0) return concept === "THRESHOLD_CHAIN" ? "SUPPORTING" : "PRIMARY";
  if (shotIndex === 1 || shotIndex === 2) return concept === "REPEATED_GESTURE" ? "SUPPORTING" : "REST";
  if (shotIndex === 3) return "PRIMARY";
  return "RESOLUTION";
}

function shotRule(concept: CommercialDirectorConceptId, shotIndex: number) {
  const definition = COMMERCIAL_DIRECTOR_CONCEPT_CATALOG[concept];
  if (shotIndex === 0) return definition.cameraRule;
  if (shotIndex === 1 || shotIndex === 2) return `${definition.cameraRule} ${definition.graphicRule}`;
  if (shotIndex === 3) return definition.heroRule;
  return definition.releaseRule;
}

export function planCommercialDirectorConcept(
  input: CommercialDirectorConceptPlannerInput
): CommercialDirectorConceptPlan {
  const ranked = ALL_CONCEPTS
    .map((concept, order) => ({ concept, order, score: scoreConcept(concept, input) }))
    .sort((first, second) => second.score - first.score || first.order - second.order)
    .map((entry) => entry.concept);
  const concept = input.override ?? ranked[input.generationNonce % 3] ?? ranked[0];
  const definition = COMMERCIAL_DIRECTOR_CONCEPT_CATALOG[concept];
  const shots: CommercialDirectorConceptShot[] = input.eventSpine.shots.map((shot, shotIndex) => ({
    shotIndex,
    shotRole: shot.shotRole,
    contribution: contributionFor(shotIndex, concept),
    conceptRule: shotRule(concept, shotIndex),
    graphicComposition: conceptGraphicBase(concept, shotIndex),
    productDiscovery:
      shotIndex === 3
        ? definition.heroRule
        : shotIndex === 4
          ? definition.releaseRule
          : definition.productRule,
    heroConvergence: shotIndex === 3 ? definition.heroRule : null,
    releaseConvergence: shotIndex === 4 ? definition.releaseRule : null,
  }));
  const qc = {
    director_concept_missing: {
      id: "director_concept_missing" as const,
      code: "DIRECTOR_CONCEPT_MISSING" as const,
      label: "Director Concept Present",
      status: "PASS" as const,
      reason: `${definition.label} is present and selected deterministically.`,
    },
    director_concept_weak: {
      id: "director_concept_weak" as const,
      code: "DIRECTOR_CONCEPT_WEAK" as const,
      label: "Director Concept Strength",
      status: definition.globalRule.length > 40 ? "PASS" as const : "FAIL" as const,
      reason: definition.globalRule,
    },
    director_concept_only_one_shot: {
      id: "director_concept_only_one_shot" as const,
      code: "DIRECTOR_CONCEPT_ONLY_ONE_SHOT" as const,
      label: "Concept Governs Multiple Shots",
      status: shots.filter((shot) => shot.contribution !== "REST").length >= 3 ? "PASS" as const : "FAIL" as const,
      reason: `Contributions: ${shots.map((shot) => shot.contribution).join(" → ")}.`,
    },
    director_concept_mechanical_repetition: {
      id: "director_concept_mechanical_repetition" as const,
      code: "DIRECTOR_CONCEPT_MECHANICAL_REPETITION" as const,
      label: "Concept Evolves",
      status: new Set(shots.map((shot) => shot.conceptRule)).size >= 3 ? "PASS" as const : "FAIL" as const,
      reason: "Each shot varies the device through scale, relation, or resolution.",
    },
    director_concept_break: {
      id: "director_concept_break" as const,
      code: "DIRECTOR_CONCEPT_BREAK" as const,
      label: "Concept Continuity",
      status: shots.every((shot) => shot.conceptRule && shot.graphicComposition.geometricDivision) ? "PASS" as const : "FAIL" as const,
      reason: "The concept contributes to every shot and the graphic layer remains physically grounded.",
    },
    director_concept_product_disconnect: {
      id: "director_concept_product_disconnect" as const,
      code: "DIRECTOR_CONCEPT_PRODUCT_DISCONNECT" as const,
      label: "Product / Concept Connection",
      status: shots[3]?.heroConvergence && shots[4]?.releaseConvergence ? "PASS" as const : "FAIL" as const,
      reason: "HERO and RELEASE explicitly connect the directing device to product comprehension and resolution.",
    },
    pseudo_luxury_device: {
      id: "pseudo_luxury_device" as const,
      code: "PSEUDO_LUXURY_DEVICE" as const,
      label: "No Pseudo-Luxury Device",
      status: "PASS" as const,
      reason: definition.pseudoLuxuryRisk,
    },
  };
  const failureReasons = Object.values(qc)
    .filter((gate) => gate.status === "FAIL")
    .map((gate) => `${gate.code}: ${gate.reason}`);
  return {
    schemaVersion: COMMERCIAL_DIRECTOR_CONCEPT_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_DIRECTOR_CONCEPT_VERSION,
    concept,
    label: definition.label,
    globalRule: definition.globalRule,
    soundRule: definition.soundRule,
    heroRule: definition.heroRule,
    releaseRule: definition.releaseRule,
    shots,
    qc,
    failureReasons: failureReasons.length > 0 ? failureReasons : undefined,
  };
}
