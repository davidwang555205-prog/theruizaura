import {
  NON_PRODUCT_ATMOSPHERE_SCENE_LINES,
  NON_PRODUCT_ATMOSPHERE_SCENES,
  NON_PRODUCT_ATMOSPHERE_VARIATIONS,
  type AtmosphereVariation
} from "../data/nonProductAtmosphereSceneLines";
import { brandVisualMother } from "../visual-system";

export const NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE = "non_product_atmosphere" as const;
export const NON_PRODUCT_ATMOSPHERE_PROVIDER = "image2" as const;
export const NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION = "non-product-atmosphere-image2-v1" as const;
export const NON_PRODUCT_ATMOSPHERE_COUNTS = [1, 3, 5, 8] as const;
export type NonProductAtmosphereCount = (typeof NON_PRODUCT_ATMOSPHERE_COUNTS)[number];

export type ProductEchoProfile = {
  primaryEchoColor: string;
  secondaryEchoColor?: string;
  materialEchoes: string[];
  emotionalEchoes: string[];
  seasonalEcho?: string;
  lifestyleEchoes: string[];
  prohibitedDirections: string[];
};

export type NonProductAtmosphereSlot = {
  id: string;
  sceneId: string;
  sceneLabel: string;
  sceneLine: string;
  lifeMoment: string;
  objectCue: string;
  variation: AtmosphereVariation;
  differenceDimensions: string[];
};

export type NonProductAtmosphereImagePlan = {
  id: string;
  index: number;
  prompt: string;
  slot: NonProductAtmosphereSlot;
  productReferenceUse: "visual_echo_extraction_only";
  productVisibility: "forbidden";
  footwearVisibility: "forbidden";
  personVisibility: "forbidden";
  modelGeneration: "disabled";
  outfitGeneration: "disabled";
  onFootGeneration: "disabled";
};

export type NonProductAtmospherePlan = {
  contentType: typeof NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE;
  provider: typeof NON_PRODUCT_ATMOSPHERE_PROVIDER;
  promptVersion: typeof NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION;
  quantity: NonProductAtmosphereCount;
  productEchoProfile: ProductEchoProfile;
  referenceImageCount: number;
  images: NonProductAtmosphereImagePlan[];
};

export type BuildNonProductAtmospherePlanInput = {
  quantity: NonProductAtmosphereCount;
  generationNonce?: number;
  referenceImageCount?: number;
  season?: "春" | "夏" | "秋" | "冬";
};

type ObjectCue = { id: string; text: string };

const OBJECT_CUES: ObjectCue[] = [
  { id: "used-cup", text: "one used ceramic cup with a believable trace of recent use" },
  { id: "open-book", text: "one open book or magazine with a naturally shifted page" },
  { id: "receipt-and-bag", text: "one folded tote edge beside a small receipt or bread paper bag" },
  { id: "folded-coat", text: "one softly folded coat or knit textile with natural fabric creases" },
  { id: "flowers", text: "one restrained paper-wrapped flower bundle placed after returning home" },
  { id: "travel-card", text: "one travel card, room card, or folded itinerary with a small travel object" },
  { id: "material-touch", text: "one tactile linen, washed cotton, matte ceramic, or frosted-glass surface" },
  { id: "quiet-trace", text: "one subtle displaced everyday object that proves recent human use without showing anyone" }
];

const SLOT_SCENES: Array<{ id: string; objectIndex: number; dimensions: string[] }> = [
  { id: "morning-bedroom-corner", objectIndex: 3, dimensions: ["private home", "morning light", "wide framing"] },
  { id: "entryway-threshold", objectIndex: 2, dimensions: ["threshold space", "departure trace", "low viewpoint"] },
  { id: "window-reading-corner", objectIndex: 1, dimensions: ["reading pause", "side daylight", "medium distance"] },
  { id: "after-return-table", objectIndex: 0, dimensions: ["after-return routine", "table surface", "off-center composition"] },
  { id: "quiet-worktable", objectIndex: 6, dimensions: ["work pause", "tactile surface", "observational crop"] },
  { id: "hotel-travel-corner", objectIndex: 5, dimensions: ["short travel", "hotel daylight", "layered depth"] },
  { id: "market-return", objectIndex: 4, dimensions: ["after-purchase trace", "city-to-home rhythm", "partial occlusion"] },
  { id: "material-light-space", objectIndex: 7, dimensions: ["material atmosphere", "light transition", "generous negative space"] }
];

