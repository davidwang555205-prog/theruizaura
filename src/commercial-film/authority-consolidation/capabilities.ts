import type { CommercialDirectorConceptId } from "../director-concept/types";
import type { CommercialFilmPlan } from "../types";
import type { CommercialFinalPhysicalResource } from "../final-execution/types";

export type CommercialDirectorConceptEligibilityCode =
  | "DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE"
  | "DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE"
  | "DIRECTOR_CONCEPT_EVENT_INCOMPATIBLE";

export type CommercialDirectorConceptCapabilityDefinition = {
  cameraConstraint:
    | "FIXED_CAMERA"
    | "FOREGROUND_OCCLUSION_VISIBLE"
    | "EDGE_COMPOSITION"
    | "THRESHOLD_VISIBLE"
    | "REFLECTIVE_RESOURCE_VISIBLE"
    | "LIGHT_RESOURCE_VISIBLE"
    | "BACKGROUND_MOVEMENT_VISIBLE"
    | "REPEATED_ACTION_RELATION";
  requiresResource: boolean;
  requiresRepeatedAction: boolean;
};

export const COMMERCIAL_DIRECTOR_CONCEPT_CAPABILITIES: Record<
  CommercialDirectorConceptId,
  CommercialDirectorConceptCapabilityDefinition
