import type { ProductCoverage } from "../../visual-system/taskReferenceBinding";
import type {
  CommercialCameraRhythm,
  CommercialIntentId,
  CommercialProductMessage,
  CommercialShotRole,
} from "../types";
import {
  COMMERCIAL_AUDIENCE_DESIRES,
  COMMERCIAL_PRODUCT_MEANING_LINES,
  type CommercialIntentCreativeProfile,
} from "./catalog";
import type {
  CommercialAudienceDesire,
  CommercialAudienceDesireId,
  CommercialContinuityReasoning,
  CommercialCreativeCase,
  CommercialDramaticFunction,
  CommercialHumanSituationId,
  CommercialProductMeaning,
  CommercialProductPresenceDesign,
  CommercialRevealStrategy,
  CommercialShotStorySpine,
} from "./types";

const REVEAL_PRESENCE_PATTERNS: Record<CommercialRevealStrategy, CommercialProductPresenceDesign[]> = {
  IMMEDIATE: ["SECONDARY", "CLEAR", "PARTIAL", "CLEAR", "SECONDARY"],
  PROGRESSIVE: ["SECONDARY", "PARTIAL", "CLEAR", "CLEAR", "SECONDARY"],
  DELAYED: ["ABSENT", "SECONDARY", "PARTIAL", "CLEAR", "SECONDARY"],
};

function scoreDesire(
  desire: CommercialAudienceDesireId,
  profile: CommercialIntentCreativeProfile,
  input: {
    lifestyleFeeling: string;
    productMessage: CommercialProductMessage;
    cameraRhythm: CommercialCameraRhythm;
  }
) {
  let score = Math.max(0, profile.desirePriority.length - profile.desirePriority.indexOf(desire));
  const feeling = input.lifestyleFeeling.toLowerCase();
  const coverage = new Set(input.productMessage.supportedDimensions.map((dimension) => dimension.coverage));

  if (/(安静|克制|平静|quiet|calm|restrained|contained|understated)/i.test(feeling)) {
    if (desire === "QUIET_REFINEMENT") score += 5;
    if (desire === "SELF_POSSESSION") score += 3;
    if (desire === "EFFORTLESSNESS") score += 2;
  }
  if (/(自然|日常|easy|natural|everyday|unforced)/i.test(feeling)) {
    if (desire === "EVERYDAY_EASE") score += 5;
    if (desire === "UNFORCED_STYLE") score += 3;
  }
  if (/(轻|light|open|airy)/i.test(feeling) && desire === "LIGHTNESS") score += 4;
  if (/(自信|坚定|composed|confident|poised)/i.test(feeling) && desire === "CONFIDENCE") score += 5;
  if (/(温暖|归属|warm|belonging)/i.test(feeling) && desire === "BELONGING") score += 4;
  if (/(实用|百搭|versatile|practical)/i.test(feeling) && desire === "VERSATILITY") score += 4;
  if (/(舒适|comfort)/i.test(feeling) && desire === "COMFORT") score += 2;

  if (coverage.has("material_evidence") && desire === "QUIET_REFINEMENT") score += 2;
  if (coverage.has("silhouette") && coverage.has("color_blocking") && desire === "UNFORCED_STYLE") score += 2;
  if (coverage.has("outsole_profile") && desire === "EVERYDAY_EASE") score += 1;
  if (input.cameraRhythm === "PRODUCT_FORWARD" && desire === "CONFIDENCE") score += 1;
  return score;
}

export function selectCommercialAudienceDesire(
  profile: CommercialIntentCreativeProfile,
  input: {
    lifestyleFeeling: string;
    productMessage: CommercialProductMessage;
    cameraRhythm: CommercialCameraRhythm;
  }
): CommercialAudienceDesire {
  const ranked = profile.desirePriority
    .map((desire) => ({ desire, score: scoreDesire(desire, profile, input) }))
    .sort((first, second) => (
      second.score - first.score || profile.desirePriority.indexOf(first.desire) - profile.desirePriority.indexOf(second.desire)
    ));
  const selected = ranked[0]?.desire ?? profile.desirePriority[0];
  return COMMERCIAL_AUDIENCE_DESIRES[selected];
}

