import type { PromptRule, PromptProfileInput, PromptSection } from "./contracts";
import { PromptPriority } from "./contracts";
import { COMPOSITION_PROFILES } from "./profiles/compositionProfiles";
import { IMAGE_TYPE_PROFILES } from "./profiles/imageTypeProfiles";
import { SCENE_PROFILES } from "./profiles/sceneProfiles";

// ─── Global hard rules (P0-P2) ──────────────────────────────
const GLOBAL_HARD_RULES: PromptRule[] = [
  {
    id: "product-accuracy-uploaded-reference",
    section: "product",
    text: "Use uploaded sneaker reference as strict source: low-cut German trainer silhouette, rounded toe box, slim outsole, panels, tongue, stitching, material, color, and proportions.",
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "product-profile",
    appliesWhen: { hasShoe: true },
    required: true,
    tags: ["product", "accuracy"],
  },
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
      text: "Do not load any person, face, or full-shoe product rules. Focus on the specific material zone: suede, leather, mesh, stitching, or panel transition.",
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
    text: "Avoid visible brand logo, brand lettering, readable fake brand text, luxury brand advertising aesthetic, Chloé-style, Hermès-style, CHANEL-style, CELINE-style visual cues.",
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
  const rules: PromptRule[] = [];

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

  // 4. User extra requirement
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

  return rules;
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