> = {
  STATIC_CAMERA_FILM: {
    cameraConstraint: "FIXED_CAMERA",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  PARTIAL_OBSCURATION: {
    cameraConstraint: "FOREGROUND_OCCLUSION_VISIBLE",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  EDGE_OF_FRAME: {
    cameraConstraint: "EDGE_COMPOSITION",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  THRESHOLD_CHAIN: {
    cameraConstraint: "THRESHOLD_VISIBLE",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  REFLECTION_WORLD: {
    cameraConstraint: "REFLECTIVE_RESOURCE_VISIBLE",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  LIGHT_REVEAL: {
    cameraConstraint: "LIGHT_RESOURCE_VISIBLE",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  WORLD_MOVES_SUBJECT_SETTLES: {
    cameraConstraint: "BACKGROUND_MOVEMENT_VISIBLE",
    requiresResource: true,
    requiresRepeatedAction: false,
  },
  REPEATED_GESTURE: {
    cameraConstraint: "REPEATED_ACTION_RELATION",
    requiresResource: true,
    requiresRepeatedAction: true,
  },
};

export type CommercialDirectorConceptEligibility = {
  concept: CommercialDirectorConceptId;
  capability: CommercialDirectorConceptCapabilityDefinition;
  eligible: boolean;
  resourceIds: string[];
  primaryResourceId: string | null;
  blockedCode: CommercialDirectorConceptEligibilityCode | null;
  reason: string;
};

const FIXED_CAMERA_MOVEMENTS = new Set([
  "locked_observation",
  "brief_hero_hold",
  "product_readable_lower_framing",
]);

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function resourceText(resource: CommercialFinalPhysicalResource) {
  return normalize(`${resource.id} ${resource.label} ${resource.entityId ?? ""}`);
}

function matchingResources(
  resources: CommercialFinalPhysicalResource[],
  pattern: RegExp
) {
  return resources.filter((resource) => pattern.test(resourceText(resource)));
}

function cameraAndFramingText(plan: CommercialFilmPlan) {
  return normalize([
    ...plan.cameraPlan.shots.map((shot) => `${shot.framing} ${shot.movementLine} ${shot.transitionLine}`),
    ...plan.eventSpine.shots.map((shot) => shot.framingHint),
  ].join(" "));
}

function hasRepeatedActionRelationship(plan: CommercialFilmPlan) {
  const counts = new Map<string, number>();
  plan.eventSpine.shots.forEach((shot) => {
    counts.set(shot.actionClass, (counts.get(shot.actionClass) ?? 0) + 1);
  });
  return [...counts.values()].some((count) => count >= 2);
}

function resourcesForConcept(
  concept: CommercialDirectorConceptId,
  resources: CommercialFinalPhysicalResource[],
  plan: CommercialFilmPlan
) {
  if (concept === "STATIC_CAMERA_FILM") {
    const movingOrArchitectural = matchingResources(
      resources,
      /\b(?:pedestrian|traffic|reflection|curtain|fabric|architecture|edge|opening|street|frontage|furniture|light)\b/
    );
    const prioritized = [...movingOrArchitectural].sort((left, right) => {
      const score = (resource: CommercialFinalPhysicalResource) => {
        const text = resourceText(resource);
        if (/\bmovement\b/.test(text)) return 2;
        if (/\b(?:pedestrian|traffic|reflection|curtain|fabric|light|architecture|edge|opening|street|frontage|furniture)\b/.test(text)) return 0;
        return 1;
      };
      return score(left) - score(right);
    });
    return prioritized.length > 0 ? prioritized : resources;
  }
  if (concept === "PARTIAL_OBSCURATION") {
    return matchingResources(
      resources,
      /\b(?:foreground|frame|edge|door|glass|surface|furniture|chair|curtain|opening|occlu|hardware|wardrobe|stoop|frontage|curb)\b/
    );
  }
  if (concept === "EDGE_OF_FRAME") {
    const edgeResources = matchingResources(
      resources,
      /\b(?:edge|line|frame|opening|architecture|wardrobe|frontage|corner|curb|street|window)\b/
    );
    return edgeResources.length > 0 ? edgeResources : resources;
  }
  if (concept === "THRESHOLD_CHAIN") {
    return matchingResources(
      resources,
      /\b(?:threshold|door|doorway|opening|boundary|entry|curb|crossing|frontage|stoop)\b/
    );
  }
  if (concept === "REFLECTION_WORLD") {
    return matchingResources(
      resources,
      /\b(?:reflection|reflective|glass|mirror|polished|surface)\b/
    );
  }
  if (concept === "LIGHT_REVEAL") {
    return matchingResources(
      resources,
      /\b(?:light|shadow|falloff|window|sunlight)\b/
    );
  }
  if (concept === "WORLD_MOVES_SUBJECT_SETTLES") {
    if (plan.commercialIntent === "QUIET_LUXURY" && plan.eventSpine.advertisingStructure === "WORLD_OBSERVES_SUBJECT") {
      const selectedWorldResourceId = plan.eventSpine.shots.find((shot) => (
        shot.physicalEvent.eventFamily === "WORLD_CARRIER_CHANGE"
        && shot.physicalEvent.actor === "WORLD"
      ))?.physicalEvent.requiredResource;
      const selectedWorldResource = resources.find((resource) => resource.entityId === selectedWorldResourceId);
      if (selectedWorldResource) return [selectedWorldResource];
    }
    return matchingResources(
      resources,
      /\b(?:pedestrian|traffic|vehicle|reflection|curtain|fabric|movement|street|background)\b/
    );
  }
  if (concept === "REPEATED_GESTURE") {
    if (!hasRepeatedActionRelationship(plan)) return [];
    return matchingResources(
      resources,
      /\b(?:outfit|garment)\b/
    );
  }
  return resources;
}

function cameraCompatible(
  concept: CommercialDirectorConceptId,
  plan: CommercialFilmPlan,
  resources: CommercialFinalPhysicalResource[]
) {
  const primaryResource = resources[0];
  if (!primaryResource) return false;
  return isCommercialConceptResourceCameraCompatible({
    concept,
    plan,
    resource: primaryResource,
  });
}

export function evaluateCommercialDirectorConceptEligibility(input: {
  concept: CommercialDirectorConceptId;
  plan: CommercialFilmPlan;
  resources: CommercialFinalPhysicalResource[];
}): CommercialDirectorConceptEligibility {
  const conceptResources = resourcesForConcept(input.concept, input.resources, input.plan);
  const eventEvidence = input.plan.eventSpine.shots.flatMap((shot) =>
    shot.stateContract.effects
      .filter((effect) => effect.fromValue !== effect.toValue)
      .map((effect) => normalize([
        effect.entityId,
        effect.attribute,
        effect.fromValue,
        effect.toValue,
        effect.reason,
      ].join(" ")))
  );
  conceptResources.sort((left, right) => {
    const score = (resource: CommercialFinalPhysicalResource) => {
      const label = normalize(resource.label);
      if (resource.entityId && eventEvidence.some((evidence) => evidence.includes(normalize(resource.entityId ?? "")))) return 0;
      if (label && eventEvidence.some((evidence) => evidence.includes(label))) return 1;
      return 2;
    };
    return score(left) - score(right);
  });
  const capability = COMMERCIAL_DIRECTOR_CONCEPT_CAPABILITIES[input.concept];
  if (conceptResources.length === 0) {
    return {
      concept: input.concept,
      capability,
      eligible: false,
      resourceIds: [],
      primaryResourceId: null,
      blockedCode: "DIRECTOR_CONCEPT_RESOURCE_INCOMPATIBLE",
      reason: `${input.concept} requires a declared physical resource that this intent/scene world does not provide.`,
    };
  }
  if (!cameraCompatible(input.concept, input.plan, conceptResources)) {
    return {
      concept: input.concept,
      capability,
      eligible: false,
      resourceIds: conceptResources.map((resource) => resource.id),
      primaryResourceId: conceptResources[0]?.id ?? null,
      blockedCode: "DIRECTOR_CONCEPT_CAMERA_INCOMPATIBLE",
      reason: `${input.concept} cannot be executed by the current Camera Plan.`,
    };
  }
  return {
    concept: input.concept,
    capability,
    eligible: true,
    resourceIds: conceptResources.map((resource) => resource.id),
    primaryResourceId: conceptResources[0]?.id ?? null,
    blockedCode: null,
    reason: `${input.concept} resolves to ${conceptResources[0]?.label ?? "a declared physical resource"}.`,
  };
}

export function isCommercialConceptResourceCameraCompatible(input: {
  concept: CommercialDirectorConceptId;
  plan: CommercialFilmPlan;
  resource: CommercialFinalPhysicalResource;
}) {
  const text = cameraAndFramingText(input.plan);
  const resourceLabel = resourceText(input.resource);
  if (input.concept === "STATIC_CAMERA_FILM") {
    return input.plan.cameraPlan.shots.every((shot) => FIXED_CAMERA_MOVEMENTS.has(shot.movement));
  }
  if (input.concept === "REFLECTION_WORLD") {
    return /\b(?:reflection|reflective|glass|mirror|window|layered)\b/.test(text)
      || (/\b(?:reflection|reflective|glass|mirror|polished)\b/.test(resourceLabel)
        && /\b(?:environmental|wide|street|interior)\b/.test(text));
  }
  if (input.concept === "LIGHT_REVEAL") {
    return /\b(?:light|shadow|window|falloff)\b/.test(text)
      || (/\b(?:light|window)\b/.test(resourceLabel) && /\b(?:environmental|wide|interior|medium)\b/.test(text));
  }
  if (input.concept === "THRESHOLD_CHAIN") {
    return /\b(?:threshold|door|doorway|crossing|curb|boundary|opening|frontage)\b/.test(text);
  }
  if (input.concept === "PARTIAL_OBSCURATION") {
    return /\b(?:foreground|occlu|partial|frame|door|glass|shadow|curtain|furniture)\b/.test(text);
  }
  if (input.concept === "WORLD_MOVES_SUBJECT_SETTLES") {
    return /\b(?:environmental|wide|street|background|deep)\b/.test(text);
  }
  if (input.concept === "REPEATED_GESTURE") {
    return hasRepeatedActionRelationship(input.plan);
  }
  return true;
}