export function selectCommercialRevealStrategy(
  intent: CommercialIntentId,
  profile: CommercialIntentCreativeProfile,
  creativeCase?: CommercialCreativeCase
): CommercialRevealStrategy {
  if (creativeCase === "PRODUCT_FORWARD") return "IMMEDIATE";
  if (creativeCase === "PROGRESSIVE_DISCOVERY") return "PROGRESSIVE";
  if (creativeCase === "HUMAN_FIRST") return "DELAYED";
  return profile.defaultReveal;
}

export function productPresencePattern(revealStrategy: CommercialRevealStrategy) {
  return [...REVEAL_PRESENCE_PATTERNS[revealStrategy]];
}

export function buildCommercialProductMeaning(input: {
  productMessage: CommercialProductMessage;
  syntheticSituationLine: string;
  desire: CommercialAudienceDesire;
}): CommercialProductMeaning {
  const primary = input.productMessage.supportedDimensions[0];
  if (!primary) {
    return {
      meaning:
        `In this film, the product's role is defined by the selected commercial expression; ${input.desire.viewerOutcomeLine}. Exact product identity is supplied later by the external video-generation references.`,
      roleLine:
        `The product supports the human situation without AURA inventing a color, material, panel, branding, outsole, or construction fact.`,
      externalReferenceRequired: true,
      supportingCoverage: [],
      factBasis: [...input.productMessage.evidenceLines],
      unsupportedClaimGuard:
        "This commercial meaning adds no physical product claim. Use the footwear references uploaded in the external video-generation tool as the only source of product truth.",
    };
  }
  const meaningLine = COMMERCIAL_PRODUCT_MEANING_LINES[primary.coverage];
  return {
    meaning: `In this film, ${meaningLine.meaning}; the product matters because ${input.desire.viewerOutcomeLine}.`,
    roleLine: `${meaningLine.roleLine} as she ${input.syntheticSituationLine}.`,
    externalReferenceRequired: input.productMessage.externalReferenceRequired,
    supportingCoverage: input.productMessage.supportedDimensions.map((dimension) => dimension.coverage),
    factBasis: [...input.productMessage.evidenceLines],
    unsupportedClaimGuard:
      "This commercial meaning adds no physical performance, comfort, durability, fit, material, or construction claim beyond the current confirmed product evidence.",
  };
}

export function buildCommercialPremise(input: {
  intent: CommercialIntentId;
  situationId: CommercialHumanSituationId;
  situationLine: string;
  productMeaning: CommercialProductMeaning;
  desire: CommercialAudienceDesire;
  profile: CommercialIntentCreativeProfile;
}) {
  return {
    id: `premise-${input.intent.toLowerCase()}`,
    situationId: input.situationId,
    desireId: input.desire.id,
    text: [
      `The person ${input.situationLine};`,
      `${input.productMeaning.meaning}`,
      `${input.profile.expressionLine}`,
    ].join(" "),
    sourceFacts: [
      `commercial_intent:${input.intent}`,
      `audience_desire:${input.desire.id}`,
      ...input.productMeaning.supportingCoverage.map((coverage) => `product_coverage:${coverage}`),
    ],
  };
}

function dramaticFunctionFor(
  shotRole: CommercialShotRole,
  revealStrategy: CommercialRevealStrategy,
  presence: CommercialProductPresenceDesign,
  primaryCoverage: ProductCoverage | null
): CommercialDramaticFunction {
  if (shotRole === "RELEASE") return "RESOLVE";
  if (revealStrategy === "IMMEDIATE") {
    if (shotRole === "WORLD") return "ESTABLISH";
    if (shotRole === "DETAIL") return "DISCOVER";
    if (shotRole === "HERO") return "CONFIRM";
    return "CONFIRM";
  }
  if (revealStrategy === "PROGRESSIVE") {
    if (shotRole === "WORLD") return "INVITE";
    if (shotRole === "WEAR") return presence === "CLEAR" ? "CONFIRM" : "DISCOVER";
    if (shotRole === "DETAIL") {
      return /material|heel|outsole|side_panel|toe/.test(primaryCoverage ?? "") ? "CONFIRM" : "DISCOVER";
    }
    if (shotRole === "HERO") return "CONFIRM";
  }
  if (shotRole === "WORLD") return "INVITE";
  if (shotRole === "WEAR") return "INVITE";
  if (shotRole === "DETAIL") return "DISCOVER";
  if (shotRole === "HERO") return "DISCOVER";
  return "CONFIRM";
}

