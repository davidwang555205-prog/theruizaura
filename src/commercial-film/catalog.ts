import type { ProductCoverage } from "../visual-system/taskReferenceBinding";
import type {
  CommercialBrandMood,
  CommercialCameraRhythm,
  CommercialIntentId,
  CommercialProductVisibility,
  CommercialShotRole,
} from "./types";

export type CommercialIntentDefinition = {
  id: CommercialIntentId;
  labelZh: string;
  labelEn: string;
  productMessagePriority: ProductCoverage[];
  sceneWorldId: string;
  cameraRhythm: CommercialCameraRhythm;
  lifestyleLead: string;
  heroBehavior: string;
};

export const COMMERCIAL_INTENT_CATALOG: CommercialIntentDefinition[] = [
  {
    id: "URBAN_MOTION",
    labelZh: "都市穿行",
    labelEn: "Urban Motion",
    productMessagePriority: ["silhouette", "side_panel_structure", "outsole_profile"],
    sceneWorldId: "COMMERCIAL_URBAN_MOTION",
    cameraRhythm: "BALANCED",
    lifestyleLead: "The person moves through an ordinary city route with purpose but without campaign energy.",
    heroBehavior: "A brief natural stop at a crossing point lets the worn silhouette and foot-to-ground relationship settle into view.",
  },
  {
    id: "DAILY_STYLING",
    labelZh: "日常穿搭",
    labelEn: "Daily Styling",
    productMessagePriority: ["silhouette", "color_blocking", "side_panel_structure"],
    sceneWorldId: "COMMERCIAL_DAILY_STYLING",
    cameraRhythm: "CALM",
    lifestyleLead: "The styling belongs to a believable leaving-home routine and a complete daily outfit.",
    heroBehavior: "A relaxed weight shift and a small garment adjustment keep the product readable as part of the worn outfit.",
  },
  {
    id: "QUIET_LUXURY",
    labelZh: "轻奢生活",
    labelEn: "Quiet Luxury",
    productMessagePriority: ["material_evidence", "color_blocking", "silhouette"],
    sceneWorldId: "COMMERCIAL_QUIET_LUXURY",
    cameraRhythm: "CALM",
    lifestyleLead: "The scene stays private, materially tactile, and quietly inhabited rather than staged.",
    heroBehavior: "A short pause inside a warm interior holds the product at natural worn scale without turning it into a still life.",
  },
  {
    id: "PRODUCT_CRAFT",
    labelZh: "产品质感",
    labelEn: "Product Craft",
    productMessagePriority: ["material_evidence", "toe_structure", "side_panel_structure", "outsole_profile", "heel_structure"],
    sceneWorldId: "COMMERCIAL_PRODUCT_CRAFT",
    cameraRhythm: "PRODUCT_FORWARD",
    lifestyleLead: "The person remains in a real dressing or preparation moment while the camera observes material and structure relationships.",
    heroBehavior: "The worn product is held at a stable three-quarter angle after a natural weight settle, with the ankle and ground relationship intact.",
  },
  {
    id: "NEW_ARRIVAL",
    labelZh: "新品上新",
    labelEn: "New Arrival",
    productMessagePriority: ["silhouette", "color_blocking", "material_evidence"],
    sceneWorldId: "COMMERCIAL_NEW_ARRIVAL",
    cameraRhythm: "BALANCED",
    lifestyleLead: "The new product enters a polished but ordinary city-life setting without event or launch-page staging.",
    heroBehavior: "A brief pause before continuing creates one clear new-product memory without isolating the shoe.",
  },
];

export const COMMERCIAL_SHOT_ROLES: CommercialShotRole[] = [
  "WORLD",
  "WEAR",
  "DETAIL",
  "HERO",
  "RELEASE",
];

