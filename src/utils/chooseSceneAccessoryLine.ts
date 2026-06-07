import type {
  AccessoryStrategy
} from "../data/accessoryProfiles";
import {
  accessoryAntiClippingLine,
  accessoryCountControlLine,
  accessoryNegativePhrases,
  accessoryShoeVisibilityRuleLine,
  bagConflictRuleLine,
  cityAccessoryPreferences,
  gymAccessoryNegativePhrases,
  indoorAccessoryNegativePhrases,
  outdoorAccessoryScenes,
  seasonAccessoryPreferences,
  stillLifeAccessoryNegativePhrases
} from "../data/accessoryProfiles";
import type { ChinaCityProfile } from "../data/chinaUrbanStreetProfiles";
import type { StandardSceneKey } from "../data/outfitDiversityRules";
import type {
  TeamGarmentType,
  TeamHumanPoseCategory,
  TeamImageType,
  TeamOutfitStyle,
  TeamPromptMode,
  TeamSeason
} from "../types";

export type SceneAccessoryInput = {
  sceneKey: StandardSceneKey;
  imageType: TeamImageType;
  season: TeamSeason;
  cityProfile: ChinaCityProfile | null;
  selectedOutfit?: {
    bagCategory?: string | null;
    accessoryCategory?: string[] | null;
  } | null;
  selectedGarmentType?: TeamGarmentType | null;
  selectedOutfitStyle?: TeamOutfitStyle | null;
  selectedPrimaryHandheldObject?: string | null;
  poseCategory: TeamHumanPoseCategory;
  userExtraRequirement: string;
  promptMode: TeamPromptMode;
};

export type SceneAccessoryOutput = {
  accessoryStrategy: AccessoryStrategy;
  selectedBagAccessory: string | null;
  selectedWearableAccessories: string[];
  noAccessoryReason: string;
  accessoryLine: string;
  accessoryNegativeLine: string;
};

const PEOPLE_IMAGE_TYPES: TeamImageType[] = ["产品上脚图", "对镜穿搭图", "生活场景图"];
const BAG_PRIMARY_PATTERN = /\b(tote|bag|handbag|luggage|shopping bag|paper bag|bakery paper bag)\b/i;

