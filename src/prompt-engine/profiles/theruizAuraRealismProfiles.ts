import type { PromptProfileInput, PromptRule } from "../contracts";
import { PromptPriority } from "../contracts";

export const THERUIZ_AURA_BRAND_ID = "theruiz_aura" as const;

const HUMAN_STATE: PromptRule = {
  id: "theruiz-human-state-real-mature-urban",
  section: "model",
  text: "Make the woman feel like a real mature urban person caught in a lived moment, not a mannequin, fashion dummy, plastic model, over-posed influencer, showroom character, or standard commercial model waiting for the camera. Prefer a natural side glance, downward gaze, slight turn, walking transition, arrival pause, or quiet moment between actions. Keep believable body asymmetry, relaxed shoulders, natural facial tension, realistic hair texture, a few subtle flyaway hairs, slight fabric movement, believable bag weight, natural hand position, and normal daily imperfection. Her expression should respond to the place or action rather than perform for the lens. Direct eye contact may appear occasionally when the theme genuinely needs it, but it must not be the default.",
  priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioLowerThird", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  conflictsWith: ["model-identity-real-person", "model-real-human-detail"],
  tags: ["theruiz-aura", "human-state", "anti-ai"]
};

const ACTION_STATE: PromptRule = {
  id: "theruiz-action-reason-phase-weight",
  section: "action",
  text: "Give the action a clear everyday reason and capture one stable phase of that action. Prefer walking through an entrance, pausing briefly after arriving, preparing to continue forward, turning slightly near a doorway or architectural edge, adjusting a sleeve, coat hem, or bag strap with real contact, or shifting weight naturally before a step. The action must create believable weight distribution, garment tension, hand contact, and shoe-floor pressure. Avoid static poses disguised as natural movement and avoid foot placement arranged only to display the product.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  tags: ["theruiz-aura", "action", "anti-ai"]
};

const COMPOSITION_STATE: PromptRule = {
  id: "theruiz-composition-observed-asymmetric",
  section: "scene",
  text: "Use the visual language of real commercial lifestyle photography rather than a synthetic catalog composition. Prefer off-center framing, natural asymmetry, architectural framing, environmental layers, and a stable moment that feels observed rather than arranged. Allow a doorway, column, wall edge, glass panel, step, table edge, flowers, or a soft foreground element to interrupt the frame naturally without blocking essential Product Truth evidence. Keep a clear visual hierarchy; the face, outfit, shoes, and background must not all be equally dominant or equally sharp. Avoid centered full-body symmetry and rigid front-facing catalog layouts.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  conflictsWith: ["full-figure-body-reference", "comp-full-body-proportion", "comp-threequarter-angle", "comp-mirror-phone", "comp-mirror-3q-phone", "comp-mirror-seated"],
  tags: ["theruiz-aura", "composition", "anti-ai"]
};

const SCENE_STATE: PromptRule = {
  id: "theruiz-scene-functionally-believable",
  section: "scene",
  text: "Build a spatially real and functionally believable environment with clear architecture, natural movement routes, and a reason for the woman to be there. Favor ordinary building entrances, residential lobby thresholds, flower shop fronts, gallery or bookstore circulation spaces, residential entry areas, quiet business-district walkways, and indoor-outdoor transitions. Use a small number of specific functional details instead of many decorative objects. Keep doors, floors, steps, glass, walls, furniture, signage, distant people, or vehicles logically placed and physically consistent. Avoid empty template sets and decorative lifestyle backgrounds with weak or ambiguous object details.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  tags: ["theruiz-aura", "scene", "anti-ai"]
};

const LIGHTING_STATE: PromptRule = {
  id: "theruiz-lighting-source-falloff-material-response",
  section: "lighting",
  text: "Use natural and physically believable light with a clear source, realistic falloff, soft local shadows, and normal exposure differences across the space. Allow the face to sit slightly below the brightest area when appropriate, and allow indoor-outdoor brightness differences or mild tonal imbalance. Keep physically distinct surface response across skin, hair, clothing, accessories, confirmed product surfaces, and the studio or environmental materials. Do not let unrelated surfaces share identical smoothness, sharpness, or reflectivity. Preserve subtle depth-of-field and edge softness where the lens would naturally create it, but do not hide anatomy or product errors through blur, noise, or low resolution.",
  priority: PromptPriority.P5_REALISM_AND_CAMERA,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioLowerThird", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle", "stillLife", "materialDetail"] },
  required: true,
  tags: ["theruiz-aura", "lighting", "anti-ai"]
};

