import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import type {
  CommercialCreativeSpinePlan,
  CommercialStoryQc,
  CommercialStoryQcGate,
  CommercialStoryQcGateId,
} from "./types";

export type CommercialCreativeSpineQcInput = Omit<
  CommercialCreativeSpinePlan,
  "qc" | "failureReasons"
>;

const GATE_LABELS: Record<CommercialStoryQcGateId, string> = {
  commercial_premise_missing: "One Commercial Premise",
  shot_function_duplication: "Distinct Shot Functions",
  story_continuity_broken: "Continuous Story Logic",
  arbitrary_product_insert: "Supported Detail Function",
  hero_context_disconnected: "Connected Hero Context",
  release_not_resolved: "Resolved Release",
  product_meaning_unsupported: "Supported Product Meaning",
  human_situation_inconsistent: "One Human Situation",
  premise_not_reflected: "Premise Reflected In Every Shot",
  product_readability_protected: "Commercial Product Readability Protected",
};

const GATE_CODES: Record<CommercialStoryQcGateId, CommercialStoryQcGate["code"]> = {
  commercial_premise_missing: "COMMERCIAL_PREMISE_MISSING",
  shot_function_duplication: "SHOT_FUNCTION_DUPLICATION",
  story_continuity_broken: "STORY_CONTINUITY_BROKEN",
  arbitrary_product_insert: "ARBITRARY_PRODUCT_INSERT",
  hero_context_disconnected: "HERO_CONTEXT_DISCONNECTED",
  release_not_resolved: "RELEASE_NOT_RESOLVED",
  product_meaning_unsupported: "PRODUCT_MEANING_UNSUPPORTED",
  human_situation_inconsistent: "HUMAN_SITUATION_INCONSISTENT",
  premise_not_reflected: "PREMISE_NOT_REFLECTED",
  product_readability_protected: "PRODUCT_READABILITY_UNPROTECTED",
};

function gate(
  id: CommercialStoryQcGateId,
  passed: boolean,
  reason: string
): CommercialStoryQcGate {
  return {
    id,
    code: GATE_CODES[id],
    label: GATE_LABELS[id],
    status: passed ? "PASS" : "FAIL",
    reason,
  };
}