function hashText(text: string) {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickOne(options: string[], seed: string) {
  if (!options.length) return null;
  return options[hashText(seed) % options.length];
}

function unique(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function isOutdoorScene(sceneKey: StandardSceneKey) {
  return outdoorAccessoryScenes.includes(sceneKey);
}

function isIndoorScene(sceneKey: StandardSceneKey, imageType: TeamImageType) {
  return (
    imageType === "对镜穿搭图" ||
    imageType === "产品静物图" ||
    imageType === "拍摄花絮 / 材质图" ||
    ["mirrorCloset", "hotelTravel", "gymInterior", "materialTable", "stillLife", "bookstoreMagazine"].includes(sceneKey)
  );
}

function isBagPrimaryObject(primary: string | null | undefined) {
  return Boolean(primary && BAG_PRIMARY_PATTERN.test(primary));
}

function getAccessoryCityProfile(cityProfile: ChinaCityProfile | null): ChinaCityProfile {
  return cityProfile ?? "GenericChineseCity";
}

function chooseWearables(input: SceneAccessoryInput) {
  const seasonProfile = seasonAccessoryPreferences[input.season];
  const normalizedCity = getAccessoryCityProfile(input.cityProfile);
  const cityProfile = cityAccessoryPreferences[normalizedCity];
  const isOutdoor = isOutdoorScene(input.sceneKey);
  const pool = unique([
    ...(input.selectedOutfit?.accessoryCategory ?? []),
    ...cityProfile.preferredWearables,
    ...seasonProfile.preferredWearables
  ]).filter((item) => {
    if (/sunglasses/i.test(item)) return isOutdoor && !isIndoorScene(input.sceneKey, input.imageType);
    if (input.sceneKey === "gymInterior" && /scarf|belt|earrings/i.test(item)) return false;
    return true;
  });

  const countSeed = hashText(`${input.sceneKey}|${input.season}|${normalizedCity}|${input.userExtraRequirement}`);
  const targetCount = input.sceneKey === "gymInterior" || input.poseCategory === "mirror" ? countSeed % 2 : (countSeed % 3);
  const selected: string[] = [];
  let cursor = countSeed;

  while (selected.length < targetCount && pool.length) {
    const picked = pool[cursor % pool.length];
    if (!selected.includes(picked)) selected.push(picked);
    cursor = Math.floor(cursor / 7) + 3;
    if (selected.length >= pool.length) break;
  }

  return selected.slice(0, 2);
}

function chooseBag(input: SceneAccessoryInput) {
  const normalizedCity = getAccessoryCityProfile(input.cityProfile);
  const seed = `${input.sceneKey}|${input.season}|${normalizedCity}|${input.selectedOutfitStyle ?? ""}|${input.selectedGarmentType ?? ""}`;
  const outfitBag = input.selectedOutfit?.bagCategory?.replace(/\s+as\s+a\s+secondary\s+accessory/i, "").trim();
  const seasonBags = seasonAccessoryPreferences[input.season].preferredBags;
  const cityBags = cityAccessoryPreferences[normalizedCity].preferredBags;
  const sceneBags: Partial<Record<StandardSceneKey, string[]>> = {
    commute: ["small shoulder bag", "crossbody bag", "structured tote placed at the side"],
    cafeExterior: ["small shoulder bag", "crossbody bag"],
    weekendCityWalk: ["small shoulder bag", "canvas tote worn on shoulder"],
    boutiqueStreet: ["small shopping bag placed low at the side", "small shoulder bag"],
    premiumErrands: ["canvas tote worn on shoulder", "small paper shopping bag as the only primary object"],
    hotelTravel: ["travel tote placed nearby", "small shoulder bag"],
    gymCommute: ["gym tote placed nearby", "small shoulder bag"],
    gymInterior: ["gym tote placed on bench or floor, not in hand"],
    mirrorCloset: ["small bag placed nearby or worn quietly on shoulder"]
  };

  const pool = unique([...(outfitBag ? [outfitBag] : []), ...(sceneBags[input.sceneKey] ?? []), ...cityBags, ...seasonBags]);
  return pickOne(pool, seed);
}

function chooseStrategy(input: SceneAccessoryInput): AccessoryStrategy {
  if (!PEOPLE_IMAGE_TYPES.includes(input.imageType)) return "noAccessory";
  if (input.sceneKey === "stillLife" || input.sceneKey === "materialTable") return "noAccessory";

  const normalizedCity = getAccessoryCityProfile(input.cityProfile);
  const seed = hashText(
    `${input.sceneKey}|${input.imageType}|${input.season}|${normalizedCity}|${input.selectedPrimaryHandheldObject ?? ""}|${input.userExtraRequirement}`
  );
  const primary = input.selectedPrimaryHandheldObject ?? "";
  const hasPrimary = Boolean(primary);

  if (input.imageType === "对镜穿搭图" || input.sceneKey === "mirrorCloset" || input.poseCategory === "mirror") {
    return primary ? "handheldOnly" : seed % 3 === 0 ? "wearableOnly" : "noAccessory";
  }

  if (isBagPrimaryObject(primary)) return "bagAsPrimaryHandheldObject";

  if (hasPrimary) {
    if (input.sceneKey === "flowerShop" || input.sceneKey === "bakeryDessert" || input.sceneKey === "bookstoreMagazine") {
      return seed % 3 === 0 ? "minimalMixed" : "handheldOnly";
    }
    if (input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute") return seed % 2 === 0 ? "handheldOnly" : "wearableOnly";
    return seed % 4 === 0 ? "minimalMixed" : "handheldOnly";
  }

  if (input.sceneKey === "commute") return seed % 10 < 6 ? "bagAsSecondaryAccessory" : seed % 2 === 0 ? "wearableOnly" : "noAccessory";
  if (input.sceneKey === "premiumErrands") return seed % 10 < 5 ? "bagAsSecondaryAccessory" : "wearableOnly";
  if (input.sceneKey === "boutiqueStreet") return seed % 10 < 5 ? "bagAsSecondaryAccessory" : "wearableOnly";
  if (input.sceneKey === "hotelTravel") return seed % 10 < 4 ? "bagAsSecondaryAccessory" : "noAccessory";
  if (input.sceneKey === "weekendCityWalk") return seed % 10 < 3 ? "bagAsSecondaryAccessory" : seed % 2 === 0 ? "wearableOnly" : "noAccessory";
  if (input.sceneKey === "gymInterior") return seed % 5 === 0 ? "wearableOnly" : "noAccessory";
  if (input.sceneKey === "gymCommute") return seed % 10 < 3 ? "bagAsSecondaryAccessory" : "wearableOnly";

  return seed % 4 === 0 ? "bagAsSecondaryAccessory" : seed % 2 === 0 ? "wearableOnly" : "noAccessory";
}

function getNoAccessoryReason(sceneKey: StandardSceneKey, strategy: AccessoryStrategy) {
  if (strategy !== "noAccessory") return "";
  if (sceneKey === "mirrorCloset") return "the phone and outfit relationship are enough for the mirror image.";
  if (sceneKey === "gymInterior") return "the clean gym movement should stay uncluttered.";
  if (sceneKey === "stillLife" || sceneKey === "materialTable") return "this scene uses material or product props, not human accessories.";
  return "the outfit and sneakers should stay clean, readable, and uncluttered.";
}

function buildAccessoryLine(input: {
  strategy: AccessoryStrategy;
  bag: string | null;
  wearables: string[];
  noAccessoryReason: string;
  primary: string;
}) {
  const wearableLine = input.wearables.length ? `Use only light wearable accessories: ${input.wearables.join(", ")}.` : "";

  if (input.strategy === "noAccessory") {
    return [
      accessoryCountControlLine,
      `Do not add a visible bag or extra handheld prop; ${input.noAccessoryReason} Hands may stay relaxed, one hand may rest in a pocket, or one hand may adjust a sleeve.`
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (input.strategy === "wearableOnly") {
    return [
      accessoryCountControlLine,
      wearableLine || "Use only very subtle wearable details if needed.",
      "Do not add a visible bag or extra handheld prop."
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (input.strategy === "bagAsSecondaryAccessory") {
    return [
      accessoryCountControlLine,
      `Use one ${input.bag ?? "small shoulder bag"} only as a secondary shoulder, crossbody, side, or nearby accessory, never as a second hand-held prop.`,
      wearableLine,
      bagConflictRuleLine,
      accessoryAntiClippingLine
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (input.strategy === "bagAsPrimaryHandheldObject") {
    return [
      accessoryCountControlLine,
      `Use the ${input.primary || input.bag || "bag"} as the only primary handheld object; remove coffee, flowers, books, phones, water bottles, and other hand-held props.`,
      wearableLine,
      accessoryAntiClippingLine
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (input.strategy === "handheldOnly") {
    return [
      accessoryCountControlLine,
      `Use the selected primary handheld object only${input.primary ? `: ${input.primary}` : ""}. Do not add a hand-held bag or second prop.`,
      wearableLine,
      bagConflictRuleLine
    ]
      .filter(Boolean)
      .join(" ");
  }

  return [
    accessoryCountControlLine,
    `Keep the selected primary handheld object${input.primary ? ` (${input.primary})` : ""} as the only object in hand; any bag must be absent, shoulder-carried, placed nearby, or clearly secondary.`,
    wearableLine,
    bagConflictRuleLine,
    accessoryAntiClippingLine
  ]
    .filter(Boolean)
    .join(" ");
}

export function chooseSceneAccessoryLine(input: SceneAccessoryInput): SceneAccessoryOutput {
  const strategy = chooseStrategy(input);
  const bag = strategy === "bagAsSecondaryAccessory" || strategy === "bagAsPrimaryHandheldObject" || strategy === "minimalMixed"
    ? chooseBag(input)
    : null;
  const wearables = strategy === "noAccessory" || strategy === "handheldOnly" ? [] : chooseWearables(input);
  const noAccessoryReason = getNoAccessoryReason(input.sceneKey, strategy);
  const primary = input.selectedPrimaryHandheldObject ?? "";
  const negativePhrases = [
    ...accessoryNegativePhrases,
    ...(isIndoorScene(input.sceneKey, input.imageType) ? indoorAccessoryNegativePhrases : []),
    ...(input.sceneKey === "gymInterior" || input.sceneKey === "gymCommute" ? gymAccessoryNegativePhrases : []),
    ...(input.sceneKey === "stillLife" || input.sceneKey === "materialTable" ? stillLifeAccessoryNegativePhrases : [])
  ];

  return {
    accessoryStrategy: strategy,
    selectedBagAccessory: bag,
    selectedWearableAccessories: wearables,
    noAccessoryReason,
    accessoryLine: buildAccessoryLine({
      strategy,
      bag,
      wearables,
      noAccessoryReason,
      primary
    }),
    accessoryNegativeLine: `Avoid ${Array.from(new Set(negativePhrases)).join(", ")}.`
  };
}
