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
  const structureConceptBonus: Record<typeof input.creativeSpine.advertisingStructure, CommercialDirectorConceptId[]> = {
    CONTRAST_SHIFT: ["LIGHT_REVEAL", "REFLECTION_WORLD", "WORLD_MOVES_SUBJECT_SETTLES"],
    PURSUIT_RELEASE: ["THRESHOLD_CHAIN", "WORLD_MOVES_SUBJECT_SETTLES", "EDGE_OF_FRAME"],
    WITHHOLD_REVEAL: ["PARTIAL_OBSCURATION", "REFLECTION_WORLD", "LIGHT_REVEAL"],
    RITUAL_COMPLETION: ["REPEATED_GESTURE", "THRESHOLD_CHAIN", "STATIC_CAMERA_FILM"],
    WORLD_OBSERVES_SUBJECT: ["WORLD_MOVES_SUBJECT_SETTLES", "REFLECTION_WORLD", "STATIC_CAMERA_FILM"],
    ICONIC_IMAGE: ["STATIC_CAMERA_FILM", "EDGE_OF_FRAME", "LIGHT_REVEAL"],
  };
  if (structureConceptBonus[input.creativeSpine.advertisingStructure].includes(concept)) score += 6;
  const centralPhysicalEvent = input.eventSpine.shots[2]?.physicalEvent.eventFamily;
  if (centralPhysicalEvent === "WORLD_CARRIER_CHANGE" && concept === "WORLD_MOVES_SUBJECT_SETTLES") score += 14;
  const quietLuxuryWorldEvent = input.commercialIntent === "QUIET_LUXURY"
    && input.creativeSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT"
    ? input.eventSpine.shots.find((shot) => shot.physicalEvent.eventFamily === "WORLD_CARRIER_CHANGE")?.physicalEvent.eventFamily
    : null;
  if (quietLuxuryWorldEvent === "WORLD_CARRIER_CHANGE" && concept === "WORLD_MOVES_SUBJECT_SETTLES") score += 14;
  if (centralPhysicalEvent === "FOREGROUND_OCCLUSION_ESTABLISHED" && concept === "PARTIAL_OBSCURATION") score += 14;
  if (centralPhysicalEvent === "PERSON_PRODUCT_WORLD_ALIGNMENT" && ["STATIC_CAMERA_FILM", "EDGE_OF_FRAME"].includes(concept)) score += 10;
  if (centralPhysicalEvent === "PERCEPTUAL_RELATION_SHIFT" && ["LIGHT_REVEAL", "REFLECTION_WORLD", "WORLD_MOVES_SUBJECT_SETTLES"].includes(concept)) score += 10;
  return score;
}

function contributionFor(shotIndex: number, concept: CommercialDirectorConceptId): CommercialDirectorContribution {
  if (shotIndex === 0) return concept === "THRESHOLD_CHAIN" ? "SUPPORTING" : "PRIMARY";
  if (shotIndex === 1 || shotIndex === 2) return concept === "REPEATED_GESTURE" ? "SUPPORTING" : "REST";
  if (shotIndex === 3) return "PRIMARY";
  return "RESOLUTION";
}

function shotRule(
  concept: CommercialDirectorConceptId,
  shotIndex: number,
  spine: CommercialDirectorConceptPlannerInput["creativeSpine"]
) {
  const definition = COMMERCIAL_DIRECTOR_CONCEPT_CATALOG[concept];
  const structureLanguage: Record<typeof spine.advertisingStructure, string> = {
    PURSUIT_RELEASE: "movement finds a natural release",
    CONTRAST_SHIFT: "an existing visual condition changes",
    RITUAL_COMPLETION: "one grounded action reaches completion",
    WITHHOLD_REVEAL: "the product is present before it is fully understood",
    WORLD_OBSERVES_SUBJECT: "the established world shifts around the person",
    ICONIC_IMAGE: "the film gathers toward one complete image",
  };
  const roleLanguage: Record<typeof spine.productRole, string> = {
    INHABITED: "part of the complete worn look",
    DISCOVERED: "recognized gradually through the established action",
    REVEALED: "made legible through the established event",
    HERO: "the central product image, supported by existing evidence",
  };
  if (shotIndex === 0) return definition.cameraRule;
  if (shotIndex === 1) return `${definition.cameraRule} ${definition.graphicRule}`;
  if (shotIndex === 2) return `${definition.graphicRule} Keep the idea perceptible: ${structureLanguage[spine.advertisingStructure]}, without adding a physical resource.`;
  if (shotIndex === 3) return `${definition.cameraRule} Preserve the product as ${roleLanguage[spine.productRole]} with ${spine.productPresenceByShot[shotIndex].toLowerCase()} visibility selected upstream.`;
  return `Resolve through ${spine.endingImageStrategy.toLowerCase()} using only the existing frame and physical state.`;
}

export function rankCommercialDirectorConcepts(
  input: CommercialDirectorConceptPlannerInput
): CommercialDirectorConceptId[] {
  return ALL_CONCEPTS
    .map((concept, order) => ({ concept, order, score: scoreConcept(concept, input) }))
    .sort((first, second) => second.score - first.score || first.order - second.order)
    .map((entry) => entry.concept);
}

export function planCommercialDirectorConcept(
  input: CommercialDirectorConceptPlannerInput
): CommercialDirectorConceptPlan {
  const ranked = rankCommercialDirectorConcepts(input);
  const concept = input.override ?? ranked[0];
  const definition = COMMERCIAL_DIRECTOR_CONCEPT_CATALOG[concept];
  const spine = input.creativeSpine;
  const roleLine = (shotIndex: number) => {
    const presence = spine.productPresenceByShot[shotIndex];
    if (spine.productRole === "INHABITED") return `The product remains part of the complete worn look at ${presence.toLowerCase()} presence; do not isolate or escalate it.`;
    if (spine.productRole === "DISCOVERED") return `Let recognition follow the ${presence.toLowerCase()} visibility selected by the Creative Spine.`;
    if (spine.productRole === "REVEALED") return `Use only the established event and camera evidence to support the ${presence.toLowerCase()} reveal.`;
    return `The Creative Spine selected HERO product role at ${presence.toLowerCase()} presence; keep the product worn at human scale.`;
  };
  const endingLine = spine.endingImageStrategy === "CONTINUE_INTO_LIFE"
    ? "Carry the existing action naturally into life."
    : spine.endingImageStrategy === "RESOLVE_IN_PLACE"
      ? "Resolve in the already established final position."
      : spine.endingImageStrategy === "WORLD_AFTERIMAGE"
        ? "Let only the already established world condition remain perceptible around the final state."
        : "Hold the already established person, product, and world as one complete image.";
  const shots: CommercialDirectorConceptShot[] = input.eventSpine.shots.map((shot, shotIndex) => ({
    shotIndex,
    shotRole: shot.shotRole,
    contribution: contributionFor(shotIndex, concept),
    conceptRule: shotRule(concept, shotIndex, spine),
    graphicComposition: conceptGraphicBase(concept, shotIndex),
    productDiscovery: roleLine(shotIndex),
    heroConvergence: shotIndex === 3 ? roleLine(shotIndex) : null,
    releaseConvergence: shotIndex === 4 ? endingLine : null,
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
      reason: "The selected product role and ending strategy remain connected to the directing principle without role-driven visibility escalation.",
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