function functionPurpose(
  functionName: CommercialDramaticFunction,
  situationLine: string,
  productRoleLine: string
) {
  switch (functionName) {
    case "ESTABLISH":
      return `Establish the human situation before the product becomes the main question. The person ${situationLine}.`;
    case "INVITE":
      return `Invite the viewer into the human situation while ${productRoleLine}`;
    case "DISCOVER":
      return `Let the product enter attention through the action so that ${productRoleLine}`;
    case "CONFIRM":
      return `Make the product's role clear in the worn moment so that ${productRoleLine}`;
    case "RESOLVE":
      return `Resolve the film through the continuation of the situation rather than introducing a new commercial beat.`;
  }
}

function knowledgeBefore(
  shotIndex: number,
  revealStrategy: CommercialRevealStrategy
) {
  if (shotIndex === 0) return "The viewer knows only the commercial direction and is ready to enter the film.";
  if (revealStrategy === "DELAYED" && shotIndex <= 2) {
    return "The viewer understands the human situation but has only a limited product signal.";
  }
  if (revealStrategy === "PROGRESSIVE" && shotIndex <= 2) {
    return "The viewer has seen the product partially and is beginning to understand how it belongs.";
  }
  return "The viewer understands the human situation and the worn product context.";
}

function knowledgeAfter(
  functionName: CommercialDramaticFunction,
  revealStrategy: CommercialRevealStrategy
) {
  if (functionName === "RESOLVE") return "The viewer leaves with a resolved aftertaste rather than a new question.";
  if (functionName === "ESTABLISH") return "The viewer understands where the film lives and whose day it follows.";
  if (functionName === "INVITE") return "The viewer is inside the moment but has not been asked to inspect the product.";
  if (functionName === "DISCOVER") {
    return revealStrategy === "DELAYED"
      ? "The product becomes unmistakably present through the natural reveal."
      : "One reference-supported product relationship becomes clearer.";
  }
  return "The product's presence and commercial role are clear without becoming a display pose.";
}

function productNarrativeRole(
  presence: CommercialProductPresenceDesign,
  functionName: CommercialDramaticFunction
) {
  const byPresence: Record<CommercialProductPresenceDesign, string> = {
    ABSENT: "The product stays outside this beat while the film establishes human meaning.",
    IMPLIED: "The product is prepared in the viewer's mind through styling, movement, or context without a readable product view.",
    PARTIAL: "A partial product signal contributes to recognition while the human action remains primary.",
    SECONDARY: "The product belongs naturally to the frame but does not lead the beat.",
    CLEAR: "The worn product is clear enough to carry the commercial meaning of the beat.",
  };
  return `${byPresence[presence]} ${functionName === "RESOLVE" ? "The role closes the established meaning rather than adding a new one." : ""}`.trim();
}

function buildContinuity(input: {
  revealStrategy: CommercialRevealStrategy;
  situationLine: string;
  sceneWorldLabel: string;
}): CommercialContinuityReasoning {
  return {
    locationRelationship:
      `Stay inside ${input.sceneWorldLabel} or an immediately adjacent part of the same believable place.`,
    timeRelationship:
      "Keep one continuous 15-second time relationship without an unmotivated time-of-day jump.",
    characterState:
      `The character state evolves from entering the ${input.situationLine} to carrying its outcome.`,
    wardrobe:
      "Keep the same outfit, styling, product, hair, and makeup across all five shots.",
    actionProgression:
      "Each action continues, settles, or follows naturally from the previous physical state.",
    spatialLogic:
      "Use one established camera side and an adjacent spatial anchor progression, never five unrelated locations.",
    emotionalTemperature:
      "Keep the emotional temperature restrained and continuous; the arc changes perception, not performance.",
    productPresenceProgression:
      input.revealStrategy === "IMMEDIATE"
        ? "The product is readable early, then remains naturally present as the human situation develops."
        : input.revealStrategy === "PROGRESSIVE"
          ? "The product becomes progressively clearer through ordinary action and framing."
          : "The film enters the human world first and delivers a strong worn-product read later without breaking comprehension.",
  };
}

