import type { PromptProfileInput, PromptRule } from "../contracts";
import { PromptPriority } from "../contracts";

export const THERUIZ_AURA_BRAND_ID = "theruiz_aura" as const;

const SHOE_SCALE_LOCK_BASE =
  "Shoe scale lock: keep the sneaker length and volume proportional to the visible anatomy in frame. Keep the ankle alignment natural, the garment hem clear of the tongue and laces, and both feet grounded.";

const TELEPHOTO_SHOE_SCALE_SUPPLEMENT =
  "Do not let telephoto compression enlarge or shrink the sneaker. Keep both shoes at nearly the same camera distance and equal visible scale.";

const SHOE_SCALE_FRAMING_LINES = {
  fullFigure:
    "In full-figure framing, keep each sneaker clearly smaller than the head and about 5-7% of image width.",
  threeQuarterFigure:
    "In three-quarter framing, keep each sneaker about 7-10% of image width.",
  lowerBody:
    "In lower-body framing, keep each sneaker proportional to the visible ankle and calf; do not fill more than 45% of crop width."
} as const;

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
  text: "Use observed commercial lifestyle photography with off-center framing, natural asymmetry, environmental depth, and a clear visual hierarchy. Avoid centered rigid catalog symmetry.",
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
  text: "Build a spatially real environment with functional architecture, a natural movement route, and a few specific details. Avoid empty template sets and ambiguous decorative backgrounds.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  tags: ["theruiz-aura", "scene", "anti-ai"]
};

const LIGHTING_STATE: PromptRule = {
  id: "theruiz-lighting-source-falloff-material-response",
  section: "lighting",
  text: "Use physically believable light with one clear source, realistic falloff, soft local shadows, and distinct material response. Keep natural depth-of-field without hiding anatomy or product errors.",
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
  text: "Avoid centered catalog symmetry, mannequin stillness, plastic skin, synthetic hair edges, identical sharpness, floating feet, weightless posture, hovering hands, garment-shoe fusion, distorted product structure, and generic AI advertising perfection. Do not use blur, noise, or degraded quality to conceal errors.",
  priority: PromptPriority.P7_LOW_PRIORITY_NEGATIVE,
  source: "realism-profile",
  appliesWhen: {},
  required: true,
  tags: ["theruiz-aura", "negative", "anti-ai"]
};

function buildOnFootShoeScaleRule(input: PromptProfileInput): PromptRule | null {
  if (!input.hasShoe) return null;
  const personWornModes = new Set([
    "fullFigure",
    "studioLowerThird",
    "studioThreeQuarter",
    "studioOnFootDetail",
    "mirrorFull",
    "mirrorThreeQuarter",
    "mirrorSeated",
    "onFootLifestyle"
  ]);
  if (!personWornModes.has(input.compositionMode)) return null;

  const actionLockText = input.actionLock ?? "";
  const framingLine = /lower-body or on-foot framing|waist-to-floor framing/i.test(actionLockText)
    ? SHOE_SCALE_FRAMING_LINES.lowerBody
    : /three-quarter-figure framing/i.test(actionLockText)
      ? SHOE_SCALE_FRAMING_LINES.threeQuarterFigure
      : SHOE_SCALE_FRAMING_LINES.fullFigure;
  const telephotoLine = input.captureStyle === "telephoto_candid"
    ? TELEPHOTO_SHOE_SCALE_SUPPLEMENT
    : "";
  const continuityLine = input.isMultiImage
    ? "Keep the same shoe-to-body scale in every image."
    : "";

  return {
    id: "theruiz-on-foot-shoe-scale-lock",
    section: "product",
    text: [
      SHOE_SCALE_LOCK_BASE,
      framingLine,
      telephotoLine,
      continuityLine
    ].filter(Boolean).join(" "),
    priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
    source: "realism-profile",
    appliesWhen: { hasShoe: true, compositionModes: [...personWornModes] as PromptProfileInput["compositionMode"][] },
    required: true,
    tags: ["product-truth", "shoe-scale", "on-foot", "telephoto"]
  };
}

