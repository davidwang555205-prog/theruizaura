import type { PromptRule, PromptProfileInput, PromptSection } from "./contracts";
import { PromptPriority } from "./contracts";
import { COMPOSITION_PROFILES } from "./profiles/compositionProfiles";
import { IMAGE_TYPE_PROFILES } from "./profiles/imageTypeProfiles";
import { SCENE_PROFILES } from "./profiles/sceneProfiles";
import { buildNonProductAtmospherePlan } from "../non-product-atmosphere";
import { getTheruizAuraRealismRules } from "./profiles/theruizAuraRealismProfiles";
import { getTheruizAuraConsumerTrustRules } from "./profiles/theruizAuraConsumerTrustProfiles";
import { getTeamModelProfile } from "../data/teamModelProfiles";
import { getActivePromptRegistryEntry } from "../visual-system/activePromptRegistry";
import { resolveTopicRoute } from "../visual-system/topicRoutingRegistry";
import { productTruthPromptLines } from "../visual-system/taskReferenceBinding";
import { cameraPerspectiveLine, resolveCameraPerspectiveProfile } from "../utils/cameraPerspectiveProfiles";

const ACTIVE_ROLE_DIRECTIVES: Record<string, string> = {
  A1: "Active visual role: relaxed daily-life framing with natural body weight, believable daylight, and a readable sneaker inside an ordinary lived-in scene.",
  A2: "Active visual role: transitional urban movement near a threshold with credible weight transfer and observational composition.",
  A3: "Active visual role: interior daily-life moment with tactile relationships between person, clothing, furniture, and product plus one believable small action.",
  B3: "Active visual role: official studio front full-body composition with clean silhouette separation, natural scale, readable floor contact, and restrained studio light.",
  B4: "Active visual role: official studio three-quarter composition with relaxed weight transfer, complete outfit balance, and structurally readable sneaker silhouette.",
  C1: "Active visual role: complete lateral product profile with toe-to-heel structure, quiet surface, and plausible contact shadow.",
  C2: "Active visual role: natural on-foot detail with clear shoe-to-floor and garment relationships.",
  C3: "Active visual role: restrained paired-product still life with accurate scale, deliberate spacing, tactile material contrast, and grounded contact shadows.",
  C4: "Active visual role: material-craft close-up focused on heel, collar, stitching, material boundary, and outsole termination.",
  C5: "Active visual role: true overhead top-down product evidence with toe box, tongue, laces, panel geometry, and consistent material detail fully readable."
};