export const NON_PRODUCT_ATMOSPHERE_PROMPT_REGISTRY = {
  contentType: NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE,
  provider: NON_PRODUCT_ATMOSPHERE_PROVIDER,
  promptVersion: NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION,
  status: "active" as const,
  roles: [
    "brand_core", "product_reference_read_only", "product_echo_translation", "life_moment",
    "scene_and_object", "composition", "product_footwear_prohibition", "person_prohibition",
    "multi_output_variation", "negative_constraints"
  ] as const
};

function activeVisualSystemRule() {
  const positioning = brandVisualMother.core_positioning.split(" /")[0] || "Quiet Warm Luxury";
  return `Active Visual System inheritance: ${brandVisualMother.brand} brand visual mother v${brandVisualMother.version}, status ${brandVisualMother.status}, is the highest visual authority. Inherit its palette, light, material, space, composition, realism, and brand-boundary rules. Do not create a module-specific aesthetic system. ${brandVisualMother.brand} is ${positioning}.`;
}
const BRAND_CORE = `Create a ${brandVisualMother.brand} non-product lifestyle atmosphere image guided by ${brandVisualMother.core_positioning.split(" /")[0] || "Quiet Warm Luxury"}. Express warm restraint, calm negative space, mature relaxed elegance, tactile authenticity, quiet daily order, low-saturation color, soft natural daylight, and believable lived-in atmosphere. The image must feel warm, restrained, mature, calm, tactile, and real.`;
const PRODUCT_REFERENCE_RULE = "Use uploaded Product Truth reference images only as visual-analysis input. Read their color family, material tactility, surface finish, emotional tone, and seasonal feeling. Product reference use is visual_echo_extraction_only.";
const PRODUCT_ECHO_RULE = "Translate the product's visual qualities into unrelated but believable lifestyle elements. Use only restrained visual echoes through color, texture, light, atmosphere, or everyday objects. The connection must be subtle, indirect, and emotionally readable. Do not create an obvious product-color theme or color the entire scene according to the product. If Product Echo conflicts with the Active Visual System, lower saturation and follow the brand's cream, warm beige, pale stone, warm-grey, natural-material, and quiet-light order.";
const COMPOSITION_RULE = "Use wider observational framing with calm negative space. Do not create a centered hero object, flatlay composition, symmetrical styling, evenly spaced props, showroom arrangement, or advertising hierarchy. Allow natural cropping, partial occlusion, depth, and believable visual imbalance.";
const HARD_PROHIBITIONS = "Do not show the uploaded product. Do not show any sneaker, shoe, footwear, product substitute, product fragment, product-like object, product packaging used as product display, or any other brand footwear. Do not show any person, model, face, portrait, hand, foot, leg, body fragment, reflection, silhouette, human shadow, mirror person, on-foot styling, outfit display, or human action. Product visibility = forbidden. Footwear visibility = forbidden. Person visibility = forbidden. Model generation = disabled. Outfit generation = disabled. On-foot generation = disabled.";
const NEGATIVE_CONSTRAINTS = "Avoid luxury real-estate interiors, showroom styling, home-furnishing advertising, bedding advertising, interior-design editorial, coffee-brand advertising, flower-shop advertising, generic lifestyle moodboards, Pinterest styling, influencer clichés, decorative prop collections, artificial symmetry, empty CGI spaces, loud color blocking, and category drift.";

const SEASON_LINES = {
  春: "Use soft spring daylight and airy restrained tactile surfaces.",
  夏: "Use breathable summer light, soft shade, and light natural materials without resort styling.",
  秋: "Use mellow autumn daylight, warm-grey shadows, and muted tactile layers.",
  冬: "Use soft winter light, warm-neutral tactile surfaces, and believable quiet shadows."
} as const;

export function buildProductEchoProfile(season: keyof typeof SEASON_LINES = "春"): ProductEchoProfile {
  return {
    primaryEchoColor: "derived from the uploaded Product Truth reference at Image2 analysis time",
    secondaryEchoColor: "restrained cream, warm beige, pale stone, or soft grey support tones only",
    materialEchoes: ["matte ceramic", "washed cotton", "linen", "frosted glass", "quiet paper texture"],
    emotionalEchoes: ["warm restraint", "mature calm", "quiet daily order", "soft tactile authenticity"],
    seasonalEcho: SEASON_LINES[season],
    lifestyleEchoes: ["recent daily use", "returning home", "reading pause", "work pause", "short travel trace"],
    prohibitedDirections: ["product display", "footwear", "person or body trace", "obvious product-color theme", "generic lifestyle moodboard"]
  };
}

