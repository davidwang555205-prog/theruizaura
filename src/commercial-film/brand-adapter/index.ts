import {
  runCommercialV14Pipeline,
} from "../creative-directing/pipeline";
import type { CommercialV14PipelineOutcome } from "../creative-directing/types";
import {
  renderCommercialFinalDirectorScript,
  renderCommercialFinalSeedancePrompt,
  validateCommercialFinalRender,
} from "../final-renderers";
import { validateCommercialFinalExecutionPlan } from "../final-execution";
import {
  type CommercialFilmPlannerInput,
  type CommercialIntentId,
} from "../types";
import {
  runCommercialFilmPipeline,
  type CommercialFilmPipelineGenerated,
  type CommercialFilmPipelineOutcome,
} from "../pipeline";
import {
  buildCommercialBrandContext,
  renderCommercialBrandContext,
  renderCommercialIntentStrategy,
  type CommercialBrandContextV1,
} from "./brand-context";
import {
  THERUIZ_AURA_INTENT_STRATEGIES_V1,
  type CommercialBrandIntentStrategyV1,
} from "./intent-strategy";
import {
  THERUIZ_AURA_COMMERCIAL_WARDROBE_STYLES,
  type CommercialWardrobeStyle,
  type CommercialWardrobeStyleId,
} from "./wardrobe";

export { THERUIZ_AURA_INTENT_STRATEGIES_V1 } from "./intent-strategy";
export type { CommercialBrandIntentStrategyV1 } from "./intent-strategy";
export type { CommercialBrandContextV1 } from "./brand-context";
export { buildCommercialBrandContext, renderCommercialBrandContext, renderCommercialIntentStrategy };
export { resolveCommercialWardrobe, THERUIZ_AURA_COMMERCIAL_WARDROBE_STYLES } from "./wardrobe";
export type { CommercialWardrobeStyleId, CommercialWardrobeStyle, CommercialWardrobeResolution } from "./wardrobe";

/**
 * Runtime translation boundary for the human-readable THERUIZ AURA Brand Pack.
 * This adapter maps Brand Pack and Intent Strategy into the existing Brand
 * Context and renderer policy; it does not edit the planner, Event Spine,
 * Product Visibility, or validators.
 */
export type CommercialBrandPackV1 = {
  id: "THERUIZ_AURA_BRAND_PACK_V1";
  brand: "THERUIZ AURA";
  positioning: "Quiet Warm Luxury / 温感静奢";
  traits: readonly ["warm", "restrained", "relaxed", "real", "mature", "tactile", "effortlessly composed"];
  emotionalTerritory: string;
  visualAgeRange: { min: 25; max: 46 };
  visualLanguage: {
    world: string;
    lighting: string;
    cameraFeeling: string;
    color: string;
    forbiddenStyles: readonly string[];
  };
  productTruth: {
    productCategory: string;
    allowedClaimRule: string;
    authority: string;
    forbiddenClaims: readonly string[];
    engineCoreExclusions: readonly string[];
  };
  approvedIntents: readonly CommercialIntentId[];
  intentStrategies: Readonly<Record<CommercialIntentId, CommercialBrandIntentStrategyV1>>;
  wardrobeStyles: Readonly<Record<CommercialWardrobeStyleId, CommercialWardrobeStyle>>;
};