const PRODUCT_PRESENTATION: PromptRule = {
  id: "theruiz-product-presentation-worn-readable",
  section: "product",
  text: "Present the preserved sneaker as part of a believable worn look rather than a rigid product-display task. Do not arrange both shoes in a perfect symmetrical showcase position.",
  priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
  source: "realism-profile",
  appliesWhen: { hasShoe: true },
  required: true,
  conflictsWith: ["full-figure-body-reference"],
  tags: ["theruiz-aura", "product", "product-truth"]
};

const PHYSICAL_INTEGRITY: PromptRule = {
  id: "theruiz-physical-integrity-grounding",
  section: "product",
  text: "Match body weight to the selected action phase, with believable knee direction, hip balance, garment tension and folds corresponding to the movement, outsole pressure, and grounded contact shadow. Hands must make real contact with sleeves, bags, coats, doors, or furniture when the action requires it; do not use hovering or decorative hand gestures.",
  priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
  source: "realism-profile",
  appliesWhen: { hasShoe: true },
  required: true,
  tags: ["theruiz-aura", "physical-integrity", "product-truth"]
};

const NEGATIVE_RISK: PromptRule = {
  id: "theruiz-negative-anti-ai-realism-risk",
  section: "negative",
  text: "Avoid overly centered composition, symmetrical full-body catalog posing, rigid front-facing stance, mannequin-like stillness, static product-display foot placement, overly smooth skin, synthetic hair edges, identical sharpness across all materials, perfectly even lighting across face, outfit, shoes, and background, decorative but semantically weak objects, template-like cafe or studio environments, full-frame perfection, floating feet, weightless posture, hovering hands, garment-shoe fusion, duplicated shoe details, inconsistent left-right shoe structure, unstable laces, distorted outsole, generic catalog cutout, and artificial AI-style lifestyle-advertising perfection. Do not use blur, noise, metadata changes, or degraded image quality to conceal structural errors.",
  priority: PromptPriority.P7_LOW_PRIORITY_NEGATIVE,
  source: "realism-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "negative", "anti-ai"]
};

export function getTheruizAuraRealismRules(input: PromptProfileInput): PromptRule[] {
  if (input.brandId !== THERUIZ_AURA_BRAND_ID) return [];
  const isStillLife = input.compositionMode === "stillLife" || input.compositionMode === "materialDetail";
  const isAtmosphere = input.compositionMode === "atmosphere" || input.imageType === "非产品氛围图";
  const isStudio = input.scenePreference === "棚内上新拍摄";
  const rules = isAtmosphere
    ? []
    : isStillLife
      ? []
      : isStudio
        ? [HUMAN_STATE, COMPOSITION_STATE, LIGHTING_STATE, PRODUCT_PRESENTATION, PHYSICAL_INTEGRITY, NEGATIVE_RISK]
        : [HUMAN_STATE, ACTION_STATE, COMPOSITION_STATE, SCENE_STATE, LIGHTING_STATE, PRODUCT_PRESENTATION, PHYSICAL_INTEGRITY, NEGATIVE_RISK];
  return rules
    .map((rule) => isStudio && rule.id === HUMAN_STATE.id
      ? {
          ...rule,
          text: "Make the selected person feel real and unperformed in a controlled professional studio. Keep natural facial tension, subtle hair and fabric texture, relaxed shoulders, believable body asymmetry, and a calm expression responding to the pose rather than performing for the lens. Direct eye contact may appear when the selected studio role requires it, but avoid mannequin-like stillness or campaign-face perfection."
        }
      : rule)
    .filter((rule) => {
      if (input.actionLock && rule.id === ACTION_STATE.id) return false;
      const modes = rule.appliesWhen.compositionModes;
      return !modes || modes.includes(input.compositionMode);
    });
}
