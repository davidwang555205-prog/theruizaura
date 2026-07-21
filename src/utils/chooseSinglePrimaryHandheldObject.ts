import type { TeamGarmentTypePreference, TeamImageType, TeamScenePreference } from "../types";
import type { PrimaryHandheldObject } from "../data/handheldObjectProfiles";

export type SinglePrimaryHandheldObjectInput = {
  scenePreference: TeamScenePreference;
  imageType: TeamImageType;
  actionType?: string;
  userExtraRequirement: string;
  selectedOutfitLine: string;
  selectedAccessoryLine?: string;
  garmentTypePreference: TeamGarmentTypePreference;
  forceNoHandheldObject?: boolean;
};

export type SinglePrimaryHandheldObjectOutput = {
  primaryHandheldObject: PrimaryHandheldObject | "";
  removedHandheldObjects: PrimaryHandheldObject[];
  accessoryOnlyObjects: string[];
  handheldObjectLine: string;
  fallbackReason: string;
};

type ObjectRule = {
  object: PrimaryHandheldObject;
  keywords: string[];
};

const OBJECT_RULES: ObjectRule[] = [
  { object: "coffee cup", keywords: ["咖啡", "coffee", "coffee cup", "drink cup", "饮品"] },
  { object: "small or medium flower bouquet", keywords: ["花束", "鲜花", "花", "flowers", "flower bouquet", "bouquet"] },
  { object: "book or magazine", keywords: ["书", "杂志", "book", "magazine"] },
  { object: "phone", keywords: ["手机", "phone", "smartphone", "mirror selfie", "对镜", "镜拍", "自拍"] },
  { object: "water bottle", keywords: ["水瓶", "water bottle", "bottle"] },
  { object: "light dumbbell", keywords: ["哑铃", "dumbbell", "light dumbbell"] },
  { object: "small bakery paper bag", keywords: ["面包袋", "烘焙袋", "bakery paper bag", "bakery bag"] },
  { object: "small shopping bag", keywords: ["购物袋", "shopping bag", "纸袋", "paper bag"] },
  { object: "gym tote held by hand", keywords: ["健身包", "gym tote", "gym bag"] },
  { object: "travel tote held by hand", keywords: ["旅行托特", "travel tote", "travel bag"] },
  { object: "structured tote held by hand", keywords: ["托特", "tote", "tote bag", "手提包", "拎包"] },
  { object: "small handbag held by hand", keywords: ["handbag", "小手包", "小包", "手包"] },
  { object: "small luggage handle", keywords: ["行李箱", "luggage", "suitcase", "行李"] },
  { object: "umbrella", keywords: ["伞", "umbrella"] },
  { object: "sunglasses held in hand", keywords: ["墨镜", "太阳镜", "sunglasses"] },
  { object: "hat held in hand", keywords: ["帽子", "hat"] },
  { object: "towel held in hand", keywords: ["毛巾", "towel"] }
];

const BAG_OBJECTS: PrimaryHandheldObject[] = [
  "structured tote held by hand",
  "gym tote held by hand",
  "travel tote held by hand",
  "small handbag held by hand",
  "small shopping bag",
  "small bakery paper bag",
  "small luggage handle"
];