function resolveScene(sceneId: string, rotationIndex: number) {
  if (sceneId === "morning-bedroom-corner") return { label: "private morning bedroom corner", line: "Create a quiet morning bedroom corner with a partial bed edge, calm wall plane, soft textile crease, and natural light; never make bedding the product or subject." };
  if (sceneId === "entryway-threshold") return { label: "home entryway threshold", line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES["玄关出门"] ?? "Create a believable home entryway threshold with a quiet departure trace." };
  if (sceneId === "window-reading-corner") return { label: "window-side reading corner", line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES["窗边阅读角"] ?? "Create a quiet reading corner with soft daylight." };
  if (sceneId === "after-return-table") return { label: "after-return home table", line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES["暑假外出后回家"] ?? "Create an after-return table atmosphere with restrained daily traces." };
  if (sceneId === "quiet-worktable") return { label: "personal worktable", line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES["工作台 / 桌边整理"] ?? "Create a refined personal worktable atmosphere." };
  if (sceneId === "hotel-travel-corner") return { label: "quiet hotel travel corner", line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES["旅行酒店"] ?? "Create a quiet hotel travel atmosphere." };
  if (sceneId === "market-return") return { label: "after-market return atmosphere", line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES["精品超市 / 日常采购"] ?? "Create a restrained daily errand atmosphere." };
  const fallbackScene = NON_PRODUCT_ATMOSPHERE_SCENES[rotationIndex % NON_PRODUCT_ATMOSPHERE_SCENES.length];
  return { label: fallbackScene, line: NON_PRODUCT_ATMOSPHERE_SCENE_LINES[fallbackScene] ?? "Create one quiet tactile atmosphere with believable daily traces." };
}

function buildPrompt(slot: NonProductAtmosphereSlot, profile: ProductEchoProfile): string {
  return [
    activeVisualSystemRule(),
    BRAND_CORE,
    PRODUCT_REFERENCE_RULE,
    `Product Echo profile: primary echo is ${profile.primaryEchoColor}; use ${profile.materialEchoes.join(", ")} and ${profile.emotionalEchoes.join(", ")}. ${profile.seasonalEcho}`,
    PRODUCT_ECHO_RULE,
    `Life moment: ${slot.lifeMoment}. Scene: ${slot.sceneLine} Object direction: use ${slot.objectCue}. Keep one main life trace plus only two to four supporting objects, each justified by recent daily use.`,
    `Variation dimensions: ${slot.differenceDimensions.join(", ")}. ${slot.variation.directive}`,
    COMPOSITION_RULE,
    HARD_PROHIBITIONS,
    NEGATIVE_CONSTRAINTS,
    "Provider boundary: Image2 only. This is a user-facing production Prompt, not an internal validation task."
  ].join(" ");
}

export function buildNonProductAtmospherePlan(input: BuildNonProductAtmospherePlanInput): NonProductAtmospherePlan {
  const quantity = input.quantity;
  const rotationIndex = Math.abs(Math.floor(input.generationNonce ?? 0));
  const season = input.season ?? "春";
  const profile = buildProductEchoProfile(season);
  const images = Array.from({ length: quantity }, (_, index) => {
    const sceneSlot = SLOT_SCENES[(rotationIndex + index) % SLOT_SCENES.length];
    const variation = NON_PRODUCT_ATMOSPHERE_VARIATIONS[(rotationIndex + index) % NON_PRODUCT_ATMOSPHERE_VARIATIONS.length];
    const scene = resolveScene(sceneSlot.id, rotationIndex + index);
    const slot: NonProductAtmosphereSlot = {
      id: `atmosphere-slot-${rotationIndex + index + 1}`,
      sceneId: sceneSlot.id,
      sceneLabel: scene.label,
      sceneLine: scene.line,
      lifeMoment: variation.directive,
      objectCue: OBJECT_CUES[sceneSlot.objectIndex].text,
      variation,
      differenceDimensions: sceneSlot.dimensions
    };
    return {
      id: `non-product-atmosphere-${rotationIndex + index + 1}`,
      index: index + 1,
      prompt: buildPrompt(slot, profile),
      slot,
      productReferenceUse: "visual_echo_extraction_only" as const,
      productVisibility: "forbidden" as const,
      footwearVisibility: "forbidden" as const,
      personVisibility: "forbidden" as const,
      modelGeneration: "disabled" as const,
      outfitGeneration: "disabled" as const,
      onFootGeneration: "disabled" as const
    };
  });
  return {
    contentType: NON_PRODUCT_ATMOSPHERE_CONTENT_TYPE,
    provider: NON_PRODUCT_ATMOSPHERE_PROVIDER,
    promptVersion: NON_PRODUCT_ATMOSPHERE_PROMPT_VERSION,
    quantity,
    productEchoProfile: profile,
    referenceImageCount: Math.max(0, input.referenceImageCount ?? 0),
    images
  };
}
