import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import {
  COMMERCIAL_HUMAN_SITUATIONS,
  resolveCommercialCreativeProfile,
} from "./catalog";
import { runCommercialStoryQc, type CommercialCreativeSpineQcInput } from "./qc";
import {
  buildCommercialPremise,
  buildCommercialProductMeaning,
  buildShotStorySpine,
  productPresencePattern,
  selectCommercialAudienceDesire,
  selectCommercialRevealStrategy,
} from "./rules";
import {
  COMMERCIAL_CREATIVE_SPINE_SCHEMA_VERSION,
  COMMERCIAL_CREATIVE_SPINE_VERSION,
  type CommercialCreativeSpinePlan,
  type CommercialCreativeSpinePlannerInput,
} from "./types";

function supportedCoverageOf(input: CommercialCreativeSpinePlannerInput): ProductCoverage[] {
  return input.productMessage.supportedDimensions.map((dimension) => dimension.coverage);
}

export function planCommercialCreativeSpine(
  input: CommercialCreativeSpinePlannerInput
): CommercialCreativeSpinePlan {
  const profile = resolveCommercialCreativeProfile(input.commercialIntent);
  const humanSituation = COMMERCIAL_HUMAN_SITUATIONS[profile.situationId];
  if (!humanSituation) {
    throw new Error(`No Commercial Human Situation exists for ${profile.situationId}.`);
  }
  const audienceDesire = selectCommercialAudienceDesire(profile, {
    lifestyleFeeling: input.lifestyleFeeling,
    productMessage: input.productMessage,
    cameraRhythm: input.cameraRhythm,
  });
  const revealStrategy = selectCommercialRevealStrategy(
    input.commercialIntent,
    profile,
    input.creativeCase
  );
  const productMeaning = buildCommercialProductMeaning({
    productMessage: input.productMessage,
    syntheticSituationLine: humanSituation.situationLine,
    desire: audienceDesire,
  });
  const premise = buildCommercialPremise({
    intent: input.commercialIntent,
    situationId: humanSituation.id,
    situationLine: humanSituation.situationLine,
    productMeaning,
    desire: audienceDesire,
    profile,
  });
  const productPresenceByShot = productPresencePattern(revealStrategy);
  const primaryCoverage = input.productMessage.supportedDimensions[0]?.coverage ?? null;
  const story = buildShotStorySpine({
    shotRoles: input.shotRoles,
    revealStrategy,
    productPresence: productPresenceByShot,
    primaryCoverage,
    situationLine: humanSituation.situationLine,
    sceneWorldLabel: input.sceneWorld.label,
    productMeaning,
  });
  const planWithoutQc: CommercialCreativeSpineQcInput = {
    schemaVersion: COMMERCIAL_CREATIVE_SPINE_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_CREATIVE_SPINE_VERSION,
    creativeCase: input.creativeCase ?? null,
    premise,
    humanSituation,
    audienceDesire,
    productMeaning,
    revealStrategy,
    arc: story.shotFunctions.map((shot) => shot.dramaticFunction),
    shotFunctions: story.shotFunctions,
    continuity: story.continuity,
    productPresenceByShot,
  };
  const qcResult = runCommercialStoryQc(planWithoutQc, supportedCoverageOf(input));
  return {
    ...planWithoutQc,
    qc: qcResult.qc,
    failureReasons: qcResult.failureReasons.length > 0 ? qcResult.failureReasons : undefined,
  };
}
