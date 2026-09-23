import {
  COMMERCIAL_ENDING_GRAMMARS,
  COMMERCIAL_EVENT_SPINE_TEMPLATES,
} from "./catalog";
import {
  COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION,
  COMMERCIAL_EVENT_SPINE_VERSION,
  type CommercialEventSpinePlan,
  type CommercialEventSpinePlannerInput,
  type CommercialEventShot,
} from "./types";
import type { CommercialShotRole } from "../types";
import type { CommercialCreativeMode } from "../creative-direction";

const PRODUCT_CRAFT_DETAIL_RELATIONSHIPS = [
  "surface",
  "material transition",
  "edge",
  "panel relationship",
  "lace-tongue relationship",
  "upper-outsole relationship",
  "ground-contact behavior",
];

const WORLD_LIFE_BY_INTENT = {
  URBAN_MOTION: {
    density: "ACTIVE_BACKGROUND" as const,
    signals: ["distant pedestrians", "passing traffic", "storefront reflections", "pavement variation", "street furniture"],
    line: "The city should feel actively inhabited rather than cleared for filming: keep subtle background pedestrians, distant traffic, irregular pavement, reflections, ordinary street objects, and non-readable storefront graphics while all background activity stays secondary.",
  },
  DAILY_STYLING: {
    density: "NORMAL_LIVED_IN" as const,
    signals: ["wardrobe edge", "ordinary door hardware", "floor wear", "soft exterior ambience", "one lived-in object"],
    line: "The private space should feel genuinely used rather than staged as a luxury showroom, with ordinary interior residue and only physically plausible distant exterior life.",
  },
  QUIET_LUXURY: {
    density: "LOW_LIVED_IN" as const,
    signals: ["natural light falloff", "fabric and curtain movement", "ordinary chair or floor contact", "subtle object placement"],
    line: "The private room should feel quietly inhabited rather than pristine: keep light falloff, soft material movement, ordinary object placement, and no showroom perfection.",
  },
  PRODUCT_CRAFT: {
    density: "LOW_LIVED_IN" as const,
    signals: ["working surface use", "garment folds", "ordinary hardware", "subtle floor wear"],
    line: "The preparation world should feel materially real and mildly used, never a perfect studio set or a generic luxury showroom.",
  },
  NEW_ARRIVAL: {
    density: "NORMAL_LIVED_IN" as const,
    signals: ["distant pedestrian", "passing vehicle", "storefront reflection", "threshold hardware", "surface variation"],
    line: "The destination should feel independently inhabited: keep restrained background movement, distant traffic or reflection, ordinary surfaces, and non-readable wayfinding or storefront information.",
  },
};

const SHOT_ROLES: CommercialShotRole[] = ["WORLD", "WEAR", "DETAIL", "HERO", "RELEASE"];

function normalizeDurations(base: number[], revealStrategy: string) {
  const durations = [...base];
  const shift = revealStrategy === "DELAYED" ? 0.4 : revealStrategy === "IMMEDIATE" ? -0.2 : 0.1;
  durations[0] = Math.max(1, Number((durations[0] + shift).toFixed(1)));
  const total = durations.reduce((sum, value) => sum + value, 0);
  durations[4] = Number((durations[4] + (15 - total)).toFixed(1));
  return durations;
}

export function planCommercialEventSpine(
  input: CommercialEventSpinePlannerInput
): CommercialEventSpinePlan {
  const template = COMMERCIAL_EVENT_SPINE_TEMPLATES[input.commercialIntent];
  const durations = normalizeDurations(
    template.shots.map((shot) => shot.durationSeconds),
    input.creativeSpine.revealStrategy
  );
  const shots: CommercialEventShot[] = template.shots.map((shot, shotIndex) => ({
    ...shot,
    shotIndex,
    shotRole: SHOT_ROLES[shotIndex],
    durationSeconds: durations[shotIndex],
    productDetailRelationship: input.commercialIntent === "PRODUCT_CRAFT"
      ? PRODUCT_CRAFT_DETAIL_RELATIONSHIPS[input.generationNonce % PRODUCT_CRAFT_DETAIL_RELATIONSHIPS.length]
      : shot.productDetailRelationship ?? null,
  }));
  if (shots.length !== 5 || durations.some((duration) => duration < 1 || duration > 5)) {
    throw new Error("Commercial Event Spine must produce five shots with durations between 1 and 5 seconds.");
  }
  return {
    schemaVersion: COMMERCIAL_EVENT_SPINE_SCHEMA_VERSION,
    plannerVersion: COMMERCIAL_EVENT_SPINE_VERSION,
    intent: input.commercialIntent,
    centralEvent: template.centralEvent,
    eventChain: shots.map((shot) => shot.eventKind),
    shots,
    durationPlan: durations,
    endingGrammar: COMMERCIAL_ENDING_GRAMMARS[template.endingGrammarId],
    worldLifeDensity: WORLD_LIFE_BY_INTENT[input.commercialIntent].density,
    worldLifeSignals: [...WORLD_LIFE_BY_INTENT[input.commercialIntent].signals],
    worldRealismLine: WORLD_LIFE_BY_INTENT[input.commercialIntent].line,
  };
}

export function applyCreativeModeTiming(
  baseDurations: number[],
  creativeMode: CommercialCreativeMode
) {
  const durations = [...baseDurations];
  const adjustments: Record<CommercialCreativeMode, number[]> = {
    PRIVATE_MOMENT: [0.1, 0.1, -0.2, -0.1, 0.1],
    CITY_JOURNEY: [-0.1, 0.1, -0.2, 0, 0.2],
    EVERYDAY_MOVEMENT: [0, 0, -0.1, 0.1, 0],
    STATE_TRANSITION: [0, -0.1, -0.1, 0.2, 0],
    SENSORY_LIFE: [0.1, 0.2, 0.1, -0.1, -0.3],
    SINGLE_IDEA: [-0.1, 0.1, -0.1, 0.1, 0],
  };
  const deltas = adjustments[creativeMode] ?? [0, 0, 0, 0, 0];
  durations.forEach((duration, index) => {
    durations[index] = Math.max(1, Math.min(5, Number((duration + deltas[index]).toFixed(1))));
  });
  const total = durations.reduce((sum, value) => sum + value, 0);
  durations[4] = Number((durations[4] + (15 - total)).toFixed(1));
  if (durations[4] > 5) {
    const overflow = durations[4] - 5;
    durations[4] = 5;
    durations[3] = Number((durations[3] - overflow).toFixed(1));
  }
  const rounded = durations.map((duration) => Number(duration.toFixed(1)));
  const finalTotal = rounded.reduce((sum, duration) => sum + duration, 0);
  rounded[4] = Number((rounded[4] + (15 - finalTotal)).toFixed(1));
  return rounded;
}