export function runCommercialStoryQc(
  input: CommercialCreativeSpineQcInput,
  supportedCoverage: ProductCoverage[]
): {
  qc: CommercialStoryQc;
  passed: boolean;
  failureReasons: string[];
} {
  const coverage = new Set(supportedCoverage);
  const functionCounts = input.shotFunctions.reduce<Record<string, number>>((counts, shot) => {
    counts[shot.dramaticFunction] = (counts[shot.dramaticFunction] ?? 0) + 1;
    return counts;
  }, {});
  const duplicateFunction = Object.entries(functionCounts).find(([, count]) => count > 2);
  const detail = input.shotFunctions.find((shot) => shot.shotRole === "DETAIL");
  const hero = input.shotFunctions.find((shot) => shot.shotRole === "HERO");
  const release = input.shotFunctions.find((shot) => shot.shotRole === "RELEASE");
  const fiveShotOrderValid = input.shotFunctions.length === 5
    && input.shotFunctions.every((shot, index) => shot.shotIndex === index);
  const continuityFields = [
    input.continuity.locationRelationship,
    input.continuity.timeRelationship,
    input.continuity.characterState,
    input.continuity.wardrobe,
    input.continuity.actionProgression,
    input.continuity.spatialLogic,
    input.continuity.emotionalTemperature,
    input.continuity.productPresenceProgression,
  ];
  const continuityBroken = !fiveShotOrderValid
    || continuityFields.some((field) => !field.trim())
    || input.shotFunctions.some((shot, index) => (
      !shot.continuityFromPrevious.trim()
      || !shot.continuityToNext.trim()
      || (index > 0 && !shot.continuityFromPrevious.includes(`shot ${index}`))
      || (index < input.shotFunctions.length - 1 && !shot.continuityToNext.includes(`shot ${index + 2}`))
    ));
  const productMeaningSupported = input.productMeaning.externalReferenceRequired
    ? input.productMeaning.supportingCoverage.length === 0
      && input.productMeaning.factBasis.length > 0
      && input.productMeaning.unsupportedClaimGuard.length > 0
    : input.productMeaning.supportingCoverage.length > 0
      && input.productMeaning.supportingCoverage.every((item) => coverage.has(item))
      && input.productMeaning.factBasis.length > 0
      && input.productMeaning.unsupportedClaimGuard.length > 0;
  const readabilityProtected = hero?.productPresenceDesign === "CLEAR"
    && detail?.productPresenceDesign !== "ABSENT"
    && input.productPresenceByShot.some((presence) => presence === "CLEAR");
  const premiseReflected = input.shotFunctions.every((shot) => (
    shot.narrativePurpose.trim().length > 0
    && shot.audienceKnowledgeBefore.trim().length > 0
    && shot.audienceKnowledgeAfter.trim().length > 0
    && shot.productNarrativeRole.trim().length > 0
  ));

  const qc: CommercialStoryQc = {
    commercial_premise_missing: gate(
      "commercial_premise_missing",
      Boolean(input.premise.text.trim()) && input.premise.sourceFacts.length > 0,
      input.premise.text.trim()
        ? "Exactly one concise Creative Premise is derived from the Commercial Intent, Human Situation, Product Message, and Audience Desire."
        : "No Creative Premise was generated."
    ),
    shot_function_duplication: gate(
      "shot_function_duplication",
      !duplicateFunction && Object.keys(functionCounts).length >= 3,
      duplicateFunction
        ? `Dramatic function ${duplicateFunction[0]} appears ${duplicateFunction[1]} times.`
        : "No dramatic function is repeated more than twice, and the five shots use at least three functions."
    ),
    story_continuity_broken: gate(
      "story_continuity_broken",
      !continuityBroken,
      continuityBroken
        ? "At least one shot breaks location, time, character, wardrobe, action, spatial, emotional, or product-presence continuity."
        : "The five shots form an explicit continuous chain across location, time, character state, wardrobe, action, space, emotional temperature, and product presence."
    ),
    arbitrary_product_insert: gate(
      "arbitrary_product_insert",
      detail?.dramaticFunction !== undefined
        && detail.productPresenceDesign !== "ABSENT"
        && detail.narrativePurpose.length > 0,
      detail
        ? `The DETAIL beat performs ${detail.dramaticFunction} and remains tied to the same human situation.`
        : "No DETAIL beat exists."
    ),
    hero_context_disconnected: gate(
      "hero_context_disconnected",
      hero?.continuityFromPrevious.includes(`shot ${hero.shotIndex}`) === true
        && hero.dramaticFunction !== "ESTABLISH"
        && hero.productPresenceDesign === "CLEAR",
      hero
        ? "The HERO beat is connected to the preceding human context and provides the clear worn-product read."
        : "No HERO beat exists."
    ),
    release_not_resolved: gate(
      "release_not_resolved",
      release?.dramaticFunction === "RESOLVE"
        && /resolve|continuation|aftertaste|result/i.test(release.narrativePurpose),
      release
        ? "The RELEASE beat resolves the preceding film rather than introducing a new story."
        : "No RELEASE beat exists."
    ),
    product_meaning_unsupported: gate(
      "product_meaning_unsupported",
      productMeaningSupported,
      productMeaningSupported
        ? "The Product Meaning is supported only by current confirmed product coverage and makes no unsupported physical claim."
        : "The Product Meaning contains coverage or fact language that is not supported by the Product Message."
    ),
    human_situation_inconsistent: gate(
      "human_situation_inconsistent",
      input.humanSituation.id === input.premise.situationId
        && input.shotFunctions.every((shot) => shot.continuity.locationRelationship === input.continuity.locationRelationship),
      "All five shots share one Human Situation and one location relationship."
    ),
    premise_not_reflected: gate(
      "premise_not_reflected",
      premiseReflected && input.arc.length === 5,
      premiseReflected
        ? "Every shot has a purpose, a knowledge change, and a product role that reflect the Creative Premise."
        : "At least one shot does not reflect the Creative Premise."
    ),
    product_readability_protected: gate(
      "product_readability_protected",
      readabilityProtected,
      readabilityProtected
        ? "The HERO remains CLEAR and the DETAIL remains reference-visible while the rest of the film may vary in product presence."
        : "The product-presence design weakens DETAIL, HERO, or the required clear product read."
    ),
  };

  const failureReasons = Object.values(qc)
    .filter((entry) => entry.status === "FAIL")
    .map((entry) => `${entry.code}: ${entry.reason}`);

  return {
    qc,
    passed: failureReasons.length === 0,
    failureReasons,
  };
}