function buildTelephotoBaseGazeRule(input: PromptProfileInput): PromptRule | null {
  if (input.captureStyle !== "telephoto_candid") return null;
  if (input.seriesImageCount && input.seriesImageCount >= 2) return null;

  return {
    id: "theruiz-telephoto-base-gaze-boundary",
    section: "model",
    text: "Keep the gaze directional and off-camera unless the selected card explicitly specifies another practical target.",
    priority: PromptPriority.P0_USER_SPECIFIED,
    source: "realism-profile",
    appliesWhen: {},
    required: true,
    tags: ["telephoto", "gaze", "base-boundary"]
  };
}

export function getTheruizAuraRealismRules(input: PromptProfileInput): PromptRule[] {
  if (input.brandId !== THERUIZ_AURA_BRAND_ID) return [];
  const isStillLife = input.compositionMode === "stillLife" || input.compositionMode === "materialDetail";
  const isAtmosphere = input.compositionMode === "atmosphere" || input.imageType === "非产品氛围图";
  const isStudio = input.scenePreference === "棚内上新拍摄";
  const isTelephotoCandid = input.captureStyle === "telephoto_candid";
  const rules = isAtmosphere
    ? []
    : isStillLife
      ? []
      : isStudio
        ? [HUMAN_STATE, COMPOSITION_STATE, LIGHTING_STATE, PRODUCT_PRESENTATION, PHYSICAL_INTEGRITY, NEGATIVE_RISK]
        : [HUMAN_STATE, ACTION_STATE, COMPOSITION_STATE, SCENE_STATE, LIGHTING_STATE, PRODUCT_PRESENTATION, PHYSICAL_INTEGRITY, NEGATIVE_RISK];
  const shoeScaleRule = buildOnFootShoeScaleRule(input);
  const telephotoBaseGazeRule = buildTelephotoBaseGazeRule(input);
  if (shoeScaleRule) rules.push(shoeScaleRule);
  if (telephotoBaseGazeRule) rules.push(telephotoBaseGazeRule);
  return rules
    .map((rule) => {
      if (input.seriesFaceEligible === false && rule.id === HUMAN_STATE.id) {
        return {
          ...rule,
          text: "Keep the selected person's visible body, hair, clothing, posture, and proportions realistic and unperformed. The face is intentionally hidden or outside the useful crop; do not introduce eye contact, catchlights, facial-expression direction, or a competing head pose."
        };
      }
      if (input.seriesFaceVariation && rule.id === HUMAN_STATE.id) {
        return {
          ...rule,
          text: "Make the selected woman feel real and unperformed, with natural facial tension, realistic skin and hair texture, relaxed shoulders, believable body asymmetry, and ordinary daily imperfection. The assigned Face Variation Lock is the only authority for head direction and gaze; do not introduce any additional camera acknowledgement, eye direction, head turn, or generic facial pose."
        };
      }
      if (isStudio && rule.id === HUMAN_STATE.id) {
        return {
          ...rule,
          text: "Make the selected person feel real and unperformed in a controlled professional studio. Keep natural facial tension, subtle hair and fabric texture, relaxed shoulders, believable body asymmetry, and a calm expression responding to the pose rather than performing for the lens. Direct eye contact may appear when the selected studio role requires it, but avoid mannequin-like stillness or campaign-face perfection."
        };
      }
      if (isTelephotoCandid && rule.id === HUMAN_STATE.id) {
        return {
          ...rule,
          text: "Make the woman feel real and unperformed in a physically farther telephoto candid observation. Keep natural facial tension, subtle hair and fabric texture, relaxed shoulders, believable body asymmetry, and an expression responding to the place or action rather than performing for the camera."
        };
      }
      return rule;
    })
    .filter((rule) => {
      if (input.actionLock && rule.id === ACTION_STATE.id) return false;
      const modes = rule.appliesWhen.compositionModes;
      return !modes || modes.includes(input.compositionMode);
    });
}