export const THERUIZ_AURA_BRAND_PACK_V1: CommercialBrandPackV1 = {
  id: "THERUIZ_AURA_BRAND_PACK_V1",
  brand: "THERUIZ AURA",
  positioning: "Quiet Warm Luxury / 温感静奢",
  traits: ["warm", "restrained", "relaxed", "real", "mature", "tactile", "effortlessly composed"],
  emotionalTerritory: "Warm, calm, self-possessed ease within believable city life.",
  visualAgeRange: { min: 25, max: 46 },
  visualLanguage: {
    world: "Lived-in urban thresholds, interiors, work surfaces, and restrained real spaces.",
    lighting: "Motivated daylight or restrained warm-grey directional light.",
    cameraFeeling: "Observational, grounded, and unobtrusive; movement follows visible action.",
    color: "Low-saturation warm neutrals with restrained contrast; never recolor the SKU.",
    forbiddenStyles: [
      "influencer posing or direct-to-camera performance",
      "childlike styling or mannequin-like posing",
      "generic luxury symbols or runway spectacle",
      "high-energy sports advertising or abstract fashion-film imagery",
      "hard-sell catalogue posing, plastic skin, or glossy CGI polish",
      "unmotivated neon, exaggerated lens effects, or fabricated product lettering",
    ],
  },
  productTruth: {
    productCategory: "German Trainer / Leather Lifestyle Sneaker; category-level context only, with no specific SKU identified.",
    allowedClaimRule: "The brand default may identify only the German Trainer / Leather Lifestyle Sneaker category. Functional, material-detail, process, origin, and performance claims need approved SKU-specific evidence and wording.",
    authority: "Use the AURA category context only for general brand scripts. Use current-task confirmed SKU references and approved SKU-specific evidence for all SKU identity and physical product details.",
    forbiddenClaims: [
      "comfort, all-day comfort, or fatigue reduction",
      "medical, corrective, or pain-relief effects",
      "traction, waterproofing, breathability, durability, or performance guarantees",
      "unverified material, construction, origin, process, certification, or environmental claims",
    ],
    engineCoreExclusions: [
      "high-energy sports commercial",
      "luxury cliché",
      "runway spectacle",
      "fashion-film abstraction",
      "loud logo advertising",
    ],
  },
  approvedIntents: [
    "QUIET_LUXURY",
    "URBAN_MOTION",
    "DAILY_STYLING",
    "PRODUCT_CRAFT",
    "NEW_ARRIVAL",
  ],
  intentStrategies: THERUIZ_AURA_INTENT_STRATEGIES_V1,
  wardrobeStyles: THERUIZ_AURA_COMMERCIAL_WARDROBE_STYLES,
};

export type CommercialBrandSelection = "THERUIZ_AURA" | null;

export const DEFAULT_COMMERCIAL_BRAND_SELECTION: CommercialBrandSelection = "THERUIZ_AURA";

export function loadCommercialBrandPack(
  selection: CommercialBrandSelection
): CommercialBrandPackV1 | undefined {
  return selection === "THERUIZ_AURA" ? THERUIZ_AURA_BRAND_PACK_V1 : undefined;
}

export type SkuApprovedSellingPoint = {
  claim: string;
  skuId: string;
  evidenceId: string;
  approvalStatus: "approved" | "unapproved";
};

export type CommercialBrandAdapterInput = {
  brandPack?: CommercialBrandPackV1;
  request: CommercialFilmPlannerInput;
  caseContext: string;
  currentSkuId?: string;
  skuSellingPoints?: SkuApprovedSellingPoint[];
  styleId?: CommercialWardrobeStyleId;
};

export type CommercialBrandAdapterAudit = {
  packId: CommercialBrandPackV1["id"] | null;
  brandApplied: boolean;
  intent: CommercialIntentId;
  intentStrategyId: CommercialIntentId | null;
  wardrobeStyleId: CommercialWardrobeStyleId | null;
  injectedField: "none" | "lifestyleFeeling + final-render-policy";
  injectedPolicySections: string[];
  finalPromptPolicySections: string[];
  approvedSellingPointsPassed: string[];
  rejectedSellingPoints: string[];
  referenceObjectPreserved: boolean;
};

export type CommercialBrandAdapterRun = {
  outcome: CommercialV14PipelineOutcome;
  baseOutcome: CommercialFilmPipelineOutcome;
  brandContext: CommercialBrandContextV1 | null;
  intentStrategy: CommercialBrandIntentStrategyV1 | null;
  audit: CommercialBrandAdapterAudit;
  checks: {
    status: "PASS" | "FAIL";
    id: string;
    issue: string | null;
  }[];
};

function assertInput(input: CommercialBrandAdapterInput, pack: CommercialBrandPackV1) {
  if (!pack.approvedIntents.includes(input.request.commercialIntent)) {
    throw new Error(`Brand Pack ${pack.id} does not approve ${input.request.commercialIntent}.`);
  }
  if (!pack.intentStrategies[input.request.commercialIntent]) {
    throw new Error(`Brand Pack ${pack.id} has no Intent Strategy for ${input.request.commercialIntent}.`);
  }
  if (!input.caseContext.trim()) {
    throw new Error("A case-specific scene context is required for Brand Pack injection.");
  }
  const ageMatch = input.request.characterSelection.ageProfileId.match(/age_(\d+)_(\d+)/);
  if (ageMatch) {
    const ageMin = Number(ageMatch[1]);
    const ageMax = Number(ageMatch[2]);
    if (ageMin < pack.visualAgeRange.min || ageMax > pack.visualAgeRange.max) {
      throw new Error(
        `Character visual age ${ageMin}-${ageMax} falls outside Brand Pack range ${pack.visualAgeRange.min}-${pack.visualAgeRange.max}.`
      );
    }
  }
}