// ─── Global hard rules (P0-P2) ──────────────────────────────
const GLOBAL_HARD_RULES: PromptRule[] = [
  {
    id: "shoe-visibility-at-least-one",
    section: "product",
    text: "Keep at least one sneaker fully visible from toe to heel, with the second clearly readable and grounded.",
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "product-profile",
    appliesWhen: { hasShoe: true },
    required: true,
    tags: ["product", "visibility"],
  },
  {
    id: "shoe-clipping-prevention",
    section: "product",
    text: "Keep the foot seated inside the shoe; ankle, garment hem, collar, tongue, tied laces, outsole, and floor stay separate and readable with no clipping or fabric fusion.",
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "product-profile",
    appliesWhen: { hasShoe: true },
    required: true,
    tags: ["product", "clipping"],
  },
  {
    id: "shoe-on-foot-material-response",
    section: "product",
    text: "When worn, allow only subtle forefoot upper flex, gentle collar compression, settled laces, and grounded contact shadow; never let the foot, pose, or fabric reshape the toe box, panels, outsole, or silhouette.",
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "product-profile",
    appliesWhen: { hasShoe: true, compositionModes: ["fullFigure", "studioLowerThird", "studioThreeQuarter", "onFootLifestyle", "mirrorFull", "mirrorThreeQuarter"] },
    required: true,
    tags: ["product", "worn"],
  },
  {
    id: "model-identity-real-person",
    section: "model",
    text: "Make the woman feel like a real person in a natural daily moment, not a mannequin, fashion dummy, plastic model, over-posed influencer, or showroom character.",
    priority: PromptPriority.P2_IDENTITY_CONTINUITY,
    source: "identity-profile",
    appliesWhen: { compositionModes: ["fullFigure", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
    tags: ["model", "realism"],
  },
  {
    id: "model-real-human-detail",
    section: "model",
    text: "Add subtle real-life human details: natural hair texture, slight fabric movement, relaxed shoulders, soft facial tension, natural hand position, believable bag weight, small posture asymmetry, and normal daily imperfection.",
    priority: PromptPriority.P2_IDENTITY_CONTINUITY,
    source: "identity-profile",
    appliesWhen: { compositionModes: ["fullFigure", "mirrorFull", "mirrorThreeQuarter", "onFootLifestyle"] },
    tags: ["model", "detail"],
  },
];

// ─── Composition-specific rules ──────────────────────────────
const COMPOSITION_RULES: Record<string, PromptRule[]> = {
  fullFigure: [
    {
      id: "full-figure-body-reference",
      section: "scene",
      text: "Frame the same person head-to-toe at eye-level viewpoint with complete outfit proportions, both sneakers fully readable, and enough clean space around the figure.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["fullFigure"] },
      tags: ["composition", "full-figure"],
    },
  ],
  studioLowerThird: [
    {
      id: "lower-third-crop-no-face",
      section: "model",
      text: "Crop from the waist or upper thigh to the floor. Do not load facial identity, eye direction, hairstyle, or upper-body expression rules.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["studioLowerThird"] },
      required: true,
      conflictsWith: ["model-identity-real-person", "model-real-human-detail"],
      tags: ["composition", "lower-third"],
    },
    {
      id: "lower-third-stable-feet",
      section: "action",
      text: "Keep both legs natural and parallel with a small weight shift. Make garment hem, shoe collar, toe box, laces, outsole, and ground contact easy to judge.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["studioLowerThird"] },
      tags: ["composition", "feet"],
    },
  ],
  studioOnFootDetail: [
    {
      id: "on-foot-detail-no-identity",
      section: "model",
      text: "Use a controlled close framing from mid-calf or garment edge to the floor. Do not load person identity, face, expression, or hairstyle rules.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["studioOnFootDetail"] },
      required: true,
      conflictsWith: ["model-identity-real-person", "model-real-human-detail"],
      tags: ["composition", "on-foot"],
    },
  ],
  mirrorFull: [
    {
      id: "mirror-phone-identity",
      section: "model",
      text: "The face should be hidden by the phone or naturally cropped; do not require direct eye contact. Keep the outfit, body posture, and shoe relationship more important than the face.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["mirrorFull", "mirrorThreeQuarter"] },
      required: true,
      tags: ["composition", "mirror"],
    },
  ],
  stillLife: [
    {
      id: "still-life-no-person",
      section: "model",
      text: "Do not load any person, model, face, portrait, body proportion, or action rules. The product is the absolute subject.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["stillLife"] },
      required: true,
      conflictsWith: ["model-identity-real-person", "model-real-human-detail"],
      tags: ["composition", "still-life"],
    },
  ],
  materialDetail: [
    {
      id: "material-detail-no-person",
      section: "model",
      text: "Do not load any person, face, or full-shoe product rules. Focus on the exact material zone, surface finish, stitching relationship, and panel transition shown in the confirmed references.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["materialDetail"] },
      required: true,
      conflictsWith: ["model-identity-real-person", "model-real-human-detail", "product-accuracy-uploaded-reference"],
      tags: ["composition", "material"],
    },
  ],
  atmosphere: [
    {
      id: "atmosphere-no-product-hero",
      section: "product",
      text: "The product does not need to be the main subject. Express quiet order, warm restraint, daily elegance, calm negative space, and refined lifestyle atmosphere.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["atmosphere"] },
      required: true,
      conflictsWith: ["product-accuracy-uploaded-reference", "shoe-visibility-at-least-one"],
      tags: ["composition", "atmosphere"],
    },
    {
      id: "atmosphere-no-person",
      section: "model",
      text: "Do not load person, model, face, or portrait rules. Express the scene through still-life details, spatial cues, and quiet daily traces.",
      priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
      source: "composition-profile",
      appliesWhen: { compositionModes: ["atmosphere"] },
      required: true,
      conflictsWith: ["model-identity-real-person", "model-real-human-detail"],
      tags: ["composition", "atmosphere"],
    },
  ],
};

// ─── Negative rules ──────────────────────────────────────────
const GLOBAL_NEGATIVE_RULES: PromptRule[] = [
  {
    id: "negative-product-protection",
    section: "negative",
    text: "Avoid hard flash, flat catalog flash, blown white background, CGI cyclorama, synthetic 3D render, floating feet, floating sneakers, plastic skin, over-smooth AI face.",
    priority: PromptPriority.P7_LOW_PRIORITY_NEGATIVE,
    source: "negative-default",
    appliesWhen: {},
    tags: ["negative", "general"],
  },
  {
    id: "negative-brand-protection",
    section: "negative",
    text: "Avoid visible brand logo, brand lettering, readable fake brand text, luxury fashion house visual cues, influencer-brand aesthetic.",
    priority: PromptPriority.P7_LOW_PRIORITY_NEGATIVE,
    source: "negative-default",
    appliesWhen: {},
    tags: ["negative", "brand"],
  },
  {
    id: "negative-fashion-campaign",
    section: "negative",
    text: "Avoid influencer posing, beauty-ad eye contact, hard model stare, staged fashion mood, over-styled commercial energy.",
    priority: PromptPriority.P7_LOW_PRIORITY_NEGATIVE,
    source: "negative-default",
    appliesWhen: { compositionModes: ["fullFigure", "onFootLifestyle", "mirrorFull", "mirrorThreeQuarter"] },
    tags: ["negative", "style"],
  },
];

export function collectPromptRules(input: PromptProfileInput): PromptRule[] {
  if (input.brandId === "theruiz_aura" && input.imageType === "非产品氛围图") {
    const atmosphere = buildNonProductAtmospherePlan({
      quantity: 1,
      generationNonce: input.generationNonce,
      season: input.season,
      scenePreference: input.scenePreference,
      taskId: `prompt-builder-${input.generationNonce}`,
      referenceAssetIds: input.productTruthProvenance?.assetIds ?? [],
      referenceImageCount: input.productTruthProvenance?.assetIds.length ?? 0,
      previewWithoutReference: true,
      productPresenceMode: input.atmosphereProductPresenceMode,
      productPaletteEchoMode: input.atmosphereProductPaletteEchoMode,
      productPaletteClass: input.atmosphereProductPaletteClass,
      sceneDirective: input.actionLock,
    });
    return [{
      id: "theruiz-atmosphere-shared-compiler",
      section: "scene",
      text: atmosphere.images[0].prompt,
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "brand-profile",
      appliesWhen: {},
      required: true,
      tags: ["theruiz-aura", "atmosphere", "shared-compiler", "image2"]
    }];
  }
  const rules: PromptRule[] = [];

  if (input.hasShoe) rules.push({ id: "product-accuracy-current-task-reference", section: "product", text: productTruthPromptLines(input.selectedProductTruth).join(" "), priority: PromptPriority.P1_PRODUCT_HARD_LOCK, source: "product-profile", appliesWhen: {}, required: true, tags: ["product", "accuracy", "current-task"] });

  if (input.topicId) resolveTopicRoute(input.topicId === "studio_launch_shoot" ? "棚内上新拍摄" : input.topicId === "lifestyle_soft_seeding" ? "生活场景软种草" : input.topicId);
  if (input.activeVisualRoleId) {
    const entry = getActivePromptRegistryEntry(input.activeVisualRoleId);
    rules.push({
      id: `active-visual-role-${entry.role}`,
      section: "brand",
      text: ACTIVE_ROLE_DIRECTIVES[entry.role],
      priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
      source: "theme-card",
      appliesWhen: {},
      required: true,
      tags: ["active-prompt-registry", "image2", entry.activeSelection]
    });
  }

  const peopleImage = ["产品上脚图", "对镜穿搭图", "生活场景图"].includes(input.imageType);
  if (input.hasShoe && peopleImage) {
    const cameraProfile = resolveCameraPerspectiveProfile(
      input.imageType,
      [input.actionLock, input.userExtraRequirement, input.cardFraming, input.cardOrientation].filter(Boolean).join(" ")
    );
    rules.push({
      id: `camera-perspective-${cameraProfile.id}`,
      section: "camera",
      text: cameraPerspectiveLine(cameraProfile),
      priority: PromptPriority.P5_REALISM_AND_CAMERA,
      source: "camera-profile",
      appliesWhen: {},
      required: true,
      tags: ["camera", "shoe-scale", cameraProfile.risk]
    });
  }
  const identityVisible = !["studioOnFootDetail", "studioLowerThird", "stillLife", "materialDetail", "atmosphere"].includes(input.compositionMode);
  const modelProfile = input.modelChoice ? getTeamModelProfile(input.modelChoice) : null;
  const modelSelectionRule: PromptRule | null = modelProfile ? {
    id: `model-selection-${input.modelChoice}`,
    section: "model",
    text: modelProfile.promptLine,
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "identity-profile",
    appliesWhen: {},
    required: true,
    tags: ["model", "selection", "user-specified"]
  } : null;
  const modelSelectionNegativeRule: PromptRule | null = modelProfile ? {
    id: `model-selection-negative-${input.modelChoice}`,
    section: "negative",
    text: `Avoid ${modelProfile.negativePhrases.join(", ")}.`,
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "identity-profile",
    appliesWhen: {},
    required: true,
    tags: ["model", "selection", "negative"]
  } : null;
  if (peopleImage && identityVisible && modelSelectionRule && modelSelectionNegativeRule) {
    rules.push(modelSelectionRule, modelSelectionNegativeRule);
  }

  // 1. Global hard rules
  for (const rule of GLOBAL_HARD_RULES) {
    if (matchesPredicate(rule.appliesWhen, input)) rules.push(rule);
  }

  // 2. Composition rules
  const profile = COMPOSITION_PROFILES[input.compositionMode];
  if (profile) {
    for (const rule of profile.rules) {
      if (matchesPredicate(rule.appliesWhen, input)) rules.push(rule);
    }
  }

  // 2b. Image type rules
  const imgProfile = IMAGE_TYPE_PROFILES[input.imageType];
  if (imgProfile) {
    for (const rule of imgProfile.rules) {
      if (matchesPredicate(rule.appliesWhen, input)) rules.push(rule);
    }
  }

  // 2c. Scene rules
  if (input.sceneKey) {
    const sceneProfile = SCENE_PROFILES[input.sceneKey];
    if (sceneProfile) {
      for (const rule of sceneProfile.rules) {
        if (matchesPredicate(rule.appliesWhen, input)) rules.push(rule);
      }
    }
  }

  // 3. Global negative rules
  for (const rule of GLOBAL_NEGATIVE_RULES) {
    if (matchesPredicate(rule.appliesWhen, input)) rules.push(rule);
  }

  // 4. The deterministic outfit selection is part of the execution contract.
  // Keep it explicit so prompt budgeting cannot reduce it to a generic outfit cue.
  if (input.selectedOutfitLine?.trim()) {
    rules.push({
      id: "styling-selected-outfit",
      section: "styling",
      text: input.selectedOutfitLine.trim(),
      priority: PromptPriority.P2_IDENTITY_CONTINUITY,
      source: "styling-profile",
      appliesWhen: {},
      required: true,
      tags: ["styling", "outfit", "deterministic"],
    });
  }

  // 5. User extra requirement
  if (input.userExtraRequirement.trim()) {
    rules.push({
      id: "user-extra-requirement",
      section: "scene",
      text: input.userExtraRequirement.trim(),
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "user-extra-requirement",
      appliesWhen: {},
      required: true,
      tags: ["user"],
    });
  }

  // Add brand-scoped realism rules after the established blocks so explicit
  // conflicts replace legacy defaults instead of being kept behind them.
  rules.push(...getTheruizAuraRealismRules(input));
  rules.push(...getTheruizAuraConsumerTrustRules(input));

  if (peopleImage && input.seriesImageCount && input.seriesImageCount > 1 && Number.isInteger(input.seriesImageIndex)) {
    const index = input.seriesImageIndex! + 1;
    const count = input.seriesImageCount;
    rules.push({
      id: "card-series-context",
      section: "continuity",
      text: `This is image ${index} of ${count}. Preserve the same selected person, outfit, sneaker, and ${input.sceneLock ? "locked scene" : "scene continuity"}; vary only the card-specific framing, orientation, action phase, gaze, and expression.`,
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "theme-card",
      appliesWhen: {},
      required: true,
      tags: ["card", "continuity", "multi-image"]
    });
  }

  if (peopleImage && input.seriesFaceVariation?.line) {
    rules.push({
      id: `card-face-variation-${input.seriesFaceVariation.id}`,
      section: "model",
      text: `Face variation lock for this card (${input.seriesFaceVariation.id}): ${input.seriesFaceVariation.line} Keep the same person identity, but do not reuse the previous face-visible card's gaze target, eyelid tension, mouth state, or head angle.`,
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "theme-card",
      appliesWhen: {},
      required: true,
      tags: ["card", "face-variation", "series"]
    });
  }

  if (input.actionLock && peopleImage) {
    rules.push({
      id: "card-action-lock",
      section: "action",
      text: `Action Lock: ${input.actionLock} This is the only primary body action for this card; do not add another walking, arrival, adjustment, or object-operation action.`,
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "theme-card",
      appliesWhen: {},
      required: true,
      tags: ["card", "action-lock"]
    });
  } else if (input.actionLock && input.compositionMode !== "atmosphere") {
    rules.push({
      id: "card-non-person-directive",
      section: "scene",
      text: `Non-person card directive: ${sanitizeNonPersonDirective(input.actionLock, input.compositionMode)} Treat this as the only card-specific composition or material-operation variation; do not add a competing operation.`,
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "theme-card",
      appliesWhen: {},
      required: true,
      tags: ["card", "non-person-directive"]
    });
  }

  if (input.sceneLock) {
    rules.push({
      id: "card-scene-lock",
      section: "scene",
      text: `Scene Lock: ${input.sceneLock} Do not introduce an alternative location or scene route.`,
      priority: PromptPriority.P0_USER_SPECIFIED,
      source: "theme-card",
      appliesWhen: {},
      required: true,
      tags: ["card", "scene-lock"]
    });
  }

  return rules;
}

function sanitizeNonPersonDirective(directive: string, compositionMode: PromptProfileInput["compositionMode"]): string {
  if (compositionMode !== "materialDetail") return directive;

  const materialNames = "leather|suede|mesh|canvas|knit|nubuck";
  return directive
    .replace(new RegExp(`\\b(?:${materialNames})(?:\\s+or\\s+(?:${materialNames}))+\\b`, "gi"), "confirmed reference material")
    .replace(new RegExp(`\\b(?:${materialNames})\\b`, "gi"), "reference-bound material");
}

function matchesPredicate(pred: RulePredicate, input: PromptProfileInput): boolean {
  if (pred.imageTypes && !pred.imageTypes.includes(input.imageType)) return false;
  if (pred.compositionModes && !pred.compositionModes.includes(input.compositionMode)) return false;
  if (pred.hasShoe !== undefined && pred.hasShoe !== input.hasShoe) return false;
  if (pred.isMultiImage !== undefined && pred.isMultiImage !== input.isMultiImage) return false;
  if (pred.isContinuation !== undefined && pred.isContinuation !== (input.modelContinuity === "延续上一组人物")) return false;
  return true;
}

type RulePredicate = import("./contracts").RulePredicate;