const REMOVAL_PATTERNS: Record<PrimaryHandheldObject, RegExp[]> = {
  "coffee cup": [/手?拿?咖啡(和|与|、)?/gi, /coffee\s+cup/gi, /\bcoffee\b/gi, /\bdrink\s+cup\b/gi],
  "small or medium flower bouquet": [/手?拿?(花束|鲜花|花)(和|与|、)?/gi, /flower\s+bouquet/gi, /\bflowers?\b/gi, /\bbouquet\b/gi],
  "book or magazine": [/手?拿?(书|杂志)(和|与|、)?/gi, /\bbooks?\b/gi, /\bmagazines?\b/gi],
  phone: [/手?拿?手机(和|与|、)?/gi, /手机遮脸[,，]?/gi, /\bphone\b/gi, /\bsmartphone\b/gi],
  "water bottle": [/手?拿?水瓶(和|与|、)?/gi, /water\s+bottle/gi, /\bbottle\b/gi],
  "light dumbbell": [/手?拿?哑铃(和|与|、)?/gi, /light\s+dumbbell/gi, /\bdumbbell\b/gi],
  "small bakery paper bag": [/手?拿?(面包袋|烘焙袋)(和|与|、)?/gi, /bakery\s+paper\s+bag/gi, /bakery\s+bag/gi],
  "small shopping bag": [/手?拿?(购物袋|纸袋)(和|与|、)?/gi, /shopping\s+bag/gi, /paper\s+bag/gi],
  "structured tote held by hand": [/手?拿?(托特|托特包|手提包|拎包)(和|与|、)?/gi, /tote\s+bag/gi, /\btote\b/gi],
  "gym tote held by hand": [/手?拿?(健身包)(和|与|、)?/gi, /gym\s+tote/gi, /gym\s+bag/gi],
  "travel tote held by hand": [/手?拿?(旅行托特|旅行包)(和|与|、)?/gi, /travel\s+tote/gi, /travel\s+bag/gi],
  "small handbag held by hand": [/手?拿?(小手包|小包|手包)(和|与|、)?/gi, /\bhandbag\b/gi],
  "small luggage handle": [/(行李箱|行李)(和|与|、)?/gi, /\bluggage\b/gi, /\bsuitcase\b/gi],
  umbrella: [/手?拿?伞(和|与|、)?/gi, /\bumbrella\b/gi],
  "sunglasses held in hand": [/手?拿?(墨镜|太阳镜)(和|与|、)?/gi, /\bsunglasses\b/gi],
  "hat held in hand": [/手?拿?帽子(和|与|、)?/gi, /\bhat\b/gi],
  "towel held in hand": [/手?拿?毛巾(和|与|、)?/gi, /\btowel\b/gi]
};

function includesAny(text: string, keywords: string[]) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

function uniqueObjects(objects: PrimaryHandheldObject[]) {
  return Array.from(new Set(objects));
}

function detectObjects(text: string) {
  return uniqueObjects(
    OBJECT_RULES.filter((rule) => includesAny(text, rule.keywords)).map((rule) => rule.object)
  );
}

function getScenePriority(input: SinglePrimaryHandheldObjectInput): PrimaryHandheldObject[] {
  const text = `${input.scenePreference} ${input.userExtraRequirement} ${input.actionType ?? ""}`.toLowerCase();

  if (input.imageType === "对镜穿搭图" || includesAny(text, ["对镜", "镜拍", "mirror selfie"])) return ["phone"];
  if (input.scenePreference === "健身房内" || includesAny(text, ["gyminterior", "健身房内"])) return ["water bottle", "light dumbbell"];
  if (input.scenePreference === "去运动的路上" || includesAny(text, ["gymcommute", "去运动"])) return ["water bottle"];
  if (input.scenePreference === "酒店咖啡厅内") return ["coffee cup"];
  if (input.scenePreference === "旅行酒店" || includesAny(text, ["hotel", "酒店", "旅行"])) return [];
  if (input.scenePreference === "通勤上班" || includesAny(text, ["commute", "通勤"])) return [];
  if (input.scenePreference === "精品超市 / 日常采购" || includesAny(text, ["premiumerrands", "grocery", "采购", "超市"])) {
    return [];
  }
  if (input.scenePreference === "朋友午餐" || input.scenePreference === "美术馆") return [];
  if (input.scenePreference === "咖啡馆内") return ["coffee cup"];
  if (includesAny(text, ["cafeexterior", "cafe exterior", "cafe storefront", "café exterior", "咖啡店", "咖啡馆"])) {
    return ["coffee cup"];
  }
  if (includesAny(text, ["flowershop", "flower shop", "花店", "鲜花店"])) return ["small or medium flower bouquet"];
  if (includesAny(text, ["bakerydessert", "bakery", "bakery storefront", "面包店", "烘焙店"])) {
    return ["small bakery paper bag", "coffee cup"];
  }
  if (includesAny(text, ["bookstoremagazine", "bookstore", "magazine shop", "书店", "杂志店"])) return ["book or magazine"];
  if (includesAny(text, ["boutique", "精品店", "买手店"])) return [];
  if (input.scenePreference === "周末城市散步") return [];

  return [];
}