function approvedSellingPoints(points: SkuApprovedSellingPoint[] = [], currentSkuId?: string) {
  const accepted = points
    .filter((point) => point.approvalStatus === "approved"
      && Boolean(currentSkuId?.trim())
      && point.skuId.trim() === currentSkuId?.trim()
      && point.evidenceId.trim())
    .map((point) => point.claim.trim())
    .filter(Boolean);
  const rejected = points
    .filter((point) => point.approvalStatus !== "approved"
      || !currentSkuId?.trim()
      || point.skuId.trim() !== currentSkuId?.trim()
      || !point.evidenceId.trim())
    .map((point) => point.claim.trim())
    .filter(Boolean);
  return {
    accepted: [...new Set(accepted)],
    rejected: [...new Set(rejected)],
  };
}

export function adaptCommercialBrandPackInput(input: CommercialBrandAdapterInput) {
  const pack = input.brandPack;
  if (!pack) {
    if (input.styleId) throw new Error("A Commercial wardrobe Style requires the THERUIZ AURA Brand Pack.");
    return {
      pack: null,
      request: input.request,
      injectedSections: [],
      brandContext: null,
      intentStrategy: null,
      wardrobe: null,
      acceptedSellingPoints: [],
      rejectedSellingPoints: [],
      sourceReference: input.request.reference,
    };
  }
  assertInput(input, pack);

  const approved = approvedSellingPoints(input.skuSellingPoints, input.currentSkuId);
  const intentStrategy = pack.intentStrategies[input.request.commercialIntent];
  const brandContext = buildCommercialBrandContext({
    pack,
    caseContext: input.caseContext,
    intentStrategy,
    commercialIntent: input.request.commercialIntent,
    generationNonce: input.request.generationNonce,
    season: input.request.season,
    styleId: input.styleId,
    approvedSellingPoints: approved.accepted,
  });
  const injectedSections = renderCommercialBrandContext(brandContext);
  const request: CommercialFilmPlannerInput = {
    ...input.request,
    lifestyleFeeling: injectedSections.join(" "),
    // Pack-level allowed-claim rules are not SKU selling points. Only claims
    // with explicit SKU, evidence, and approval metadata may enter the engine.
    confirmedBrandSellingPoints: approved.accepted,
  };

  return {
    pack,
    request,
    injectedSections,
    brandContext,
    intentStrategy,
    wardrobe: brandContext.wardrobe,
    acceptedSellingPoints: approved.accepted,
    rejectedSellingPoints: approved.rejected,
    sourceReference: input.request.reference,
  };
}

function includesEvery(haystack: string[], needles: readonly string[]) {
  return needles.every((needle) => haystack.includes(needle));
}

