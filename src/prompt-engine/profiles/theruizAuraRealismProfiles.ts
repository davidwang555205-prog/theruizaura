import type { PromptProfileInput, PromptRule } from "../contracts";
import { PromptPriority } from "../contracts";

export const THERUIZ_AURA_BRAND_ID = "theruiz_aura" as const;

const HUMAN_STATE: PromptRule = {
  id: "theruiz-human-state-real-mature-urban",
  section: "model",
  text: "Make the woman read as a real mature urban person in a lived moment: natural asymmetry, relaxed shoulders, realistic skin and hair texture, slight fabric movement, natural hands and bag weight, and an expression tied to the action. Prefer side or downward gaze; direct eye contact is occasional, not default. Avoid mannequin, influencer, or campaign posing.",
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
  text: "Capture one stable everyday action phase with believable weight transfer, garment tension, hand contact, and shoe-floor pressure. Use only the selected action; avoid display-driven foot placement or staged pseudo-movement.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  tags: ["theruiz-aura", "action", "anti-ai"]
};

const COMPOSITION_STATE: PromptRule = {
  id: "theruiz-composition-observed-asymmetric",
  section: "scene",
  text: "Use observed, off-center lifestyle framing with natural asymmetry, architectural depth, and clear visual hierarchy. Foreground or structural elements may interrupt the frame without blocking Product Truth. Avoid centered catalog symmetry or rigid front-facing layouts.",
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
  text: "Use a spatially real, functional environment with coherent architecture, movement routes, and only a few specific daily-life details. Keep doors, floors, steps, glass, furniture, signage, people, and vehicles physically consistent; avoid empty template sets or decorative clutter.",
  priority: PromptPriority.P3_COMPOSITION_AND_VISIBILITY,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle"] },
  required: true,
  tags: ["theruiz-aura", "scene", "anti-ai"]
};

const LIGHTING_STATE: PromptRule = {
  id: "theruiz-lighting-source-falloff-material-response",
  section: "lighting",
  text: "Use believable sourced light, realistic falloff, local shadows, normal exposure variation, and physically distinct response across skin, hair, clothing, accessories, confirmed product surfaces, and the environment. Keep natural depth-of-field; never use blur, noise, or low resolution to hide errors.",
  priority: PromptPriority.P5_REALISM_AND_CAMERA,
  source: "realism-profile",
  appliesWhen: { compositionModes: ["fullFigure", "studioLowerThird", "studioThreeQuarter", "mirrorFull", "mirrorThreeQuarter", "mirrorSeated", "onFootLifestyle", "stillLife", "materialDetail"] },
  required: true,
  tags: ["theruiz-aura", "lighting", "anti-ai"]
};

const PRODUCT_PRESENTATION: PromptRule = {
  id: "theruiz-product-presentation-worn-readable",
  section: "product",
  text: "Keep the preserved sneaker naturally worn, not arranged as a rigid or symmetrical product display.",
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
  text: "Match body weight, knee and hip direction, garment tension, outsole pressure, and contact shadow to the selected action. Required hand-object interactions must show real contact; no hovering gestures.",
  priority: PromptPriority.P1_PRODUCT_HARD_LOCK,
  source: "realism-profile",
  appliesWhen: { hasShoe: true },
  required: true,
  tags: ["theruiz-aura", "physical-integrity", "product-truth"]
};

const NEGATIVE_RISK: PromptRule = {
  id: "theruiz-negative-anti-ai-realism-risk",
  section: "negative",
  text: "Avoid catalog symmetry, rigid or mannequin posing, plastic skin or hair, uniform sharpness or lighting, template-like sets, floating feet, hovering hands, garment-shoe fusion, duplicated or left-right-inconsistent shoe details, unstable laces, distorted outsoles, generic cutouts, or CGI-like perfection.",
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
          text: "Keep the selected person real and unperformed in the studio: natural facial tension, hair and fabric texture, relaxed shoulders, believable asymmetry, and a calm expression tied to the pose. Use eye contact only when the selected studio role requires it; avoid mannequin or campaign-face perfection."
        }
      : rule)
    .filter((rule) => {
      if (input.actionLock && rule.id === ACTION_STATE.id) return false;
      const modes = rule.appliesWhen.compositionModes;
      return !modes || modes.includes(input.compositionMode);
    });
}
