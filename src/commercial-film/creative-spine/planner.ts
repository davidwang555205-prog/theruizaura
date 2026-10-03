import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import {
  COMMERCIAL_ADVERTISING_STRUCTURES_BY_INTENT,
  COMMERCIAL_ADVERTISING_STRUCTURE_COPY,
  COMMERCIAL_ENDING_BY_STRUCTURE,
  COMMERCIAL_PRODUCT_ROLE_BY_STRUCTURE,
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
  advertisingStructureForNonce,
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
  const selectedRevealStrategy = selectCommercialRevealStrategy(
    input.commercialIntent,
    profile,
    input.creativeCase
  );
  const advertisingStructure = advertisingStructureForNonce(
    COMMERCIAL_ADVERTISING_STRUCTURES_BY_INTENT[input.commercialIntent],
    input.generationNonce
  );
  const structureCopy = COMMERCIAL_ADVERTISING_STRUCTURE_COPY[advertisingStructure];
  const situationLine = humanSituation.situationLine.replace(/^(moves|arrives|takes|finishes|returns|waits|walks|moves)\b/, "the person $1");
  const productRole = COMMERCIAL_PRODUCT_ROLE_BY_STRUCTURE[advertisingStructure];
  const endingImageStrategy = COMMERCIAL_ENDING_BY_STRUCTURE[advertisingStructure];
  const revealStrategy = advertisingStructure === "WITHHOLD_REVEAL"
    ? "PROGRESSIVE"
    : selectedRevealStrategy;
  const productMeaning = buildCommercialProductMeaning({
    productMessage: input.productMessage,
    syntheticSituationLine: humanSituation.situationLine,
    desire: audienceDesire,
  });
  const roleLine = productMeaning.externalReferenceRequired
    ? productMeaning.roleLine
    : productRole === "INHABITED"
      ? `The product remains part of the complete worn look while ${situationLine}.`
      : productRole === "DISCOVERED"
        ? `The product is recognized gradually through the established action while ${situationLine}.`
        : productRole === "REVEALED"
          ? `The existing event makes the worn product legible while ${situationLine}.`
          : `The central product image remains supported by the completed action while ${situationLine}.`;
  const authoritativeProductMeaning = {
    ...productMeaning,
    meaning: `${roleLine} ${audienceDesire.viewerOutcomeLine.charAt(0).toLowerCase()}${audienceDesire.viewerOutcomeLine.slice(1)}.`,
    roleLine,
  };
  const basePremise = buildCommercialPremise({
    intent: input.commercialIntent,
    situationId: humanSituation.id,
    situationLine: humanSituation.situationLine,
    productMeaning: authoritativeProductMeaning,
    desire: audienceDesire,
    profile,
  });
  const premise = {
    ...basePremise,
    text: `${structureCopy.premise} ${structureCopy.tension.line} During this moment, ${authoritativeProductMeaning.meaning.charAt(0).toLowerCase()}${authoritativeProductMeaning.meaning.slice(1)} ${profile.expressionLine}`.replace(/\. the /g, ". The "),
  };
  const productPresenceByShot = productPresencePattern(revealStrategy, productRole, advertisingStructure);
  const primaryCoverage = input.productMessage.supportedDimensions[0]?.coverage ?? null;
  const story = buildShotStorySpine({
    shotRoles: input.shotRoles,
    revealStrategy,
    productPresence: productPresenceByShot,
    primaryCoverage,
    situationLine: humanSituation.situationLine,
    sceneWorldLabel: input.sceneWorld.label,
    productMeaning: authoritativeProductMeaning,
    productRole,
    advertisingStructure,
    filmTension: structureCopy.tension.line,
  });
  const planWithoutQc: CommercialCreativeSpineQcInput = {
    schemaVersion: COMMERCIAL_CREATIVE_SPINE_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_CREATIVE_SPINE_VERSION,
    creativeCase: input.creativeCase ?? null,
    advertisingStructure,
    productRole,
    endingImageStrategy,
    filmTension: structureCopy.tension,
    visualMemoryIntent: structureCopy.memory,
    endingImageIntent: `${structureCopy.memory} Ending strategy: ${endingImageStrategy}. Resolve only from the established final physical state, existing resources, and feasible camera.` ,
    brandFilmPrinciples: [
      "The character belongs to a complete world; the product belongs to the character.",
      "The existing world may create the visual event; movement remains unforced and the camera does not demand performance.",
      "Material, light, and atmosphere carry meaning; one memorable visual idea outweighs repeated product demonstrations.",
      "The ending leaves an image derived from the established final state rather than merely reporting that state.",
    ],
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