export function runCommercialFilmWithBrandPack(
  input: CommercialBrandAdapterInput,
  baseOutcomeOverride?: CommercialFilmPipelineGenerated
): CommercialBrandAdapterRun {
  const adapted = adaptCommercialBrandPackInput(input);
  const baseOutcome = baseOutcomeOverride ?? runCommercialFilmPipeline(adapted.request);
  const pipelineOutcome: CommercialV14PipelineOutcome = baseOutcome.status === "GENERATED"
    ? runCommercialV14Pipeline(adapted.request, baseOutcome)
    : {
      status: "BLOCKED",
      code: "V13_BASELINE_BLOCKED",
      reason: baseOutcome.reason,
      diagnostics: baseOutcome.diagnostics,
    };
  let outcome = pipelineOutcome;
  let finalPromptPolicySections: string[] = [];

  if (pipelineOutcome.status === "GENERATED" && adapted.pack) {
    const originalFinalPlan = pipelineOutcome.plan.finalExecutionPlan;
    const pack = adapted.pack;
    const visualPolicy = [
      `Brand direction: ${pack.brand} expresses ${pack.positioning}; ${pack.traits.join(", ")}.`,
      `Emotional territory: ${pack.emotionalTerritory}`,
      `World: ${pack.visualLanguage.world}`,
      `Lighting: ${pack.visualLanguage.lighting}`,
      `Camera: ${pack.visualLanguage.cameraFeeling}`,
      `Color: ${pack.visualLanguage.color}`,
      ...adapted.brandContext!.wardrobe.visualLines,
    ];
    const intentStrategyPolicy = adapted.intentStrategy
      ? renderCommercialIntentStrategy(adapted.intentStrategy)
      : [];
    const claimPolicy = [
      `Product category: ${pack.productTruth.productCategory}`,
      `Allowed product claims: ${pack.productTruth.allowedClaimRule}`,
      `Product Truth authority: ${pack.productTruth.authority}`,
      ...pack.productTruth.forbiddenClaims.map((claim) => `Do not make an unverified claim about ${claim}.`),
    ];
    const negativePolicy = [
      ...pack.visualLanguage.forbiddenStyles.map((style) => `Do not use ${style}.`),
      ...adapted.brandContext!.wardrobe.negativeLines,
    ];
    finalPromptPolicySections = [...visualPolicy, ...intentStrategyPolicy, ...claimPolicy, ...negativePolicy];

    // Keep the Engine-authored physical plan intact and add Brand Pack rules
    // only to renderer policy, then rerun both existing gates.
    const adaptedFinalPlan = validateCommercialFinalExecutionPlan({
      ...originalFinalPlan,
      renderPolicy: {
        ...originalFinalPlan.renderPolicy,
        visualLookLines: [...new Set([...originalFinalPlan.renderPolicy.visualLookLines, ...visualPolicy, ...intentStrategyPolicy])],
        productProtectionLines: [...new Set([...originalFinalPlan.renderPolicy.productProtectionLines, ...claimPolicy])],
        negativeLines: [...new Set([...originalFinalPlan.renderPolicy.negativeLines, ...negativePolicy])],
      },
    });
    const directorScript = renderCommercialFinalDirectorScript(adaptedFinalPlan);
    const seedancePrompt = renderCommercialFinalSeedancePrompt(adaptedFinalPlan);
    const renderValidation = validateCommercialFinalRender({
      plan: adaptedFinalPlan,
      directorScript,
      seedancePrompt,
    });
    outcome = {
      ...pipelineOutcome,
      plan: {
        ...pipelineOutcome.plan,
        finalExecutionPlan: adaptedFinalPlan,
        directorScript,
        seedancePrompt,
        renderValidation,
      },
    };
  }

  const checks: CommercialBrandAdapterRun["checks"] = [];
  const addCheck = (id: string, passed: boolean, issue: string) => {
    checks.push({ status: passed ? "PASS" : "FAIL", id, issue: passed ? null : issue });
  };

  if (outcome.status === "GENERATED" && adapted.pack) {
    const plan = outcome.plan.basePlan;
    const mood = plan.brandMood;
    const prompt = outcome.plan.seedancePrompt;
    const expectedAttributes = ["quiet", "warm", "restrained", "natural", "material-aware"];
    const packClaimsAreBound = plan.productMessage.confirmedBrandSellingPoints.every((claim) =>
      adapted.acceptedSellingPoints.includes(claim)
    );
    const rejectedClaimsStayedOut = adapted.rejectedSellingPoints.every((claim) =>
      !plan.productMessage.confirmedBrandSellingPoints.includes(claim)
    );
    const allCoreExclusionsMapped = includesEvery(
      mood.prohibitedDirections,
      adapted.pack.productTruth.engineCoreExclusions
    );
    const expectedRoles = ["WORLD", "WEAR", "DETAIL", "HERO", "RELEASE"];
    const actualRoles = plan.shotArchitecture.shots.map((shot) => shot.role);
    const finalRenderedTexts = [outcome.plan.seedancePrompt.text, outcome.plan.directorScript.text];
    const allPackRulesReachedFinalPrompt = finalPromptPolicySections.every((section) =>
      finalRenderedTexts.some((text) => text.includes(section))
    );
    const allIntentStrategyRulesReachedFinalPrompt = (adapted.intentStrategy
      ? renderCommercialIntentStrategy(adapted.intentStrategy)
      : []).every((section) => finalRenderedTexts.some((text) => text.includes(section)));
    const visibilityTimeline = outcome.plan.finalExecutionPlan.productVisibility.timeline;
    const hasReadableProductBeat = visibilityTimeline.some((beat) =>
      ["READABLE", "DETAIL", "HERO"].includes(beat.normalizedState)
    );
    const hasProductDetailBeat = visibilityTimeline.some((beat) =>
      beat.sourceLegacyLevel === "PRODUCT_DETAIL" || beat.normalizedState === "DETAIL"
    );
    const promptBeforeNegatives = prompt.text.split("[NEGATIVES]")[0] ?? prompt.text;
    const forbiddenStylePromoted = /influencer posing|direct-to-camera performance|childlike styling|mannequin-like posing|generic luxury symbols|runway spectacle|high-energy sports advertising|abstract fashion-film imagery|hard-sell catalogue posing|plastic skin|glossy CGI polish|unmotivated neon|exaggerated lens effects|fabricated product lettering/i.test(promptBeforeNegatives);
    addCheck("brand_positioning", mood.id === "THERUIZ_AURA_QUIET_WARM_LUXURY", "Engine brand mood does not match Quiet Warm Luxury.");
    addCheck("brand_traits", expectedAttributes.every((trait) => mood.attributes.includes(trait as typeof mood.attributes[number])), "Engine brand mood is missing a required Brand Pack trait.");
    addCheck("forbidden_visual_core", allCoreExclusionsMapped, "One or more Brand Pack core visual exclusions are absent from the Engine mood contract.");
    addCheck("product_claim_authority", packClaimsAreBound, "An unapproved or un-evidenced claim entered the product message.");
    addCheck("unauthorized_claims_filtered", rejectedClaimsStayedOut, "A rejected claim entered the product message.");
    addCheck("product_reference_preserved", outcome.baseOutcome.request.reference === adapted.sourceReference, "Brand Adapter changed the task Product Truth reference object.");
    addCheck("five_role_prompt", expectedRoles.every((role, index) => actualRoles[index] === role), "Generated plan does not preserve the five Commercial Film roles.");
    addCheck("product_readability", hasReadableProductBeat, "No direct product-readable state appears in the final visibility timeline.");
    if (input.request.commercialIntent === "PRODUCT_CRAFT") {
      addCheck("product_detail_visibility", hasProductDetailBeat, "PRODUCT_CRAFT does not reach PRODUCT_DETAIL/DETAIL in the authoritative visibility timeline.");
    }
    addCheck("no_forbidden_style_promoted", !forbiddenStylePromoted, "A prohibited visual style is promoted in the generated prompt body.");
    addCheck("final_execution_plan", outcome.plan.finalExecutionPlan.status === "VALID", "Final Execution Plan is not VALID.");
    addCheck(
      "prompt_contract",
      prompt.status === "GENERATED"
        && outcome.plan.renderValidation.status === "VALID"
        && outcome.plan.renderValidation.checks.every((check) => check.status === "PASS")
        && prompt.text.trim().length > 0,
      "Final prompt is missing or failed the existing final-renderer contract."
    );
    addCheck(
      "product_claim_fence",
      plan.productMessage.prohibitedClaims.some((claim) => /comfort/i.test(claim))
        && plan.productMessage.prohibitedClaims.some((claim) => /performance/i.test(claim)),
      "Existing product message does not carry the comfort/performance claim fence."
    );
    addCheck(
      "brand_pack_prompt_injection",
      allPackRulesReachedFinalPrompt,
      "One or more Brand Pack visual or product-claim rules did not reach the final rendered prompt."
    );
    addCheck(
      "intent_strategy_prompt_injection",
      allIntentStrategyRulesReachedFinalPrompt,
      "One or more Commercial Intent strategy rules did not reach the final rendered prompt."
    );
  } else if (outcome.status === "BLOCKED") {
    addCheck("engine_generated", false, `${outcome.code}: ${outcome.reason}`);
  } else {
    addCheck("legacy_passthrough", true, "No Brand Pack was selected; the original request was passed through unchanged.");
  }

  return {
    outcome,
    baseOutcome,
    brandContext: adapted.brandContext,
    intentStrategy: adapted.intentStrategy,
    audit: {
      packId: adapted.pack?.id ?? null,
      brandApplied: adapted.pack !== null,
      intent: adapted.request.commercialIntent,
      intentStrategyId: adapted.intentStrategy ? adapted.request.commercialIntent : null,
      wardrobeStyleId: adapted.wardrobe?.styleId ?? null,
      injectedField: adapted.pack ? "lifestyleFeeling + final-render-policy" : "none",
      injectedPolicySections: adapted.injectedSections,
      finalPromptPolicySections,
      approvedSellingPointsPassed: adapted.acceptedSellingPoints,
      rejectedSellingPoints: adapted.rejectedSellingPoints,
      referenceObjectPreserved: outcome.status === "GENERATED"
        ? outcome.baseOutcome.request.reference === adapted.sourceReference
        : true,
    },
    checks,
  };
}