export const COMMERCIAL_PRODUCT_VISIBILITY_BY_SHOT: Record<CommercialShotRole, CommercialProductVisibility> = {
  WORLD: "CONTEXT",
  WEAR: "PRODUCT_READABLE",
  DETAIL: "PRODUCT_DETAIL",
  HERO: "PRODUCT_HERO",
  RELEASE: "BRAND_RELEASE",
};

export const COMMERCIAL_SHOT_PURPOSES: Record<CommercialShotRole, string> = {
  WORLD: "Establish the person, the shared scene world, and the THERUIZ AURA atmosphere.",
  WEAR: "Make the product clearly readable as worn in a natural action.",
  DETAIL: "Observe one reference-supported material, structure, or movement detail without inventing a product fact.",
  HERO: "Create the clearest worn-product memory inside the same real-life situation.",
  RELEASE: "Let the person continue into life and end naturally without a logo or packshot.",
};

export const COMMERCIAL_BRAND_MOOD: CommercialBrandMood = {
  id: "THERUIZ_AURA_QUIET_WARM_LUXURY",
  attributes: ["quiet", "warm", "restrained", "premium", "natural", "material-aware"],
  expression:
    "THERUIZ AURA commercial language stays quiet, warm, restrained, premium, natural, and material-aware. The product is clear because it is well observed, not because the film becomes loud.",
  prohibitedDirections: [
    "high-energy sports commercial",
    "luxury cliché",
    "runway spectacle",
    "fashion-film abstraction",
    "loud logo advertising",
  ],
};

export const COMMERCIAL_SCENE_WORLDS: Record<string, {
  id: string;
  label: string;
  sceneIds: string[];
  spatialAnchors: string[];
}> = {
  COMMERCIAL_URBAN_MOTION: {
    id: "COMMERCIAL_URBAN_MOTION",
    label: "城市街区连续穿行",
    sceneIds: ["lifestyle-city-corner", "lifestyle-business-corner", "lifestyle-weekend-city-walk"],
    spatialAnchors: ["approach line", "crossing point", "storefront edge", "brief pause", "exit direction"],
  },
  COMMERCIAL_DAILY_STYLING: {
    id: "COMMERCIAL_DAILY_STYLING",
    label: "出门前的日常穿搭空间",
    sceneIds: ["lifestyle-entryway-mirror", "lifestyle-entryway-departure", "lifestyle-residential-building-exit"],
    spatialAnchors: ["wardrobe edge", "entryway mirror", "door threshold", "stoop", "first sidewalk step"],
  },
  COMMERCIAL_QUIET_LUXURY: {
    id: "COMMERCIAL_QUIET_LUXURY",
    label: "安静的私人生活空间",
    sceneIds: ["lifestyle-dressing-corner", "lifestyle-window-reading-corner", "lifestyle-home-wardrobe"],
    spatialAnchors: ["wardrobe plane", "window light", "chair edge", "quiet interior floor", "continuation toward the room"],
  },
  COMMERCIAL_PRODUCT_CRAFT: {
    id: "COMMERCIAL_PRODUCT_CRAFT",
    label: "真实穿着中的材质与结构观察",
    sceneIds: ["lifestyle-dressing-corner", "lifestyle-home-wardrobe", "lifestyle-entryway-departure"],
    spatialAnchors: ["dressing surface", "wardrobe edge", "ankle-to-floor relationship", "brief standing pause", "exit line"],
  },
  COMMERCIAL_NEW_ARRIVAL: {
    id: "COMMERCIAL_NEW_ARRIVAL",
    label: "新品进入真实城市生活",
    sceneIds: ["lifestyle-cafe-exterior", "lifestyle-city-corner", "lifestyle-weekend-city-walk"],
    spatialAnchors: ["cafe frontage", "curb line", "city corner", "pause before continuing", "continuing street direction"],
  },
};

export function resolveCommercialIntent(
  intent: CommercialIntentId
): CommercialIntentDefinition | undefined {
  return COMMERCIAL_INTENT_CATALOG.find((entry) => entry.id === intent);
}