function chooseByPriority(candidates: PrimaryHandheldObject[], priority: PrimaryHandheldObject[]) {
  if (!candidates.length) return "";
  const prioritized = priority.find((object) => candidates.includes(object));
  return prioritized ?? candidates[0];
}

function getAccessoryOnlyObjects(primary: PrimaryHandheldObject | "", detectedObjects: PrimaryHandheldObject[]) {
  const accessoryOnly: string[] = [];

  if (primary && !BAG_OBJECTS.includes(primary) && detectedObjects.some((object) => BAG_OBJECTS.includes(object))) {
    accessoryOnly.push("any bag should be shoulder-carried, crossbody, placed nearby, or used as a secondary accessory, not hand-held");
  }

  if (primary === "phone") {
    accessoryOnly.push("any bag may sit on shoulder, rest at the side, or be placed nearby, but it must not become a second hand-held object");
  }

  return accessoryOnly;
}

export function chooseSinglePrimaryHandheldObject(
  input: SinglePrimaryHandheldObjectInput
): SinglePrimaryHandheldObjectOutput {
  const userObjects = detectObjects(input.userExtraRequirement);
  const contextObjects = detectObjects(`${input.actionType ?? ""} ${input.selectedOutfitLine} ${input.selectedAccessoryLine ?? ""}`);
  const scenePriority = getScenePriority(input);
  const allDetected = uniqueObjects([...userObjects, ...contextObjects]);
  let primary: PrimaryHandheldObject | "" = "";
  let fallbackReason = "";

  if (input.forceNoHandheldObject) {
    primary = "";
    fallbackReason = "The multi-image lifestyle set keeps hands empty for handheld-object continuity.";
  } else if (input.imageType === "对镜穿搭图") {
    primary = "phone";
    fallbackReason = "Mirror outfit images use the phone as the only primary handheld object.";
  } else if (userObjects.length === 1) {
    primary = userObjects[0];
    fallbackReason = "User specified one handheld object.";
  } else if (userObjects.length > 1) {
    primary = chooseByPriority(userObjects, scenePriority);
    fallbackReason = "User specified multiple handheld objects; kept the most scene-compatible one.";
  } else if (scenePriority.length) {
    primary = scenePriority[0];
    fallbackReason = "Selected one default handheld object by scene.";
  }

  const removed = input.forceNoHandheldObject
    ? []
    : primary
      ? allDetected.filter((object) => object !== primary)
      : allDetected;
  const accessoryOnlyObjects = getAccessoryOnlyObjects(primary, allDetected);
  const handheldObjectLine = primary
    ? `Use only one primary handheld object: ${primary}. Do not add any second hand-held prop.`
    : "No extra handheld props; keep hands relaxed and natural, or let one hand adjust a sleeve or clothing edge, rest by the side, or move with a small walking gesture.";

  return {
    primaryHandheldObject: primary,
    removedHandheldObjects: uniqueObjects(removed),
    accessoryOnlyObjects,
    handheldObjectLine,
    fallbackReason
  };
}

export function sanitizeUserExtraRequirementForSingleHandheldObject(
  userExtraRequirement: string,
  removedHandheldObjects: PrimaryHandheldObject[]
) {
  if (!userExtraRequirement.trim() || !removedHandheldObjects.length) return userExtraRequirement;

  let output = userExtraRequirement;
  removedHandheldObjects.forEach((object) => {
    REMOVAL_PATTERNS[object].forEach((pattern) => {
      output = output.replace(pattern, "");
    });
  });

  return output
    .replace(/(和|与|、)\s*(,|，|。|\.)/g, "$2")
    .replace(/(和|与|、)\s*$/g, "")
    .replace(/,\s*,/g, ",")
    .replace(/，\s*，/g, "，")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,，。.!?])/g, "$1")
    .trim();
}