export function buildShotStorySpine(input: {
  shotRoles: CommercialShotRole[];
  revealStrategy: CommercialRevealStrategy;
  productPresence: CommercialProductPresenceDesign[];
  primaryCoverage: ProductCoverage | null;
  situationLine: string;
  sceneWorldLabel: string;
  productMeaning: CommercialProductMeaning;
}): {
  shotFunctions: CommercialShotStorySpine[];
  continuity: CommercialContinuityReasoning;
} {
  if (input.shotRoles.length !== 5 || input.productPresence.length !== 5) {
    throw new Error("Commercial Creative Spine requires exactly five shot roles and five product-presence decisions.");
  }
  if (input.productPresence[2] === "ABSENT") {
    throw new Error("DETAIL cannot be ABSENT because it must remain reference-supported.");
  }
  if (input.productPresence[3] !== "CLEAR") {
    throw new Error("HERO must remain CLEAR so the worn product is unmistakable.");
  }
  const continuity = buildContinuity({
    revealStrategy: input.revealStrategy,
    situationLine: input.situationLine,
    sceneWorldLabel: input.sceneWorldLabel,
  });
  const shotFunctions = input.shotRoles.map((shotRole, shotIndex) => {
    const productPresenceDesign = input.productPresence[shotIndex];
    const dramaticFunction = dramaticFunctionFor(
      shotRole,
      input.revealStrategy,
      productPresenceDesign,
      input.primaryCoverage
    );
    const roleLine = productNarrativeRole(productPresenceDesign, dramaticFunction);
    const previous = shotIndex === 0
      ? "The film opens here; this shot establishes the initial human and spatial state."
      : `Continues from shot ${shotIndex}: ${input.shotRoles[shotIndex - 1]} has already established ${
        input.shotRoles[shotIndex - 1] === "DETAIL" ? "the supported product relationship" : "the previous human state"
      }.`;
    const next = shotIndex === input.shotRoles.length - 1
      ? "No further shot follows; the final frame carries the resolved aftertaste."
      : `Prepares shot ${shotIndex + 2}: ${input.shotRoles[shotIndex + 1]} must follow from this exact human and spatial state.`;
    return {
      shotIndex,
      shotRole,
      dramaticFunction,
      narrativePurpose: functionPurpose(dramaticFunction, input.situationLine, input.productMeaning.roleLine),
      audienceKnowledgeBefore: knowledgeBefore(shotIndex, input.revealStrategy),
      audienceKnowledgeAfter: knowledgeAfter(dramaticFunction, input.revealStrategy),
      productPresenceDesign,
      productNarrativeRole: roleLine,
      continuityFromPrevious: previous,
      continuityToNext: next,
      continuity: { ...continuity },
    } satisfies CommercialShotStorySpine;
  });
  return { shotFunctions, continuity };
}

export function renderDramaticFunctionDirection(functionName: CommercialDramaticFunction) {
  const directions: Record<CommercialDramaticFunction, string> = {
    ESTABLISH: "Let the viewer understand where this moment lives before asking them to read the product.",
    INVITE: "Invite the viewer into the human situation without asking them to inspect the product yet.",
    DISCOVER: "Let the product enter the viewer's attention through the real action rather than a display pose.",
    CONFIRM: "Make the product's role clear inside the worn moment without changing the action.",
    RESOLVE: "Close on the result of the preceding moments rather than introducing another commercial beat.",
  };
  return directions[functionName];
}

export function renderProductPresenceDirection(presence: CommercialProductPresenceDesign) {
  const directions: Record<CommercialProductPresenceDesign, string> = {
    ABSENT: "The product is not visible in this shot; the human situation must still belong to the same film.",
    IMPLIED: "Keep the product implied through styling, movement, or context rather than giving it a readable view.",
    PARTIAL: "Show only a partial product signal while the human action remains primary.",
    SECONDARY: "Keep the product naturally present but secondary inside the frame.",
    CLEAR: "Make the worn product clearly readable at natural human scale.",
  };
  return directions[presence];
}
