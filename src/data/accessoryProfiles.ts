import type { ChinaCityProfile } from "./chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "./outfitDiversityRules";
import type { TeamSeason } from "../types";

export type AccessoryStrategy =
  | "noAccessory"
  | "wearableOnly"
  | "bagAsSecondaryAccessory"
  | "bagAsPrimaryHandheldObject"
  | "handheldOnly"
  | "minimalMixed";

export type AccessoryProfileCategory =
  | "bagAccessory"
  | "wearableAccessory"
  | "handheldObject"
  | "noAccessory";

export const accessoryProfiles: Record<AccessoryProfileCategory, string[]> = {
  bagAccessory: [
    "shoulder bag",
    "crossbody bag",
    "structured tote",
    "canvas tote",
    "woven bag",
    "small handbag",
    "gym tote",
    "travel tote"
  ],
  wearableAccessory: [
    "subtle optical glasses",
    "understated sunglasses only outdoor",
    "simple watch",
    "slim leather belt",
    "subtle gold earrings",
    "hair clip",
    "soft scarf",
    "thin scarf",
    "clean low socks",
    "wool socks",
    "no-show socks"
  ],
  handheldObject: [
    "coffee cup",
    "flower bouquet",
    "book",
    "magazine",
    "phone",
    "water bottle",
    "paper bag",
    "shopping bag"
  ],
  noAccessory: [
    "no visible accessory",
    "clean outfit only",
    "hands relaxed",
    "one hand in pocket",
    "one hand adjusting sleeve",
    "one hand touching trouser pocket",
    "simple posture without props"
  ]
};

export const accessoryCountControlLine =
  "Use only the accessories that the scene truly needs. Keep accessories minimal: at most one primary handheld object and up to two small wearable accessories. Do not add a bag by default, and avoid accessory clutter.";

export const bagConflictRuleLine =
  "If a bag is hand-held, it counts as the primary handheld object. If another primary handheld object already exists, the bag may only appear as a shoulder accessory, be placed nearby, or be removed entirely. Never combine a hand-held bag with a second handheld prop.";

export const accessoryShoeVisibilityRuleLine =
  "Accessories and straps should never block, crop, or visually merge with the sneakers. Keep at least one sneaker fully visible from toe to heel and keep the stance and foot placement clean.";

export const accessoryAntiClippingLine =
  "Keep accessories physically separated from hands, wrists, sleeves, torso, legs, trouser hems, and sneakers, with believable scale, weight, gravity, and no strap or object crossing the stance and foot placement.";

export const accessoryNegativePhrases = [
  "bag in every image",
  "unnecessary bag",
  "accessory clutter",
  "oversized tote",
  "bag blocking sneakers",
  "strap cutting into shoulder",
  "bag merging with torso",
  "hand-held bag plus a second handheld prop",
  "too many props",
  "props competing with shoes",
  "accessories crossing legs",
  "scarf hiding outfit structure",
  "sunglasses indoor",
  "random jewelry",
  "loud logo accessories"
];

export const indoorAccessoryNegativePhrases = ["sunglasses indoors", "unnecessary outdoor accessories"];

export const gymAccessoryNegativePhrases = [
  "gym bag in every image",
  "sports brand prop pile",
  "water bottle plus dumbbell"
];

export const stillLifeAccessoryNegativePhrases = [
  "human accessories as props",
  "bag competing with product"
];

export const seasonAccessoryPreferences: Record<
  TeamSeason,
  {
    preferredWearables: string[];
    preferredBags: string[];
    forbidden: string[];
  }
> = {
  春: {
    preferredWearables: ["subtle gold earrings", "thin scarf", "simple watch", "subtle optical glasses"],
    preferredBags: ["small shoulder bag", "canvas tote"],
    forbidden: ["heavy scarf", "winter bag", "dark heavy tote"]
  },
  夏: {
    preferredWearables: ["understated sunglasses only outdoor", "simple watch", "no-show socks"],
    preferredBags: ["small shoulder bag", "woven bag", "canvas tote"],
    forbidden: ["sunglasses indoors", "heavy scarf", "thick leather tote in every image"]
  },
  秋: {
    preferredWearables: ["slim leather belt", "soft scarf", "subtle optical glasses", "simple watch"],
    preferredBags: ["leather shoulder bag", "crossbody bag"],
    forbidden: ["scarf plus bag every time"]
  },
  冬: {
    preferredWearables: ["soft scarf", "wool socks", "simple watch", "subtle optical glasses"],
    preferredBags: ["leather shoulder bag", "structured tote"],
    forbidden: ["scarf hiding outfit", "scarf hiding shoes"]
  }
};

export const cityAccessoryPreferences: Record<
  ChinaCityProfile,
  {
    preferredWearables: string[];
    preferredBags: string[];
    avoid: string[];
  }
> = {
  Shanghai: {
    preferredWearables: ["subtle optical glasses", "slim leather belt", "simple watch"],
    preferredBags: ["small shoulder bag", "crossbody bag"],
    avoid: ["repeated large bag"]
  },
  Chengdu: {
    preferredWearables: ["hair clip", "simple watch", "thin scarf"],
    preferredBags: ["canvas tote", "relaxed shoulder bag"],
    avoid: ["overly structured office bag"]
  },
  Shenzhen: {
    preferredWearables: ["simple watch", "no-show socks"],
    preferredBags: ["light taupe shoulder bag", "clean canvas tote"],
    avoid: ["heavy accessories"]
  },
  Hangzhou: {
    preferredWearables: ["soft scarf", "subtle gold earrings", "subtle optical glasses"],
    preferredBags: ["small shoulder bag"],
    avoid: ["loud decorative accessories"]
  },
  Beijing: {
    preferredWearables: ["soft scarf", "subtle optical glasses", "slim leather belt"],
    preferredBags: ["structured tote", "leather shoulder bag"],
    avoid: ["structured tote in every image"]
  },
  GenericChineseCity: {
    preferredWearables: ["simple watch", "subtle gold earrings", "subtle optical glasses"],
    preferredBags: ["small shoulder bag", "canvas tote"],
    avoid: ["default bag"]
  }
};

export const outdoorAccessoryScenes: StandardSceneKey[] = [
  "commute",
  "cafeExterior",
  "weekendCityWalk",
  "boutiqueStreet",
  "flowerShop",
  "bakeryDessert",
  "bookstoreMagazine",
  "premiumErrands",
  "gymCommute",
  "cityCorner",
  "entrywayDeparture"
];
