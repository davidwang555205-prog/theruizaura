import {
  planCommercialDirectorConcept,
  rankCommercialDirectorConcepts,
} from "../director-concept";
import { buildCommercialPhysicalResourceRegistry } from "../final-execution/projection";
import { buildCommercialCreativeTreatment } from "../creative-directing/planner";
import { planCommercialProductVisibilityAuthority } from "../product-visibility/planner";
import {
  evaluateCommercialDirectorConceptEligibility,
  type CommercialDirectorConceptEligibility,
} from "./capabilities";
import type {
  CommercialAuthorityConsolidationInput,
  CommercialAuthorityConsolidationOutcome,
} from "./types";

function directorConceptInput(input: CommercialAuthorityConsolidationInput) {
  return {
    commercialIntent: input.basePlan.commercialIntent,
    creativeSpine: input.basePlan.creativeSpine,
    creativeDirection: input.basePlan.creativeDirection,
    eventSpine: input.basePlan.eventSpine,
    generationNonce: input.generationNonce,
  };
}

function eligibilityList(input: CommercialAuthorityConsolidationInput): CommercialDirectorConceptEligibility[] {
  const resources = buildCommercialPhysicalResourceRegistry(input.basePlan);
  const ranked = rankCommercialDirectorConcepts(directorConceptInput(input));
  return ranked.map((concept) => evaluateCommercialDirectorConceptEligibility({
    concept,
    plan: input.basePlan,
    resources,
  }));
}

export function consolidateCommercialAuthority(
  input: CommercialAuthorityConsolidationInput
): CommercialAuthorityConsolidationOutcome {
  const resources = buildCommercialPhysicalResourceRegistry(input.basePlan);
  const eligibility = eligibilityList(input);
  const eligibilityByConcept = new Map(eligibility.map((entry) => [entry.concept, entry]));
  const forcedConcept = input.input.directorConceptOverride ?? null;
  const eligible = eligibility.filter((entry) => entry.eligible);

  let effectiveDirectorConceptId = forcedConcept;
  if (!effectiveDirectorConceptId) {
    effectiveDirectorConceptId = eligible[0]?.concept ?? null;
    if (!effectiveDirectorConceptId) {
      return {
        status: "BLOCKED",
        code: "NO_EXECUTABLE_DIRECTOR_CONCEPT",
        reason: "No Director Concept is compatible with the current physical resources and Camera Plan.",
        diagnostics: eligibility.map((entry) => `${entry.concept}: ${entry.reason}`),
        eligibility,
      };
    }
  } else {
    const forcedEligibility = eligibilityByConcept.get(effectiveDirectorConceptId);
    if (!forcedEligibility?.eligible) {
      return {
        status: "BLOCKED",
        code: forcedEligibility?.blockedCode ?? "DIRECTOR_CONCEPT_EVENT_INCOMPATIBLE",
        reason: forcedEligibility?.reason ?? `${effectiveDirectorConceptId} is not executable in this plan.`,
        diagnostics: eligibility.map((entry) => `${entry.concept}: ${entry.reason}`),
        eligibility,
      };
    }
  }

  const effectiveDirectorConcept = planCommercialDirectorConcept({
    ...directorConceptInput(input),
    override: effectiveDirectorConceptId,
  });
  const effectivePlan = {
    ...input.basePlan,
    directorConcept: effectiveDirectorConcept,
  };
  const productVisibility = planCommercialProductVisibilityAuthority({
    plan: effectivePlan,
  });
  const selectedEligibility = eligibilityByConcept.get(effectiveDirectorConceptId);
  const primaryResource = selectedEligibility?.primaryResourceId
    ? resources.find((resource) => resource.id === selectedEligibility.primaryResourceId) ?? null
    : null;
  const treatment = buildCommercialCreativeTreatment(
    effectivePlan,
    input.generationNonce,
    {
      productVisibilityTimeline: productVisibility.timeline,
      revealContract: productVisibility.revealContract,
      primaryResource: primaryResource
        ? { id: primaryResource.id, label: primaryResource.label }
        : null,
    }
  );

  return {
    status: "GENERATED",
    mode: forcedConcept ? "FORCED" : "AUTO",
    effectiveDirectorConceptId,
    effectiveDirectorConcept,
    effectivePlan,
    resourcePlan: {
      primaryResource,
      resourceIds: selectedEligibility?.resourceIds ?? [],
    },
    productVisibility,
    treatment,
    eligibility,
  };
}
